'use client';

interface AlertProps {
  message: string;
  className?: string; 
}

export default function Alert({ message, className = "" }: AlertProps) {
  return (
    <div className={className}>
      {message}
    </div>
  );
}
