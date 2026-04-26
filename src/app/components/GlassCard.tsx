import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div
      className={`backdrop-blur-lg bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-6 ${className}`}
    >
      {children}
    </div>
  );
}
