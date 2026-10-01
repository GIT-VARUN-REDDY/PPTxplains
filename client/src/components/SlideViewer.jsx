import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { RotateCcw, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { SlideSubtitles } from './SlideSubtitles.jsx';
import { SlideTopicSpotlight } from './SlideTopicSpotlight.jsx';
import { PresenterLaserPointer } from './PresenterLaserPointer.jsx';
import { PresenterNotesDrawer } from './PresenterNotesDrawer.jsx';

function SlideViewerComponent({
  slide,
  slideIndex,
  totalSlides,
  nextSlide,
  hasStarted,
  isPlaying,
  isCompleted,
  isNarrating,
  spokenCharIndex,
  showSubtitles,
  laserActive = false,
  isNotesOpen = false,
  onCloseNotes,
  onToggleSubtitles,
  onPlayNarration,
  onStopNarration,
  onRestart,
  onNext,
  onPrev
}) {
  const slideWrapperRef = useRef(null);
  const [fadeState, setFadeState] = useState('visible'); // 'visible' | 'fading'
  const [hasImageError, setHasImageError] = useState(false);

  // Smooth slide transition effect on slide change
  useEffect(() => {
    setFadeState('fading');
    setHasImageError(false);
    const timer = setTimeout(() => {
      setFadeState('visible');
    }, 120);
    return () => clearTimeout(timer);
  }, [slideIndex, slide?.id, slide?.slideNumber]);

  // Robust URI normalization (handles legacy data:image/svg+xml;utf8, or malformed data URIs)
  const normalizedImageSrc = useMemo(() => {
    if (!slide?.image) return '';
    let src = slide.image;
    if (src.startsWith('data:image/svg+xml;utf8,')) {
      try {
        const svgContent = decodeURIComponent(src.replace('data:image/svg+xml;utf8,', ''))
          .replace(/&bull;/g, '&#8226;');
        return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
      } catch {
        return src.replace('data:image/svg+xml;utf8,', 'data:image/svg+xml;charset=utf-8,');
      }
    }
    return src;
  }, [slide?.image]);

  if (!slide) {
    return (
      <div className="slide-stage">
        <div className="slide-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Loading presentation slide...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="slide-stage" tabIndex={0} style={{ position: 'relative' }}>
      {/* Slide Canvas Container */}
      <div
        ref={slideWrapperRef}
        className="slide-wrapper"
        style={{
          opacity: fadeState === 'visible' ? 1 : 0.6,
          transform: fadeState === 'visible' ? 'scale(1)' : 'scale(0.995)',
          transition: 'opacity 180ms ease, transform 180ms ease',
          cursor: laserActive ? 'none !important' : 'default'
        }}
      >
        {/* Virtual Keynote Laser Pointer Mode */}
        <PresenterLaserPointer isActive={laserActive} containerRef={slideWrapperRef} />
        {/* Slide Image with automatic SVG and inline vector fallback */}
        {!hasImageError && normalizedImageSrc ? (
          <img
            src={normalizedImageSrc}
            alt={`Slide ${slide.slideNumber}: ${slide.title}`}
            className="slide-image"
            loading="eager"
            onError={(e) => {
              const currentSrc = e.currentTarget.src || '';
              if (currentSrc.endsWith('.png')) {
                e.currentTarget.src = currentSrc.replace(/\.png$/, '.svg');
              } else {
                setHasImageError(true);
              }
            }}
          />
        ) : (
          <FallbackSlideGraphic slide={slide} totalSlides={totalSlides} />
        )}

        {/* Real-time AI Topic Recognition Spotlight & Animated Presenter Cursor */}
        <SlideTopicSpotlight
          slide={slide}
          spokenCharIndex={spokenCharIndex}
          isSpeaking={isNarrating}
          isPlaying={isPlaying}
          hasStarted={hasStarted}
          onSelectTopic={(topic) => {
            if (onPlayNarration && topic && typeof topic.startRatio === 'number') {
              onPlayNarration(slide, topic.startRatio * 100);
            }
          }}
        />

        {/* Live Synchronized Subtitles / Closed Captions Overlay */}
        <SlideSubtitles
          narration={slide.narration || slide.context}
          hasStarted={hasStarted}
          isSpeaking={isNarrating}
          spokenCharIndex={spokenCharIndex}
          showSubtitles={showSubtitles}
          onToggleSubtitles={onToggleSubtitles}
          onPlayNarration={onPlayNarration}
          onStopNarration={onStopNarration}
        />

        {/* Completion Overlay if end of presentation is reached */}
        {isCompleted && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(8, 12, 20, 0.92)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '18px',
              padding: '24px',
              zIndex: 20,
              animation: 'fadeIn 250ms ease'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-success)'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                Presentation Complete
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: '1.5' }}>
                You have completed all {totalSlides} slides of this presentation. Have questions? Use the AI Doubt Assistant on the right!
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button onClick={onRestart} className="btn btn-primary" style={{ padding: '10px 20px' }}>
                <RotateCcw size={16} />
                Restart Presentation
              </button>
            </div>
          </div>
        )}

        {/* Subtle slide navigation hover buttons */}
        <button
          onClick={onPrev}
          disabled={slideIndex === 0}
          className="btn btn-icon slide-hover-nav-prev"
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: slideIndex === 0 ? 0 : 0.4,
            background: 'rgba(14, 21, 36, 0.75)',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 150ms ease, background 150ms ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.4')}
          title="Previous slide"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={onNext}
          disabled={slideIndex === totalSlides - 1}
          className="btn btn-icon slide-hover-nav-next"
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: slideIndex === totalSlides - 1 ? 0 : 0.4,
            background: 'rgba(14, 21, 36, 0.75)',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 150ms ease, background 150ms ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.4')}
          title="Next slide"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Feature 7: Presenter Notes & Teleprompter Drawer (P key) */}
      <PresenterNotesDrawer
        isOpen={isNotesOpen}
        onClose={onCloseNotes}
        slide={slide}
        nextSlide={nextSlide}
        isNarrating={isNarrating}
        spokenCharIndex={spokenCharIndex}
        onGoToNext={onNext}
      />
    </div>
  );
}

