import { memo } from 'react';

interface SpinnerProps {
  /** Tailwind size class, default 'h-8 w-8' */
  size?: string;
  /** Tailwind color class for border, default 'border-teal-500' */
  color?: string;
  /** Optional wrapper className for centering */
  className?: string;
}

/** Reusable loading spinner. Replaces 8+ hardcoded spinner divs across the app. */
const Spinner = memo(function Spinner({
  size = 'h-8 w-8',
  color = 'border-teal-500',
  className = 'flex justify-center py-16',
}: SpinnerProps) {
  return (
    <div className={className}>
      <div className={`animate-spin rounded-full ${size} border-b-2 ${color}`} />
    </div>
  );
});

export default Spinner;
