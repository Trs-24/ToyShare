'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect /dashboard to /profile?tab=items for backward compatibility
export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile?tab=items');
  }, [router]);

  return null;
}
