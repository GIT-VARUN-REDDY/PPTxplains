import React, { useState, useEffect, useRef } from 'react';

/**
 * PresenterLaserPointer
 * Virtual Keynote Laser Pointer Mode:
 * - Toggled via 'L' key or controls button.
 * - Hides the system cursor and renders a vibrant glowing laser dot.
 * - Smoothly renders a glowing comet trail as the pointer moves across technical schematics.
 */
export function PresenterLaserPointer({ isActive = false, containerRef }) {
  const [pos, setPos] = useState(null);
  const [trail, setTrail] = useState([]);
  const trailTimerRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      setPos(null);
      setTrail([]);
      return;
    }

    const container = containerRef?.current;
    if (!container) return;

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Only track when inside container
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        setPos({ x, y });
        setTrail((prev) => {
          const next = [...prev, { x, y, id: Math.random() }];
          return next.slice(-8); // Keep last 8 positions for smooth dissipation
        });
      } else {
        setPos(null);
      }
    };

    const handlePointerLeave = () => {
      setPos(null);
      setTrail([]);
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

    // Gently clear trail when stationary
    trailTimerRef.current = setInterval(() => {
      setTrail((prev) => (prev.length > 0 ? prev.slice(1) : prev));
    }, 45);

    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      if (trailTimerRef.current) clearInterval(trailTimerRef.current);
    };
  }, [isActive, containerRef]);

  if (!isActive || !pos) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 40,
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      {/* Comet particle trail */}
      {trail.map((pt, idx) => {
        const opacity = (idx + 1) / trail.length * 0.4;
        const size = 6 + (idx / trail.length) * 6;
        return (
          <div
            key={pt.id}
            style={{
              position: 'absolute',
              left: `${pt.x}px`,
              top: `${pt.y}px`,
              width: `${size}px`,
              height: `${size}px`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
              opacity,
              filter: 'blur(2px)',
              pointerEvents: 'none',
              transition: 'opacity 120ms ease'
            }}
          />
        );
      })}

      {/* Main Laser Pointer Glow Core */}
      <div
        style={{
          position: 'absolute',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transform: 'translate(-50%, -50%)',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.9) 0%, rgba(56, 189, 248, 0.3) 50%, transparent 75%)',
          boxShadow: '0 0 16px #38bdf8, 0 0 28px rgba(56, 189, 248, 0.8)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Intense white center dot */}
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 6px #ffffff, 0 0 10px #38bdf8'
          }}
        />
      </div>
    </div>
  );
}
