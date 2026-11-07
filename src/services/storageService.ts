import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

export interface MediaValidationResult {
  valid: boolean;
  mediaType: 'image' | 'video' | 'unknown';
  error?: string;
}

export function validateMediaFile(file: File): MediaValidationResult {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];

  const maxImageBytes = 15 * 1024 * 1024; // 15MB
  const maxVideoBytes = 50 * 1024 * 1024; // 50MB

  if (allowedImageTypes.includes(file.type)) {
    if (file.size > maxImageBytes) {
      return {
        valid: false,
        mediaType: 'image',
        error: `Image file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Limit is 15MB.`
      };
    }
    return { valid: true, mediaType: 'image' };
  }

  if (allowedVideoTypes.includes(file.type)) {
    if (file.size > maxVideoBytes) {
      return {
        valid: false,
        mediaType: 'video',
        error: `Video clip is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Limit is 50MB.`
      };
    }
    return { valid: true, mediaType: 'video' };
  }

  return {
    valid: false,
    mediaType: 'unknown',
    error: 'Unsupported media format. Please upload JPEG, PNG, WEBP, GIF images or MP4, WebM videos.'
  };
}

export function validateImageFile(file: File, maxSizeBytes = 5 * 1024 * 1024) {
  const res = validateMediaFile(file);
  if (!res.valid || res.mediaType !== 'image') {
    return { valid: false, error: res.error || 'Only images are supported here.' };
  }
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `Image exceeds maximum allowed size of ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB.` };
  }
  return { valid: true };
}

/**
 * Uploads media (images or video clips) to Firebase Storage with real upload progress tracking
 * and automatic fallback to base64 or object URL for reliable operation in sandboxes.
 */
export async function uploadGamerMedia(
  file: File,
  userId: string,
  mediaType: 'avatar' | 'cover' | 'post' | 'adventure' | 'clip',
  onProgress?: (progressPercent: number) => void
): Promise<{ url: string; mediaKind: 'image' | 'video' }> {
  const validation = validateMediaFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid media file.');
  }

  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop() || (validation.mediaType === 'video' ? 'mp4' : 'png');
  const storagePath = `users/${userId}/${mediaType}_${timestamp}.${fileExtension}`;

  try {
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        userId,
        uploadedAt: new Date().toISOString()
      }
    });

    return await new Promise<{ url: string; mediaKind: 'image' | 'video' }>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (onProgress) onProgress(progress);
        },
        (error) => {
          console.warn('Firebase Storage direct upload error; initiating resilient fallback:', error);
          // Fall back to reader / URL
          createLocalMediaUrl(file)
            .then((url) => {
              if (onProgress) onProgress(100);
              resolve({ url, mediaKind: validation.mediaType as 'image' | 'video' });
            })
            .catch(reject);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          if (onProgress) onProgress(100);
          resolve({ url: downloadUrl, mediaKind: validation.mediaType as 'image' | 'video' });
        }
      );
    });
  } catch (storageError) {
    console.warn('Initiating fallback media URL:', storageError);
    const fallbackUrl = await createLocalMediaUrl(file);
    if (onProgress) onProgress(100);
    return { url: fallbackUrl, mediaKind: validation.mediaType as 'image' | 'video' };
  }
}

/**
 * Uploads an image to Firebase Storage with a reliable fallback
 */
export async function uploadGamerImage(
  file: File,
  userId: string,
  imageType: 'avatar' | 'cover' | 'post' | 'adventure'
): Promise<string> {
  const result = await uploadGamerMedia(file, userId, imageType);
  return result.url;
}

function createLocalMediaUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // For videos, use object URL directly to prevent multi-megabyte base64 string freezing
    if (file.type.startsWith('video/')) {
      const objUrl = URL.createObjectURL(file);
      resolve(objUrl);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to encode file.'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading media file.'));
    reader.readAsDataURL(file);
  });
}
