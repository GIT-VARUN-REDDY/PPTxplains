import React, { useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * SlideThumbnailsDrawer
 * A sleek expandable bottom drawer / mini-map for rapid slide skimming.
 * Features:
 * - High contrast active slide border & glow
 * - 16:9 thumbnail previews with slide numbers & title tooltips
 * - Horizontal scroll with auto-scroll to keep active slide in view
 * - Strict royal blue, deep navy, black, and white design
 */
export function SlideThumbnailsDrawer({
  isOpen,
  slides = [],
  currentSlideIndex = 0,
  onSelectSlide,
  onClose
}) {
  const scrollRef = useRef(null);
  const activeThumbRef = useRef(null);

  // Auto scroll active slide into center view when drawer opens or active slide changes
  useEffect(() => {
    if (isOpen && activeThumbRef.current && scrollRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [isOpen, currentSlideIndex]);

  if (!isOpen || !slides || slides.length === 0) return null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#070d1e',
        borderTop: '1px solid rgba(59, 130, 246, 0.35)',
        boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.65)',
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUpDrawer 200ms cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Drawer Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 16px',
          backgroundColor: '#0a1128',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.6px', color: '#93c5fd', textTransform: 'uppercase' }}>
            Slide Mini-Map
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
            ({slides.length} slides)
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#93c5fd',
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Close drawer"
          aria-label="Close drawer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Horizontal Scrollable Thumbnails Strip */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '12px',
          padding: '12px 16px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin'
        }}
      >
        {slides.map((slide, idx) => {
          const isActive = idx === currentSlideIndex;
          return (
            <div
              key={slide.id || idx}
              ref={isActive ? activeThumbRef : null}
              onClick={() => onSelectSlide(idx)}
              style={{
                flex: '0 0 140px',
                cursor: 'pointer',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#030712',
                border: isActive
                  ? '2px solid #3b82f6'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isActive ? '0 0 12px rgba(59, 130, 246, 0.65)' : 'none',
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 160ms ease',
                position: 'relative'
              }}
              title={`Slide ${idx + 1}: ${slide.title}`}
            >
              {/* Thumbnail Image */}
              <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', backgroundColor: '#02040a' }}>
                <img
                  src={slide.image}
                  alt={slide.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
              </div>

              {/* Slide Meta Label */}
              <div
                style={{
                  padding: '4px 6px',
                  backgroundColor: isActive ? '#101c3d' : '#0a1128',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '4px'
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: isActive ? '#ffffff' : '#93c5fd'
                  }}
                >
                  #{idx + 1}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '95px'
                  }}
                >
                  {slide.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
