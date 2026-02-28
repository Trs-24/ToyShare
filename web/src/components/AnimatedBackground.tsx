export default function AnimatedBackground() {
  // Generate random stable coordinates for stars to avoid hydration mismatch
  const stars = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: `${(i * 13) % 100}%`,
    top: `${(i * 17) % 100}%`,
    size: Math.max(2, (i * 3) % 6),
    delay: `${(i * 7) % 5}s`,
    duration: `${3 + ((i * 5) % 4)}s`,
  }));

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-700 bg-gradient-to-br from-[#f0f9ff]/80 via-[#e0f2fe]/60 to-[#f0fdfa]/80 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/90">
      {/* Dynamic Animated Base Gradient */}
      <div className="absolute inset-x-0 -top-40 -bottom-40 bg-[linear-gradient(135deg,#bae6fd22,#99f6e422,#fed7aa22)] dark:bg-[linear-gradient(135deg,#0f172a88,#1e293b88,#042f2e88)] bg-[length:400%_400%] animate-gradient-x opacity-70 mix-blend-multiply dark:mix-blend-screen transition-colors duration-700" />

      {/* Twinkling Stars Layer */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={`star-${star.id}`}
            className="absolute rounded-full bg-teal-400/20 dark:bg-white/10 blur-[1px] shadow-[0_0_8px_rgba(45,212,191,0.4)] dark:shadow-[0_0_8px_rgba(255,255,255,0.2)] animate-pulse-slow transition-colors duration-700"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>

      {/* Light Overlay for depth */}
      <div className="absolute inset-0 bg-white/5 dark:bg-black/20 backdrop-blur-[1px] transition-colors duration-700" />
    </div>
  );
}