/**
 * Fallback executive keynote SVG slide graphic rendered when external image asset is missing or fails to load.
 * Guarantees 100% vector presentation rendering with zero broken image icons.
 */
function FallbackSlideGraphic({ slide, totalSlides = 5 }) {
  const slideNum = slide?.slideNumber || slide?.id || 1;
  const total = totalSlides || 5;
  const category = (slide?.category || 'STRATEGY').toUpperCase();
  const title = slide?.title || 'Executive Architecture Overview';
  const subtitle = slide?.subtitle || '';
  const keyPoints = slide?.keyPoints || [];
  const metrics = slide?.metrics || [];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1920 1080"
      className="slide-image"
      style={{ width: '100%', height: '100%', display: 'block', backgroundColor: '#060b14' }}
    >
      <defs>
        <linearGradient id="fallbackBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#040812" />
          <stop offset="50%" stopColor="#070e1c" />
          <stop offset="100%" stopColor="#0a1426" />
        </linearGradient>
        <linearGradient id="fallbackAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <pattern id="fallbackGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.025)" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="1920" height="1080" fill="url(#fallbackBg)" />
      <rect width="1920" height="1080" fill="url(#fallbackGrid)" />
      <circle cx="1700" cy="180" r="320" fill="rgba(56, 189, 248, 0.06)" filter="blur(60px)" />
      <circle cx="200" cy="900" r="360" fill="rgba(99, 102, 241, 0.07)" filter="blur(70px)" />

      {/* Slide Header */}
      <g transform="translate(140, 90)">
        <rect width="200" height="34" rx="8" fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1.5" />
        <text x="100" y="23" fontFamily="system-ui, -apple-system, sans-serif" fontSize="14" fontWeight="700" fill="#38bdf8" textAnchor="middle" letterSpacing="1.5">
          {category}
        </text>
        <text x="0" y="90" fontFamily="system-ui, -apple-system, sans-serif" fontSize="52" fontWeight="800" fill="#ffffff" letterSpacing="-0.5">
          {title}
        </text>
        {subtitle && (
          <text x="0" y="136" fontFamily="system-ui, -apple-system, sans-serif" fontSize="24" fontWeight="400" fill="#94a3b8">
            {subtitle}
          </text>
        )}
      </g>

      {/* Progress Divider */}
      <rect x="140" y="260" width="1640" height="2" fill="rgba(255, 255, 255, 0.08)" />
      <rect x="140" y="260" width={Math.round((slideNum / total) * 1640)} height="2" fill="url(#fallbackAccent)" />

      {/* Key Points */}
      <g>
        {keyPoints.slice(0, 4).map((pt, idx) => {
          const y = 340 + idx * 140;
          const rawPt = String(pt || '').trim();
          let line1 = rawPt;
          let line2 = '';
          if (rawPt.length > 52) {
            const splitIdx = rawPt.lastIndexOf(' ', 52);
            if (splitIdx > 0) {
              line1 = rawPt.substring(0, splitIdx);
              line2 = rawPt.substring(splitIdx + 1);
            }
          }
          return (
            <g key={idx} transform={`translate(140, ${y})`}>
              <rect width="980" height={line2 ? 120 : 100} rx="14" fill="#0d1527" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.2" />
              <circle cx="36" cy={line2 ? 46 : 50} r="16" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="2" />
              <text x="36" y={line2 ? 52 : 56} fontFamily="system-ui, sans-serif" fontSize="15" fontWeight="800" fill="#38bdf8" textAnchor="middle">
                {idx + 1}
              </text>
              <text x="74" y={line2 ? 40 : 56} fontFamily="system-ui, sans-serif" fontSize="22" fontWeight="500" fill="#f1f5f9">
                <tspan x="74" dy="0">{line1}</tspan>
                {line2 && <tspan x="74" dy="30" fill="#94a3b8" fontSize="19">{line2}</tspan>}
              </text>
            </g>
          );
        })}
      </g>

      {/* Metrics */}
      <g>
        {metrics.slice(0, 3).map((m, idx) => {
          const x = 1180;
          const y = 320 + idx * 170;
          return (
            <g key={idx} transform={`translate(${x}, ${y})`}>
              <rect width="600" height="145" rx="16" fill="#0e172a" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="2" />
              <rect x="0" y="0" width="6" height="145" rx="3" fill="#38bdf8" />
              <text x="32" y="44" fontFamily="system-ui, sans-serif" fontSize="20" fontWeight="600" fill="#94a3b8" letterSpacing="1">
                {m?.label || 'Metric'}
              </text>
              <text x="32" y="98" fontFamily="system-ui, sans-serif" fontSize="46" fontWeight="800" fill="#f8fafc">
                {m?.value || '100%'}
              </text>
              <text x="32" y="128" fontFamily="system-ui, sans-serif" fontSize="18" fontWeight="500" fill="#38bdf8">
                {m?.change || 'Benchmark target'}
              </text>
            </g>
          );
        })}
      </g>

      {/* Footer */}
      <g transform="translate(140, 990)">
        <text x="0" y="20" fontFamily="system-ui, sans-serif" fontSize="16" fontWeight="600" fill="#64748b">
          PPTxplains &#8226; AI-Generated Technical Deck
        </text>
        <text x="1640" y="20" fontFamily="system-ui, sans-serif" fontSize="16" fontWeight="700" fill="#38bdf8" textAnchor="end">
          Slide {slideNum} / {total}
        </text>
      </g>
    </svg>
  );
}

export const SlideViewer = memo(SlideViewerComponent);
