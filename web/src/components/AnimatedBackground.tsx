import { memo } from 'react';

/**
 * Lightweight animated background — static CSS gradient only.
 * Previous version rendered 30 blurred/shadowed divs with individual
 * pulse animations, causing constant GPU compositing and layout thrashing.
 * This version uses a single CSS gradient with a subtle animation.
 */
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-700 bg-gradient-to-br from-[#f0f9ff]/80 via-[#e0f2fe]/60 to-[#f0fdfa]/80 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/90">
      {/* Single animated gradient — replaces 30 individual star divs */}
      <div className="absolute inset-x-0 -top-40 -bottom-40 bg-[linear-gradient(135deg,#bae6fd22,#99f6e422,#fed7aa22)] dark:bg-[linear-gradient(135deg,#0f172a88,#1e293b88,#042f2e88)] bg-[length:400%_400%] animate-gradient-x opacity-70 mix-blend-multiply dark:mix-blend-screen transition-colors duration-700" />
    </div>
  );
}

export default memo(AnimatedBackground);
