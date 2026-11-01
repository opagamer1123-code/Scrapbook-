import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  type: 'petal' | 'heart' | 'sparkle';
  rotation: number;
  opacity: number;
}

export const FloatingPetals: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Generate restrained, delicate batch of slow-drifting particles
    const items: Particle[] = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 96 + 2, // percentage across viewport
      size: Math.random() * 8 + 8, // subtle size 8-16px
      duration: Math.random() * 10 + 16, // slow 16-26s fall
      delay: Math.random() * 12,
      type: i % 3 === 0 ? 'heart' : i % 3 === 1 ? 'petal' : 'sparkle',
      rotation: Math.random() * 360,
      opacity: Math.random() * 0.25 + 0.15,
    }));
    setParticles(items);
  }, []);

  if (!isEnabled) {
    return (
      <button
        onClick={() => setIsEnabled(true)}
        className="fixed bottom-4 left-4 z-40 text-xs px-2.5 py-1.5 rounded-full bg-[#FFF8ED]/80 hover:bg-[#FFF8ED] text-[#A64D68] border border-[#F8DCE5] shadow-xs transition-colors"
        title="Enable background petals"
        aria-label="Enable floating romantic petals"
      >
        🌸 Petals: Off
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-10 select-none"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-40px]"
          style={{
            left: `${p.x}%`,
            animation: `floatingPetal ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        >
          {p.type === 'petal' && (
            <svg
              width={p.size}
              height={p.size * 1.4}
              viewBox="0 0 24 32"
              fill="none"
              style={{ transform: `rotate(${p.rotation}deg)` }}
            >
              <path
                d="M12 0C18 8 24 18 20 28C16 34 8 32 4 28C0 22 6 8 12 0Z"
                fill="#F8DCE5"
                stroke="#E2A9B8"
                strokeWidth="0.8"
              />
            </svg>
          )}

          {p.type === 'heart' && (
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill="#A64D68"
              fillOpacity="0.45"
              style={{ transform: `rotate(${p.rotation * 0.2}deg)` }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}

          {p.type === 'sparkle' && (
            <svg
              width={p.size * 0.8}
              height={p.size * 0.8}
              viewBox="0 0 24 24"
              fill="#D48C9E"
              fillOpacity="0.55"
            >
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          )}
        </div>
      ))}

      <style>{`
        @keyframes floatingPetal {
          0% {
            transform: translateY(-50px) translateX(0px) rotate(0deg);
          }
          50% {
            transform: translateY(50vh) translateX(45px) rotate(180deg);
          }
          100% {
            transform: translateY(105vh) translateX(-30px) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
