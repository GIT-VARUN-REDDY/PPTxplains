import React from 'react';
import { X, Check } from 'lucide-react';

export function SlideOverviewModal({
  isOpen,
  slides,
  currentSlideIndex,
  onSelectSlide,
  onClose
}) {
  if (!isOpen || !slides) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-elevated)'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Presentation Slides Overview
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Select any slide to jump directly to it
            </p>
          </div>

          <button
            onClick={onClose}
            className="btn btn-icon"
            title="Close overview (Esc)"
            aria-label="Close overview"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Slide Grid */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {slides.map((slide, idx) => {
            const isCurrent = idx === currentSlideIndex;
            return (
              <div
                key={slide.id || idx}
                onClick={() => {
                  onSelectSlide(idx);
                  onClose();
                }}
                style={{
                  backgroundColor: isCurrent ? 'var(--bg-surface-elevated)' : 'var(--bg-app)',
                  border: isCurrent ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all var(--transition-fast)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) e.currentTarget.style.borderColor = 'var(--border-medium)';
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                {/* Thumbnail Image */}
                <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', backgroundColor: '#070a10' }}>
                  <img
                    src={slide.image}
                    alt={slide.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Card Info */}
                <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: isCurrent ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                      SLIDE {slide.slideNumber || idx + 1}
                    </span>
                    {isCurrent && (
                      <span className="badge badge-cyan" style={{ fontSize: '10px', padding: '1px 6px' }}>
                        Active
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {slide.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
