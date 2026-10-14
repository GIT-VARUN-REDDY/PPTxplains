import React, { useState, useEffect, useRef } from 'react';
import { Play, UploadCloud, ArrowRight, Mic, Sparkles, MessageSquare, Shield, Layers, ChevronDown, Link2 } from 'lucide-react';
import { UploadPresentationModal } from '../components/UploadPresentationModal.jsx';
import { CanvasBackground } from '../components/CanvasBackground.jsx';

/**
 * Editorial Pinned Scrollytelling Chapters
 */
const CHAPTERS = [
  {
    id: 'chapter-1',
    number: 'Chapter 01',
    subtitle: 'The Threshold',
    titleLine1: 'Analyze',
    titleLine2: 'Understand.',
    tagline: 'An immersive editorial journey through your presentation data.',
    description: 'Transform traditional passive slide decks into high-impact, interactive intelligence. Powered by advanced AI to synthesize, narrate, and explain your slides with precision.',
    hasCTA: true
  },
  {
    id: 'chapter-2',
    number: 'Chapter 02',
    subtitle: 'Procedural Intelligence',
    titleLine1: 'Cognitive',
    titleLine2: 'Synthesis.',
    tagline: 'Deep slide decomposition and benchmark extraction.',
    description: 'Our multimodal engine parses every technical architecture diagram, growth benchmark, and speaker note. It distills complex corporate decks into clear, executive-ready insights without cognitive overload.',
    features: [
      { icon: Layers, label: 'Slide Breakdown', detail: 'Deconstructs visual layouts into structured takeaways' },
      { icon: Shield, label: 'Deterministic Benchmarks', detail: 'Tracks baseline metrics and verified data points' }
    ]
  },
  {
    id: 'chapter-3',
    number: 'Chapter 03',
    subtitle: 'Conversational Voice',
    titleLine1: 'Speak To',
    titleLine2: 'The Data.',
    tagline: 'Natural keynote presentation with zero latency.',
    description: 'Studio-grade neural voice narration explains each slide with human breathing pauses and natural cadence. Ask spontaneous technical questions by voice or text and receive instant, slide-grounded answers.',
    features: [
      { icon: Mic, label: 'Neural Keynote Presenter', detail: 'Natural human cadence with breathing pauses' },
      { icon: MessageSquare, label: 'Contextual AI Doubt Desk', detail: 'Real-time answers grounded on the active slide' }
    ]
  }
];

