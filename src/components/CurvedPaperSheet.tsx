import React, { useEffect, useState, useRef, useId } from 'react';
import { Heart } from 'lucide-react';
import { BookChapterData } from './PageTurnBook';

interface CurvedPaperSheetProps<T = BookChapterData> {
  currentChapter: T;
  targetChapter: T;
  direction: 'next' | 'prev';
  duration?: number;
  onComplete: () => void;
  renderPageContent: (chapter: T) => React.ReactNode;
}

// Physical easing: corner lift, steady acceleration, graceful deceleration & settling
function paperDeformEase(t: number): number {
  if (t < 0.15) {
    // 0-15%: Top corner lifts slightly and begins curling inward
    const k = t / 0.15;
    return 0.10 * (k * k);
  } else if (t < 0.85) {
    // 15-85%: Progressive curved sweep across the page
    const k = (t - 0.15) / 0.70;
    return 0.10 + 0.78 * (0.5 - 0.5 * Math.cos(k * Math.PI));
  } else {
    // 85-100%: Deceleration, curl flattens out, gentle settling onto opposite page
    const k = (t - 0.85) / 0.15;
    return 0.88 + 0.12 * (1 - Math.pow(1 - k, 3));
  }
}

export function CurvedPaperSheet<T = BookChapterData>({
  currentChapter,
  targetChapter,
  direction,
  duration = 1100,
  onComplete,
  renderPageContent,
}: CurvedPaperSheetProps<T>) {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 680, height: 520 });
  const clipId = useId();

  // Measure container dimensions for responsive geometry
  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth || 680,
        height: containerRef.current.offsetHeight || 520,
      });
    }
  }, []);

  // Frame animation loop
  useEffect(() => {
    let animId: number;
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, Math.max(0, elapsed / duration));
      const p = paperDeformEase(t);
      setProgress(p);

      if (t < 1) {
        animId = requestAnimationFrame(frame);
      } else {
        setTimeout(() => {
          onComplete();
        }, 40);
      }
    };

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [duration, onComplete]);

  const { width: W, height: H } = dimensions;
  const isNext = direction === 'next';

  // --- PHYSICAL DEFORMATION PARAMETERS ---

  // 1. Fold line intercepts across top and bottom edges (angled diagonal peel)
  // For 'next': peels from top-right corner (W, 0) towards left (0, 0)
  // For 'prev': peels from top-left corner (0, 0) towards right (W, 0)
  const topTravel = isNext ? W * (1 - progress * 1.18) : W * (progress * 1.18);
  const botTravel = isNext
    ? W * (1 - Math.max(0, progress - 0.12) * 1.18)
    : W * (Math.max(0, progress - 0.12) * 1.18);

  const foldTopX = Math.max(-20, Math.min(W + 20, topTravel));
  const foldBotX = Math.max(-20, Math.min(W + 20, botTravel));

  // 2. Corner Lift: Top corner lifts upward in early turn (0..35%)
  const cornerLiftFactor = Math.max(0, 1 - progress / 0.35);
  const topCornerLiftY = -24 * cornerLiftFactor;
  const cornerAngleDeg = (isNext ? -7 : 7) * cornerLiftFactor;

  // 3. Center Bowing: The leading edge bows outward by up to 24px in the center
  const bowAmount = Math.sin(progress * Math.PI) * (W < 500 ? 14 : 22);

  // 4. Cylinder Radius: Starts at 26px, swells to 52px at mid-turn, flattens to 18px at landing
  const cylinderRadius = 22 + Math.sin(progress * Math.PI) * 28;

  // 5. Active Curl Width (the curved sheet cylinder zone)
  const curlSpan = cylinderRadius * 1.85;

  // Coordinates for the visible curved leading edge arc
  const leadingTopX = foldTopX + (isNext ? -curlSpan * 0.45 : curlSpan * 0.45);
  const leadingMidX =
    (foldTopX + foldBotX) * 0.5 + (isNext ? -(curlSpan + bowAmount) : curlSpan + bowAmount);
  const leadingBotX = foldBotX + (isNext ? -curlSpan * 0.35 : curlSpan * 0.35);

  // Clip path polygon for the stationary flat portion of the outgoing page
  // Ensures zero mirrored text and zero double rendering
  const flatClipPolygon = isNext
    ? `polygon(0 0, ${foldTopX}px 0, ${foldBotX}px ${H}px, 0 ${H}px)`
    : `polygon(${foldTopX}px 0, ${W}px 0, ${W}px ${H}px, ${foldBotX}px ${H}px)`;

  // Number of vertex interpolation ribbons across the curved cylindrical band
  const RIBBON_COUNT = W < 500 ? 8 : 12;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-30 pointer-events-none rounded-3xl select-none overflow-visible"
      style={{
        perspective: '1400px',
        transformStyle: 'preserve-3d',
      }}
      aria-hidden="true"
    >
      {/* LAYER 1: SOFT MOVING PROJECTED SHADOW ON STATIONARY DESTINATION PAGE */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none transition-opacity duration-100"
        style={{
          left: `${Math.max(0, Math.min(W - 40, (foldTopX + foldBotX) * 0.5 - (isNext ? 45 : 10)))}px`,
          width: `${Math.max(50, curlSpan * 2.1)}px`,
          background: `radial-gradient(ellipse at center, rgba(90, 53, 69, ${
            0.22 + Math.sin(progress * Math.PI) * 0.18
          }) 0%, rgba(90, 53, 69, 0.06) 65%, transparent 100%)`,
          filter: 'blur(12px)',
          transform: `scaleY(1.03) rotate(${isNext ? '-2deg' : '2deg'})`,
          opacity: Math.sin(progress * Math.PI) * 1.2,
        }}
      />

      {/* LAYER 2: STATIONARY FLAT PORTION OF OUTGOING PAGE (Rendered ONCE, clipped dynamically along fold) */}
      <div
        className="absolute inset-0 vintage-parchment-paper rounded-3xl overflow-hidden shadow-inner"
        style={{
          clipPath: flatClipPolygon,
          WebkitClipPath: flatClipPolygon,
        }}
      >
        <div className="w-full h-full p-6 sm:p-10 md:p-12 relative overflow-hidden">
          {renderPageContent(currentChapter)}
        </div>
      </div>

      {/* LAYER 3: THE DEFORMED CURLED PAPER CYLINDER (Vertex-Interpolated Ribbons) */}
      <div className="absolute inset-0 w-full h-full [transform-style:preserve-3d]">
        {Array.from({ length: RIBBON_COUNT }).map((_, rIdx) => {
          // Normalized ribbon position along the curl arc [0..1]
          const ribbonU = (rIdx + 0.5) / RIBBON_COUNT;
          const ribbonAngle = ribbonU * Math.PI; // 0 to 180 degrees around cylinder

          // Local displacement
          const stripZ = Math.sin(ribbonAngle) * cylinderRadius;
          const stripXOffset = (1 - Math.cos(ribbonAngle)) * (curlSpan * 0.5);

          // Horizontal position along the angled fold line
          const foldMidX = (foldTopX + foldBotX) * 0.5;
          const ribbonBaseX = foldMidX + (isNext ? -stripXOffset : stripXOffset);

          // Apply center bowing along ribbon
          const ribbonBow = Math.sin(ribbonAngle) * bowAmount;
          const finalX = ribbonBaseX + (isNext ? -ribbonBow : ribbonBow);

          // Top corner lift interpolation
          const ribbonLiftY = topCornerLiftY * (1 - ribbonU) * (1 - ribbonU);

          // Dynamic specular highlight on crest (angle ~ 90 deg)
          const highlightOpacity = Math.max(0, 1 - Math.abs(ribbonU - 0.5) * 3.5) * 0.45;
          // Ambient shadow inside the cylinder hollow
          const hollowShadowOpacity = Math.max(0, Math.sin(ribbonAngle)) * 0.3;

          // Is this ribbon facing the verso (past 90 degrees)?
          const isVerso = ribbonU > 0.5;

          return (
            <div
              key={rIdx}
              className="absolute top-0 bottom-0 overflow-hidden"
              style={{
                left: `${finalX}px`,
                width: `${curlSpan / RIBBON_COUNT + 1.2}px`, // Slight subpixel overlap prevents rendering seams
                transformStyle: 'preserve-3d',
                transform: `translate3d(0, ${ribbonLiftY}px, ${stripZ}px) rotateY(${
                  isNext ? -ribbonAngle * (180 / Math.PI) : ribbonAngle * (180 / Math.PI)
                }deg) rotateZ(${cornerAngleDeg * (1 - ribbonU)}deg)`,
                transformOrigin: isNext ? 'right center' : 'left center',
              }}
            >
              {!isVerso ? (
                /* FRONT FACE OF CURL (Outgoing paper curving upward into the light) */
                <div
                  className="absolute inset-0 vintage-parchment-paper border-t border-b border-[#F8DCE5]"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  {/* Subtle stationery shading */}
                  <div className="w-full h-full bg-[#FAF2F5]/30" />

                  {/* Dynamic Specular Ridge Highlight */}
                  {highlightOpacity > 0 && (
                    <div
                      className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white to-transparent"
                      style={{ opacity: highlightOpacity }}
                    />
                  )}

                  {/* Ambient Curvature Shadow */}
                  {hollowShadowOpacity > 0 && (
                    <div
                      className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-[rgba(90,53,69,0.25)] to-transparent"
                      style={{ opacity: hollowShadowOpacity }}
                    />
                  )}
                </div>
              ) : (
                /* VERSO FACE OF CURL (Parchment back of the paper with soft inner shadow) */
                <div
                  className="absolute inset-0 bg-[#FFF9F2] border-t border-b border-[#F8DCE5]"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 relative">
                    <Heart className="w-3.5 h-3.5 text-[#A64D68]/30 fill-[#A64D68]/15" />
                    {/* Faint watermark texture */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#A64D68_1px,transparent_1px)] [background-size:12px_12px]" />
                  </div>

                  {/* Ambient cylinder hollow shadow on verso */}
                  <div
                    className="absolute inset-0 pointer-events-none bg-gradient-to-l from-transparent via-[rgba(90,53,69,0.22)] to-[rgba(90,53,69,0.1)]"
                    style={{ opacity: hollowShadowOpacity }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* LAYER 4: ILLUMINATED CURVED LEADING EDGE (SVG Cubic Bezier Arc) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-40 overflow-visible"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`${clipId}-edgeGlow`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFDF9" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#FFF2F6" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#E2A9B8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#D8A0AF" stopOpacity="0.8" />
          </linearGradient>
          <filter id={`${clipId}-edgeShadow`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow
              dx={isNext ? -3.5 : 3.5}
              dy="3"
              stdDeviation="3.5"
              floodColor="#5A3545"
              floodOpacity="0.28"
            />
          </filter>
        </defs>

        {/* Dynamic Curved Leading Edge Arc */}
        {progress > 0.04 && progress < 0.96 && (
          <path
            d={`M ${leadingTopX} ${topCornerLiftY} Q ${leadingMidX} ${H * 0.5} ${leadingBotX} ${H}`}
            stroke={`url(#${clipId}-edgeGlow)`}
            strokeWidth="3.2"
            fill="none"
            filter={`url(#${clipId}-edgeShadow)`}
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
};
