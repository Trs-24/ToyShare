import { memo } from 'react';

interface EmptyStateProps {
  icon?: string;
  message: string;
  className?: string;
}

/** Reusable empty state display. Replaces 4+ copy-paste emoji+message blocks. */
const EmptyState = memo(function EmptyState({
  icon = '📦',
  message,
  className = 'text-center py-16 text-gray-400 dark:text-gray-500',
}: EmptyStateProps) {
  return (
    <div className={className}>
      <p className="text-5xl mb-4">{icon}</p>
      <p className="text-lg">{message}</p>
    </div>
  );
});

export default EmptyState;
