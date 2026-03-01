import { memo } from 'react';
import { getStatusColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  label: string;
  className?: string;
}

/** Reusable exchange status badge. Wraps getStatusColor() + span pattern. */
const StatusBadge = memo(function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)} ${className}`}
    >
      {label}
    </span>
  );
});

export default StatusBadge;
