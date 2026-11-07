import React from 'react';
import { Gamepad2 } from 'lucide-react';

interface GameOutLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

export const GameOutLogo: React.FC<GameOutLogoProps> = ({
  className = '',
  size = 'md',
  onClick
}) => {
  const sizeClasses = {
    sm: {
      text: 'text-xl tracking-tight font-extrabold',
      circle: 'w-5 h-5 mx-[1px]',
      icon: 'w-3 h-3 text-white'
    },
    md: {
      text: 'text-2xl tracking-tight font-extrabold',
      circle: 'w-6 h-6 mx-[2px]',
      icon: 'w-3.5 h-3.5 text-white'
    },
    lg: {
      text: 'text-3xl tracking-tight font-black',
      circle: 'w-8 h-8 mx-[2.5px]',
      icon: 'w-4.5 h-4.5 text-white'
    },
    xl: {
      text: 'text-4xl tracking-tight font-black',
      circle: 'w-10 h-10 mx-[3px]',
      icon: 'w-6 h-6 text-white'
    }
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center font-sans select-none cursor-pointer text-[#1768DF] hover:opacity-95 transition-opacity ${className}`}
      aria-label="GameOut Home"
    >
      <span className={sizeClasses.text}>Game</span>
      <span
        className={`inline-flex items-center justify-center rounded-full bg-[#1768DF] shadow-xs ${sizeClasses.circle}`}
      >
        <Gamepad2 className={sizeClasses.icon} strokeWidth={2.4} />
      </span>
      <span className={sizeClasses.text}>ut</span>
    </div>
  );
};
