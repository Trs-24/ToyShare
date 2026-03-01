'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { getMediaUrl } from '@/lib/utils';

interface OptimizedImageProps {
  /** Raw URL from API — will be resolved via getMediaUrl */
  src: string;
  alt: string;
  /** Fill the parent container (default). Turn off for fixed-size images. */
  fill?: boolean;
  width?: number;
  height?: number;
  /** Next.js sizes hint for responsive images */
  sizes?: string;
  className?: string;
  /** Mark above-the-fold images as priority for instant load */
  priority?: boolean;
  /** Fallback emoji when no src or load error */
  fallback?: string;
}

/**
 * Optimized image wrapper around next/image.
 * - Auto-resolves URLs via getMediaUrl()
 * - Converts to WebP/AVIF automatically
 * - Built-in lazy loading (unless priority=true)
 * - Graceful fallback on error
 */
const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  fill = true,
  width,
  height,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  className = 'object-cover',
  priority = false,
  fallback = '🧸',
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const resolvedUrl = getMediaUrl(src);

  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-100 dark:bg-slate-800">
        {fallback}
      </div>
    );
  }

  // For external URLs (Cloudinary, Google) — use next/image
  // For relative API URLs — use native img (they come from backend, not optimizable by Next.js)
  if (resolvedUrl.startsWith('http')) {
    if (fill) {
      return (
        <Image
          src={resolvedUrl}
          alt={alt}
          fill
          sizes={sizes}
          className={className}
          priority={priority}
          onError={() => setError(true)}
        />
      );
    }
    return (
      <Image
        src={resolvedUrl}
        alt={alt}
        width={width || 200}
        height={height || 200}
        sizes={sizes}
        className={className}
        priority={priority}
        onError={() => setError(true)}
      />
    );
  }

  // Fallback: relative backend URL — native img with lazy loading
  return (
    <img
      src={resolvedUrl}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
      onError={() => setError(true)}
    />
  );
});

export default OptimizedImage;
