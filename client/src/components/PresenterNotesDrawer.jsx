import React, { useState, useEffect, useRef } from 'react';
import { X, BookOpen, ChevronRight, Type, Sparkles, Eye, ArrowRight } from 'lucide-react';

/**
 * PresenterNotesDrawer
 * Toggleable via 'P' key or bottom controls.
 * Displays speaker notes, talking points, technical glossary context, and teleprompter script.
 */
export function PresenterNotesDrawer({
  isOpen,
  onClose,
  slide,
  nextSlide,
  isNarrating = false,
  spokenCharIndex = 0,
  onGoToNext
}) {
  const [fontSize, setFontSize] = useState(14); // 13, 14, 16, 18
  const scrollRef = useRef(null);

  // Auto-scroll teleprompter text as narration progresses
  useEffect(() => {
    if (isNarrating && scrollRef.current && slide?.narration) {
      const pct = spokenCharIndex / (slide.narration.length || 1);
      const targetScroll = pct * (scrollRef.current.scrollHeight - scrollRef.current.clientHeight);
      scrollRef.current.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth'
      });
    }
  }, [isNarrating, spokenCharIndex, slide]);

  if (!isOpen || !slide) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '8px',
        left: '20px',
        right: '20px',
        maxHeight: '260px',
        backgroundColor: 'rgba(8, 14, 26, 0.94)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '14px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.12)',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideUp 220ms cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Drawer Header */}
      <div
        style={{
          padding: '10px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0c1527'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}
          >
            <BookOpen size={14} />
          </div>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>
            Presenter Teleprompter &amp; Notes
          </span>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#94a3b8'
            }}
          >
            Slide {slide.slideNumber}
          </span>
          {isNarrating && (
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                fontWeight: '600'
              }}
            >
              Teleprompter Live
            </span>
          )}
        </div>

        {/* Controls: Font Size & Close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Font Size Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Type size={13} style={{ color: '#94a3b8' }} />
            <button
              onClick={() => setFontSize((s) => Math.max(12, s - 2))}
              className="btn btn-ghost"
              style={{ padding: '2px 6px', fontSize: '11px', height: '24px' }}
              title="Smaller font"
            >
              A-
            </button>
            <span style={{ fontSize: '11px', color: '#94a3b8', minWidth: '24px', textAlign: 'center' }}>
              {fontSize}px
            </span>
            <button
              onClick={() => setFontSize((s) => Math.min(20, s + 2))}
              className="btn btn-ghost"
              style={{ padding: '2px 6px', fontSize: '11px', height: '24px' }}
              title="Larger font"
            >
              A+
            </button>
          </div>

          <span style={{ fontSize: '10px', color: '#64748b' }}>Press P to close</span>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ width: '26px', height: '26px' }}
            title="Close Presenter Notes (P)"
            aria-label="Close Presenter Notes"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Drawer Content Columns: Talking Points (Left) & Teleprompter Script (Right) */}
      <div
        ref={scrollRef}
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 1fr) minmax(320px, 1.4fr)',
          gap: '16px',
          padding: '14px 18px',
          overflowY: 'auto',
          fontSize: `${fontSize}px`,
          lineHeight: '1.6'
        }}
      >
        {/* Left Column: Strategic Talking Points */}
        <div
          style={{
            borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            paddingRight: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              color: '#38bdf8'
            }}
          >
            Core Talking Points
          </div>
          <ul style={{ margin: 0, paddingLeft: '16px', color: '#cbd5e1' }}>
            {slide.keyPoints?.map((pt, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>
                {pt}
              </li>
            ))}
          </ul>

          {/* Quick Metrics Glance */}
          {slide.metrics && slide.metrics.length > 0 && (
            <div style={{ marginTop: '6px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                Key Data Callouts
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {slide.metrics.map((m, mIdx) => (
                  <span
                    key={mIdx}
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(56, 189, 248, 0.1)',
                      color: '#f8fafc',
                      border: '1px solid rgba(56, 189, 248, 0.2)'
                    }}
                  >
                    <strong>{m.value}</strong> {m.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Full Teleprompter Narration Script */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>Verbatim Narration Script</span>
            {nextSlide && (
              <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'none' }}>
                Next: Slide {nextSlide.slideNumber} &mdash; {nextSlide.title}
              </span>
            )}
          </div>

          <div style={{ color: '#f1f5f9', whiteSpace: 'pre-wrap', lineHeight: '1.65' }}>
            {slide.narration || slide.context || 'No speech narration text available for this slide.'}
          </div>
        </div>
      </div>
    </div>
  );
}
