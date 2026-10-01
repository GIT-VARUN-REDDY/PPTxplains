import React, { useMemo, useState, useEffect } from 'react';
import { getSlideContextZones, getActiveTopicForSlide } from '../utils/topicRecognizer.js';

/**
 * SlideTopicSpotlight (Minimal, Professional Edition)
 * - Exact, high-precision bounding dimensions for every context zone.
 * - Ultra-clean, razor-sharp 1.8px SVG laser drawing border animation.
 * - Non-obstructive presenter pointer positioned in the margin (never covers text).
 * - No visual clutter: zero chunky brackets, zero text-blocking badges.
 * - Seamless interactive click-to-explain on any card.
 */
export function SlideTopicSpotlight({
  slide,
  spokenCharIndex = 0,
  currentLineText = '',
  isSpeaking = false,
  isPlaying = false,
  hasStarted = false,
  onSelectTopic
}) {
  const [manualSelectedId, setManualSelectedId] = useState(null);

  // Reset manual selection when slide changes
  useEffect(() => {
    setManualSelectedId(null);
  }, [slide?.slideNumber || slide?.id]);

  // Retrieve all recognized context zones for this slide
  const allZones = useMemo(() => {
    return getSlideContextZones(slide);
  }, [slide]);

  // Determine active topic: manually clicked or speech synchronized
  const activeTopic = useMemo(() => {
    if (!slide) return null;
    if (manualSelectedId) {
      const found = allZones.find((z) => z.id === manualSelectedId);
      if (found) return found;
    }
    return getActiveTopicForSlide(slide, spokenCharIndex, currentLineText);
  }, [slide, spokenCharIndex, currentLineText, manualSelectedId, allZones]);

  // Visible whenever presentation has started or is actively playing
  const isVisible = (hasStarted || isPlaying) && !!activeTopic;

  if (!slide || allZones.length === 0) return null;

  // AI Presenter Cursor: Positioned in the left margin pointing cleanly at the card (never over text)
  const cursorLeft = activeTopic ? `calc(${activeTopic.left} - 28px)` : '4%';
  const cursorTop = activeTopic ? `calc(${activeTopic.top} + 20px)` : '18%';

  return (
    <div
      className="slide-topic-spotlight-layer"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 20,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 300ms ease'
      }}
      aria-hidden="true"
    >
      {/* 1. Interactive Click-to-Explain Hitboxes for ALL Recognized Contexts */}
      {allZones.map((zone) => {
        const isThisActive = activeTopic?.id === zone.id;
        return (
          <div
            key={`hitbox-${zone.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setManualSelectedId(zone.id);
              if (onSelectTopic) {
                onSelectTopic(zone);
              }
            }}
            style={{
              position: 'absolute',
              left: zone.left,
              top: zone.top,
              width: zone.width,
              height: zone.height,
              borderRadius: '16px',
              cursor: 'pointer',
              pointerEvents: 'auto',
              border: isThisActive ? 'none' : '1px solid transparent',
              transition: 'all 180ms ease'
            }}
            className="context-interactive-hitbox"
            title={`Click to focus: ${zone.label}`}
          />
        );
      })}

      {activeTopic && (
        <>
          {/* 2. MINIMAL, PRECISION SVG DRAWING BORDER ANIMATION */}
          <svg
            key={`border-${activeTopic.id}`}
            className="drawing-border-svg"
            style={{
              position: 'absolute',
              left: activeTopic.left,
              top: activeTopic.top,
              width: activeTopic.width,
              height: activeTopic.height,
              overflow: 'visible',
              pointerEvents: 'none',
              zIndex: 22
            }}
          >
            <defs>
              {/* Elegant, professional cyan gradient stroke */}
              <linearGradient id="minimalLaserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="60%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>

              {/* Refined subtle glow filter */}
              <filter id="subtleGlowFilter" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Subtle, restrained ambient card tint */}
            <rect
              x="1.5"
              y="1.5"
              width="calc(100% - 3px)"
              height="calc(100% - 3px)"
              rx="16"
              ry="16"
              fill="rgba(56, 189, 248, 0.025)"
              stroke="none"
            />

            {/* Base faint reference stroke */}
            <rect
              x="1.5"
              y="1.5"
              width="calc(100% - 3px)"
              height="calc(100% - 3px)"
              rx="16"
              ry="16"
              fill="none"
              stroke="rgba(56, 189, 248, 0.16)"
              strokeWidth="1.2"
            />

            {/* THE DRAWING BORDER STROKE: Smoothly traces the exact perimeter in 450ms */}
            <rect
              className="drawn-laser-border"
              x="1.5"
              y="1.5"
              width="calc(100% - 3px)"
              height="calc(100% - 3px)"
              rx="16"
              ry="16"
              pathLength="100"
              fill="none"
              stroke="url(#minimalLaserGrad)"
              strokeWidth="1.8"
              filter="url(#subtleGlowFilter)"
              style={{
                strokeDasharray: 100,
                strokeDashoffset: 0,
                animation: 'drawBorderStroke 0.45s cubic-bezier(0.2, 0.9, 0.3, 1) forwards'
              }}
            />
          </svg>

          {/* 3. MINIMALIST PRESENTER POINTER (In the left margin, zero text obstruction) */}
          <div
            className="ai-presenter-cursor"
            style={{
              position: 'absolute',
              left: cursorLeft,
              top: cursorTop,
              transition: 'left 380ms cubic-bezier(0.2, 0.8, 0.2, 1), top 380ms cubic-bezier(0.2, 0.8, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              zIndex: 30,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6))',
              animation: 'cursorFloat 3s ease-in-out infinite'
            }}
          >
            {/* Elegant laser pointer pointing directly inward toward the card */}
            <div style={{ position: 'relative', width: '22px', height: '18px', flexShrink: 0 }}>
              <svg
                width="22"
                height="18"
                viewBox="0 0 22 18"
                fill="none"
                style={{ filter: 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.7))' }}
              >
                {/* Crisp directional arrow pointing right */}
                <path
                  d="M2 4L17 9L2 14L5.5 9L2 4Z"
                  fill="#38bdf8"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                {/* Laser focal dot */}
                <circle
                  cx="18.5"
                  cy="9"
                  r="2"
                  fill="#ffffff"
                  stroke="#38bdf8"
                  strokeWidth="1"
                />
              </svg>
            </div>

            {/* Subtle, restrained mini audio equalizer bars in margin when AI is speaking */}
            {isSpeaking && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  height: '11px',
                  backgroundColor: 'rgba(8, 14, 26, 0.85)',
                  padding: '2px 4px',
                  borderRadius: '3px',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  marginLeft: '-2px'
                }}
                title="AI Speaking"
              >
                <span
                  style={{
                    width: '2px',
                    height: '5px',
                    backgroundColor: '#38bdf8',
                    borderRadius: '1px',
                    animation: 'waveBar 0.7s ease-in-out infinite'
                  }}
                />
                <span
                  style={{
                    width: '2px',
                    height: '9px',
                    backgroundColor: '#38bdf8',
                    borderRadius: '1px',
                    animation: 'waveBar 0.7s ease-in-out infinite 0.15s'
                  }}
                />
                <span
                  style={{
                    width: '2px',
                    height: '4px',
                    backgroundColor: '#38bdf8',
                    borderRadius: '1px',
                    animation: 'waveBar 0.7s ease-in-out infinite 0.3s'
                  }}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