export function LandingPage({ onStartPresentation }) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadModalTab, setUploadModalTab] = useState('link');
  const containerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0); // 0, 1, 2
  const isTransitioningRef = useRef(false);

  // Wheel listener: directly switches chapters smoothly when user spins mouse wheel / trackpad
  useEffect(() => {
    let wheelDeltaAccumulator = 0;
    const WHEEL_THRESHOLD = 80;

    const handleWheel = (e) => {
      // Accumulate delta
      wheelDeltaAccumulator += e.deltaY;

      if (Math.abs(wheelDeltaAccumulator) >= WHEEL_THRESHOLD && !isTransitioningRef.current) {
        if (wheelDeltaAccumulator > 0) {
          // Scroll down / next chapter
          setActiveStep((prev) => {
            const next = Math.min(CHAPTERS.length - 1, prev + 1);
            return next;
          });
        } else {
          // Scroll up / prev chapter
          setActiveStep((prev) => {
            const next = Math.max(0, prev - 1);
            return next;
          });
        }
        wheelDeltaAccumulator = 0;
        isTransitioningRef.current = true;
        setTimeout(() => {
          isTransitioningRef.current = false;
        }, 550);
      }
    };

    // Touch swipe support for mobile / tablets
    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartY - touchEndY;
      if (Math.abs(diffY) > 40 && !isTransitioningRef.current) {
        if (diffY > 0) {
          setActiveStep((prev) => Math.min(CHAPTERS.length - 1, prev + 1));
        } else {
          setActiveStep((prev) => Math.max(0, prev - 1));
        }
        isTransitioningRef.current = true;
        setTimeout(() => {
          isTransitioningRef.current = false;
        }, 550);
      }
    };

    // Keyboard arrow keys up/down/pageUp/pageDown
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setActiveStep((prev) => Math.min(CHAPTERS.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        setActiveStep((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const scrollToStep = (stepIndex) => {
    setActiveStep(stepIndex);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#010204',
        boxSizing: 'border-box'
      }}
    >
      {/* 3D Background - Fixed in viewport */}
      <CanvasBackground />

      {/* Persistent Glass Navigation Bar */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          minHeight: '64px',
          padding: '16px clamp(16px, 5vw, 48px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 60,
          background: 'rgba(1, 2, 4, 0.82)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/pptxplains-logo.png"
            alt="PPTxplains"
            style={{
              height: '34px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.5))'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => {
              setUploadModalTab('link');
              setIsUploadOpen(true);
            }}
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              color: '#38bdf8',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: '700',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.2)'
            }}
          >
            <Link2 size={13} /> Paste Link
          </button>

          <button
            onClick={() => {
              setUploadModalTab('file');
              setIsUploadOpen(true);
            }}
            style={{
              background: 'transparent',
              border: '1px solid rgba(59, 130, 246, 0.45)',
              color: '#93c5fd',
              padding: '8px 18px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: '600',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            <UploadCloud size={13} /> Upload Deck
          </button>

          <button
            onClick={onStartPresentation}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: '700',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 12px rgba(37, 99, 235, 0.4)'
            }}
          >
            <Play size={13} fill="currentColor" /> Launch
          </button>
        </div>
      </header>

      {/* STATIC PINNED VIEWPORT: The page NEVER moves down; text transitions in place */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(80px, 12vh, 120px) clamp(24px, 7vw, 10vw)',
          boxSizing: 'border-box'
        }}
      >
        {/* Right Lateral Chapter Progress Indicator */}
        <div
          style={{
            position: 'absolute',
            right: 'clamp(20px, 4vw, 48px)',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            zIndex: 40,
            pointerEvents: 'auto'
          }}
        >
          {CHAPTERS.map((ch, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={ch.id}
                onClick={() => scrollToStep(idx)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  outline: 'none'
                }}
                title={`Jump to ${ch.number}`}
              >
                <span
                  className="hide-on-mobile"
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                    transition: 'color 300ms ease'
                  }}
                >
                  {ch.number}
                </span>
                <div
                  style={{
                    width: isActive ? '24px' : '8px',
                    height: '4px',
                    borderRadius: '2px',
                    backgroundColor: isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.25)',
                    boxShadow: isActive ? '0 0 10px #3b82f6' : 'none',
                    transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Dynamic Chapter Text Overlay Container (Morphs & Fades In Place) */}
        <div style={{ position: 'relative', maxWidth: '1000px', width: '100%' }}>
          {CHAPTERS.map((chapter, idx) => {
            const isActive = activeStep === idx;
            return (
              <div
                key={chapter.id}
                style={{
                  position: idx === 0 ? 'relative' : 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  opacity: isActive ? 1 : 0,
                  transform: isActive
                    ? 'translateY(0) scale(1)'
                    : activeStep > idx
                    ? 'translateY(-30px) scale(0.98)'
                    : 'translateY(30px) scale(0.98)',
                  filter: isActive ? 'blur(0px)' : 'blur(6px)',
                  transition: 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1), filter 500ms ease',
                  pointerEvents: isActive ? 'auto' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'clamp(14px, 2.5vh, 24px)'
                }}
              >
                {/* Chapter Pre-header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '28px', height: '2px', background: '#3b82f6' }} />
                  <span
                    style={{
                      color: '#93c5fd',
                      fontSize: 'clamp(11px, 1.6vw, 13px)',
                      letterSpacing: '4px',
                      textTransform: 'uppercase',
                      fontWeight: '700'
                    }}
                  >
                    {chapter.number} &mdash; {chapter.subtitle}
                  </span>
                </div>

                {/* Monumental Headline */}
                <h1
                  style={{
                    fontSize: 'clamp(46px, 8.5vw, 120px)',
                    fontWeight: '300',
                    lineHeight: '0.94',
                    color: '#ffffff',
                    letterSpacing: '-2px',
                    margin: 0,
                    wordBreak: 'break-word'
                  }}
                >
                  {chapter.titleLine1} <br />
                  <span style={{ fontStyle: 'italic', color: '#3b82f6', fontWeight: '400' }}>
                    {chapter.titleLine2}
                  </span>
                </h1>

                {/* Lead Subtitle & Description */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '620px' }}>
                  <p
                    style={{
                      color: '#ffffff',
                      fontSize: 'clamp(15px, 2.2vw, 18px)',
                      lineHeight: '1.5',
                      fontWeight: '600',
                      margin: 0
                    }}
                  >
                    {chapter.tagline}
                  </p>
                  <p
                    style={{
                      color: '#93c5fd',
                      fontSize: 'clamp(13px, 1.8vw, 15px)',
                      lineHeight: '1.7',
                      margin: 0,
                      fontWeight: '400'
                    }}
                  >
                    {chapter.description}
                  </p>
                </div>

                {/* Chapter Features Cards (for Ch 2 & 3) */}
                {chapter.features && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '16px',
                      marginTop: '8px',
                      maxWidth: '680px'
                    }}
                  >
                    {chapter.features.map((feat, fIdx) => {
                      const IconComp = feat.icon;
                      return (
                        <div
                          key={fIdx}
                          style={{
                            padding: '14px 16px',
                            backgroundColor: 'rgba(10, 17, 40, 0.75)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
                            <IconComp size={16} />
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>
                              {feat.label}
                            </span>
                          </div>
                          <span style={{ fontSize: '12px', color: '#93c5fd', lineHeight: '1.5' }}>
                            {feat.detail}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* CTA Action Buttons (Chapter 1) */}
                {chapter.hasCTA && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '10px' }}>
                    <button
                      onClick={onStartPresentation}
                      style={{
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        color: '#ffffff',
                        border: 'none',
                        padding: 'clamp(14px, 2vw, 18px) clamp(28px, 4vw, 40px)',
                        borderRadius: '6px',
                        fontSize: 'clamp(11px, 1.6vw, 12.5px)',
                        fontWeight: '700',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 24px rgba(37, 99, 235, 0.5)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <Play size={15} fill="currentColor" /> Enter The Experience
                    </button>

                    <button
                      onClick={() => {
                        setUploadModalTab('link');
                        setIsUploadOpen(true);
                      }}
                      style={{
                        background: 'rgba(56, 189, 248, 0.12)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.45)',
                        padding: 'clamp(14px, 2vw, 18px) clamp(22px, 3vw, 32px)',
                        borderRadius: '6px',
                        fontSize: 'clamp(11px, 1.6vw, 12.5px)',
                        fontWeight: '700',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 20px rgba(56, 189, 248, 0.25)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Link2 size={16} /> Paste Post Link
                    </button>

                    <button
                      onClick={() => {
                        setUploadModalTab('file');
                        setIsUploadOpen(true);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: 'clamp(14px, 2vw, 18px) clamp(22px, 3vw, 32px)',
                        borderRadius: '6px',
                        fontSize: 'clamp(11px, 1.6vw, 12.5px)',
                        fontWeight: '600',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <UploadCloud size={15} /> Upload Slides
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Pinned Helper Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 'clamp(16px, 3vh, 32px)',
            left: 'clamp(24px, 7vw, 10vw)',
            right: 'clamp(24px, 7vw, 10vw)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '12px',
            pointerEvents: 'auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#93c5fd', fontSize: '11px', fontWeight: '600', letterSpacing: '1px' }}>
            <span style={{ color: '#3b82f6' }}>0{activeStep + 1}</span>
            <span style={{ opacity: 0.4 }}>/</span>
            <span>03</span>
            <span className="hide-on-mobile" style={{ marginLeft: '8px', color: 'rgba(255, 255, 255, 0.4)' }}>
              &bull; Scroll to explore narrative
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onStartPresentation}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px'
              }}
            >
              Skip to Presentation <ArrowRight size={13} color="#3b82f6" />
            </button>
          </div>
        </div>
      </div>

      <UploadPresentationModal
        isOpen={isUploadOpen}
        initialTab={uploadModalTab}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={(newId) => {
          window.location.href = `/presentation/${newId}`;
        }}
      />
    </div>
  );
}
