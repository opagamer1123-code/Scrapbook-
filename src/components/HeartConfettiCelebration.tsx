import React, { useEffect, useRef } from 'react';
import { Heart, Sparkles, X } from 'lucide-react';

interface HeartConfettiCelebrationProps {
  onDismiss: () => void;
  title?: string;
  subtitle?: string;
}

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'heart' | 'star' | 'circle';
  isGlitter: boolean;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  opacity: number;
  swaySpeed: number;
  swayDist: number;
  swayOffset: number;
}

const ROMANTIC_PALETTE = [
  '#A64D68', // Deep Rose
  '#C96B85', // Soft Rose Pink
  '#F8DCE5', // Blush Pink
  '#8E3E56', // Raspberry Rose
  '#E28FA4', // Pastel Rose
  '#D1496D', // Crimson Rose
  '#F3C68F', // Champagne Gold
  '#FFF8ED', // Warm Cream
  '#FFCCD8', // Light Blush
  '#E6A055', // Shimmer Gold
  '#B84A6E', // Ruby Rose
];

export const HeartConfettiCelebration: React.FC<HeartConfettiCelebrationProps> = ({
  onDismiss,
  title = 'She Said Yes! ♡',
  subtitle = 'A shower of love for Ekta ✨',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate 220+ high-fidelity particles for a lush explosion
    const count = Math.min(260, Math.max(160, Math.floor(width / 5.5)));
    const pieces: ConfettiPiece[] = [];

    const centerX = width / 2;
    const centerY = height * 0.48;

    for (let i = 0; i < count; i++) {
      // 65% initial radial explosion from center, 35% raining from above
      const isBurst = i < count * 0.65;
      const angle = Math.random() * Math.PI * 2;
      // High initial velocity for the explosion pop
      const burstSpeed = Math.random() * 14 + 6;

      const x = isBurst ? centerX + (Math.random() - 0.5) * 40 : Math.random() * width;
      const y = isBurst ? centerY + (Math.random() - 0.5) * 40 : -Math.random() * (height * 0.6) - 20;

      const vx = isBurst
        ? Math.cos(angle) * burstSpeed * (0.8 + Math.random() * 0.6)
        : (Math.random() - 0.5) * 3;

      const vy = isBurst
        ? Math.sin(angle) * burstSpeed * (0.8 + Math.random() * 0.6) - (Math.random() * 9 + 4)
        : Math.random() * 2.8 + 2;

      // Shapes: 70% hearts, 20% stars, 10% gold sparkles
      const shapeRand = Math.random();
      const shape: 'heart' | 'star' | 'circle' =
        shapeRand < 0.72 ? 'heart' : shapeRand < 0.9 ? 'star' : 'circle';

      pieces.push({
        x,
        y,
        vx,
        vy,
        size: shape === 'heart' ? Math.random() * 15 + 11 : Math.random() * 10 + 6,
        color: ROMANTIC_PALETTE[Math.floor(Math.random() * ROMANTIC_PALETTE.length)],
        shape,
        isGlitter: Math.random() < 0.28,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        vRotX: (Math.random() - 0.5) * 0.18,
        vRotY: (Math.random() - 0.5) * 0.2,
        vRotZ: (Math.random() - 0.5) * 0.12,
        opacity: Math.random() * 0.15 + 0.85,
        swaySpeed: Math.random() * 0.04 + 0.018,
        swayDist: Math.random() * 2.8 + 1.2,
        swayOffset: Math.random() * Math.PI * 2,
      });
    }

    let animationId: number;
    const startTime = performance.now();

    // High-precision smooth heart drawing routine
    const drawHeart = (ctx: CanvasRenderingContext2D, size: number) => {
      ctx.beginPath();
      const topCurveHeight = size * 0.32;
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) * 0.55, 0, size * 0.88, 0, size);
      ctx.bezierCurveTo(0, size * 0.88, size / 2, (size + topCurveHeight) * 0.55, size / 2, topCurveHeight);
      ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.closePath();
      ctx.fill();
    };

    // Five-point star drawing routine for glitter sparkles
    const drawStar = (ctx: CanvasRenderingContext2D, size: number) => {
      ctx.beginPath();
      const spikes = 5;
      const outerRadius = size * 0.7;
      const innerRadius = size * 0.32;
      let rot = (Math.PI / 2) * 3;
      let x = 0;
      let y = 0;
      const step = Math.PI / spikes;

      ctx.moveTo(0, -outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = Math.cos(rot) * outerRadius;
        y = Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = Math.cos(rot) * innerRadius;
        y = Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(0, -outerRadius);
      ctx.closePath();
      ctx.fill();
    };

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      // Fade out gently after 6 seconds, complete at 7.5 seconds
      const globalAlpha = elapsed > 5.8 ? Math.max(0, 1 - (elapsed - 5.8) / 1.7) : 1;

      for (let i = 0; i < pieces.length; i++) {
        const p = pieces[i];

        // Physics updates
        p.vy += 0.14; // Soft romantic gravity
        p.vx *= 0.982; // Air drag
        p.vy *= 0.982;
        p.vy = Math.min(p.vy, 4.2); // Terminal flutter velocity

        // Horizontal sinusoidal paper flutter
        p.x += p.vx + Math.sin(now * 0.003 * p.swaySpeed + p.swayOffset) * p.swayDist;
        p.y += p.vy;

        // 3D rotations
        p.rotX += p.vRotX;
        p.rotY += p.vRotY;
        p.rotZ += p.vRotZ;

        // 3D scale projections to simulate paper tumbling
        const scaleX = Math.cos(p.rotY);
        const scaleY = Math.cos(p.rotX);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotZ);
        ctx.scale(scaleX, scaleY);

        ctx.globalAlpha = p.opacity * globalAlpha * Math.abs(scaleX * scaleY * 0.45 + 0.55);
        ctx.fillStyle = p.color;

        if (p.shape === 'heart') {
          drawHeart(ctx, p.size);
        } else if (p.shape === 'star') {
          drawStar(ctx, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }

        // Add subtle gold highlight / sheen if glitter piece
        if (p.isGlitter && Math.abs(scaleX) > 0.35) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.beginPath();
          ctx.arc(-p.size * 0.15, p.size * 0.3, p.size * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Continuous shower respawn from the top during the first 5 seconds
        if (p.y > height + 35 && elapsed < 5.0) {
          p.y = -25 - Math.random() * 30;
          p.x = Math.random() * width;
          p.vy = Math.random() * 2.4 + 1.8;
          p.vx = (Math.random() - 0.5) * 2.2;
        }
      }

      if (elapsed < 7.5 && globalAlpha > 0.01) {
        animationId = requestAnimationFrame(render);
      } else {
        onDismiss();
      }
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-between overflow-hidden"
      aria-label="Heart-shaped confetti celebration overlay"
      role="status"
    >
      {/* Background Heart Shower Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Floating Celebratory Banner */}
      <div className="relative z-10 mt-14 sm:mt-16 pointer-events-auto animate-[celebrateBannerIn_0.7s_cubic-bezier(0.16,1,0.3,1)_both]">
        <div className="bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#A64D68]/30 shadow-[0_12px_36px_rgba(166,77,104,0.28)] rounded-full px-6 sm:px-8 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#A64D68] text-white flex items-center justify-center shadow-xs">
            <Heart className="w-4 h-4 fill-white animate-pulse" />
          </div>
          <div className="text-left">
            <span className="font-handwriting text-2xl sm:text-3xl text-[#A64D68] leading-none block">
              {title}
            </span>
            <span className="text-[11px] text-[#9A817B] font-sans font-medium">
              {subtitle}
            </span>
          </div>
          <Sparkles className="w-5 h-5 text-[#F3C68F] animate-spin" style={{ animationDuration: '6s' }} />

          <button
            onClick={onDismiss}
            className="ml-2 w-7 h-7 rounded-full bg-[#F8DCE5]/70 hover:bg-[#F8DCE5] text-[#A64D68] flex items-center justify-center transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#A64D68]"
            title="Dismiss confetti"
            aria-label="Dismiss heart confetti shower"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes celebrateBannerIn {
          from {
            opacity: 0;
            transform: translateY(-24px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
