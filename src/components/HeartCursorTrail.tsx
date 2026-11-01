import React, { useEffect, useRef } from 'react';

interface HeartParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
  type: 'heart' | 'sparkle';
}

const ROMANTIC_PALETTE = [
  '#A64D68', // Deep rose
  '#C96B85', // Warm blush
  '#E28FA4', // Soft rose pink
  '#F2A8BA', // Light baby blush
  '#E6957B', // Soft peach
  '#D4A373', // Champagne gold
  '#B8405E', // Rich crimson rose
];

export const HeartCursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<HeartParticle[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(false);

  useEffect(() => {
    // Respect user's motion preferences
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays for crisp rendering
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const drawHeartShape = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      color: string,
      alpha: number
    ) => {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      const scale = size / 20;
      context.scale(scale, scale);
      context.globalAlpha = Math.max(0, Math.min(1, alpha));
      context.fillStyle = color;
      context.shadowColor = color;
      context.shadowBlur = 4;

      context.beginPath();
      // Perfectly symmetric romantic heart centered on origin
      context.moveTo(0, -4);
      context.bezierCurveTo(-5.5, -13, -15, -7, -15, 2);
      context.bezierCurveTo(-15, 9, -7, 15, 0, 19);
      context.bezierCurveTo(7, 15, 15, 9, 15, 2);
      context.bezierCurveTo(15, -7, 5.5, -13, 0, -4);
      context.closePath();
      context.fill();

      context.restore();
    };

    const drawSparkleShape = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      color: string,
      alpha: number
    ) => {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.globalAlpha = Math.max(0, Math.min(1, alpha * 0.9));
      context.fillStyle = color;
      context.shadowColor = '#FFECC7';
      context.shadowBlur = 6;

      const r = size * 0.6;
      context.beginPath();
      for (let i = 0; i < 4; i++) {
        context.lineTo(Math.cos((i * Math.PI) / 2) * r, Math.sin((i * Math.PI) / 2) * r);
        context.lineTo(
          Math.cos(((i * 2 + 1) * Math.PI) / 4) * (r * 0.28),
          Math.sin(((i * 2 + 1) * Math.PI) / 4) * (r * 0.28)
        );
      }
      context.closePath();
      context.fill();
      context.restore();
    };

    const spawnParticles = (x: number, y: number, count = 1, isBurst = false) => {
      for (let i = 0; i < count; i++) {
        if (particlesRef.current.length > 60) {
          particlesRef.current.shift(); // keep particle count capped
        }

        const isSparkle = !isBurst && Math.random() < 0.22;
        const speedMultiplier = isBurst ? 2.2 : 1.0;
        const angle = isBurst
          ? Math.random() * Math.PI * 2
          : -Math.PI / 2 + (Math.random() - 0.5) * 1.4; // upward bias for trail

        const speed = (Math.random() * 0.8 + 0.4) * speedMultiplier;
        const maxLife = isBurst ? 45 + Math.random() * 25 : 35 + Math.random() * 20;

        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.3,
          vy: Math.sin(angle) * speed - 0.4, // gentle upward floating buoyancy
          size: isSparkle ? Math.random() * 5 + 6 : Math.random() * 6 + 8, // 8-14px delicate size
          rotation: (Math.random() - 0.5) * 0.6,
          vRot: (Math.random() - 0.5) * 0.05,
          color: ROMANTIC_PALETTE[Math.floor(Math.random() * ROMANTIC_PALETTE.length)],
          alpha: 0.95,
          maxLife,
          life: maxLife,
          type: isSparkle ? 'sparkle' : 'heart',
        });
      }

      startAnimation();
    };

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const activeParticles: HeartParticle[] = [];

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.life -= 1;

        if (p.life > 0) {
          p.x += p.vx;
          p.y += p.vy;
          // Apply gentle air resistance and float
          p.vx *= 0.98;
          p.vy -= 0.015; // gentle upward lift
          p.rotation += p.vRot;

          // Smooth progress decay curve
          const progress = p.life / p.maxLife;
          const currentAlpha = Math.sin(progress * Math.PI * 0.5) * 0.95;
          const currentSize = p.size * (0.35 + 0.65 * progress);

          if (p.type === 'heart') {
            drawHeartShape(ctx, p.x, p.y, currentSize, p.rotation, p.color, currentAlpha);
          } else {
            drawSparkleShape(ctx, p.x, p.y, currentSize, p.rotation, p.color, currentAlpha);
          }

          activeParticles.push(p);
        }
      }

      particlesRef.current = activeParticles;

      if (particlesRef.current.length > 0) {
        animFrameIdRef.current = requestAnimationFrame(animate);
      } else {
        isRunningRef.current = false;
        animFrameIdRef.current = null;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    const startAnimation = () => {
      if (!isRunningRef.current) {
        isRunningRef.current = true;
        animFrameIdRef.current = requestAnimationFrame(animate);
      }
    };

    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      const curX = e.clientX;
      const curY = e.clientY;

      if (!lastPosRef.current) {
        lastPosRef.current = { x: curX, y: curY };
        spawnParticles(curX, curY, 1);
        return;
      }

      const dx = curX - lastPosRef.current.x;
      const dy = curY - lastPosRef.current.y;
      const dist = Math.hypot(dx, dy);

      // Spawn every 16px of travel distance to create an unbroken, smooth trail of hearts
      if (dist >= 16) {
        // Interpolate points between fast cursor jumps
        const steps = Math.min(Math.floor(dist / 16), 3);
        for (let s = 1; s <= steps; s++) {
          const ratio = s / steps;
          const interpX = lastPosRef.current.x + dx * ratio;
          const interpY = lastPosRef.current.y + dy * ratio;
          spawnParticles(interpX, interpY, 1);
        }
        lastPosRef.current = { x: curX, y: curY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handlePointerMove(touch as unknown as MouseEvent);
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return;
      }

      // Romantic burst of 4 delicate hearts on click or tap
      spawnParticles(clientX, clientY, 4, true);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown as EventListener, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('pointerdown', handlePointerDown as EventListener);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999] select-none"
      aria-hidden="true"
    />
  );
};
