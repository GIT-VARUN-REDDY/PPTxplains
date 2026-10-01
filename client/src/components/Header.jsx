import React, { useState, memo } from 'react';
import { 
  Maximize, 
  Minimize, 
  Share2, 
  Grid, 
  Presentation, 
  ChevronLeft, 
  Check, 
  Volume2, 
  VolumeX, 
  MessageSquareText, 
  PlayCircle,
  FileText,
  HelpCircle,
  UploadCloud 
} from 'lucide-react';

function HeaderComponent({
  title,
  currentSlideNumber,
  totalSlides,
  isFullscreen,
  showSubtitles,
  onToggleSubtitles,
  autoSlide = true,
  onToggleAutoSlide,
  autoNarrate,
  onToggleAutoNarrate,
  onToggleFullscreen,
  onOpenOverview,
  onOpenBrief,
  onOpenQuiz,
  onOpenUpload,
  onBackToHome
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      });
    }
  };

  return (
    <header
      className="header-container"
      style={{
        height: 'var(--header-height, 60px)',
        backgroundColor: 'var(--bg-surface, #090e1a)',
        borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 18px',
        position: 'relative',
        zIndex: 20,
        gap: '16px'
      }}
    >
      {/* Left: Home Navigation, Logo, Title & Slide Counter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: '1 1 auto' }}>
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="btn btn-ghost btn-icon"
            style={{ width: '32px', height: '32px', borderRadius: '6px', flexShrink: 0 }}
            title="Return to Home"
            aria-label="Return to Home"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Executive Deck Brand Icon */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.16) 0%, rgba(59, 130, 246, 0.16) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.32)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary, #06b6d4)',
            flexShrink: 0
          }}
        >
          <Presentation size={17} />
        </div>

        {/* Title & Integrated Slide Pill */}
        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1
            style={{
              fontSize: '14.5px',
              fontWeight: '600',
              color: 'var(--text-primary, #f8fafc)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '-0.2px',
              margin: 0
            }}
          >
            {title || 'AI-Generated Technical Videos Strategy'}
          </h1>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '11.5px',
              color: 'var(--text-secondary, #94a3b8)',
              flexShrink: 0
            }}
          >
            <span style={{ color: 'var(--accent-primary, #06b6d4)', fontWeight: '600' }}>{currentSlideNumber}</span>
            <span style={{ opacity: 0.4 }}>/</span>
            <span>{totalSlides}</span>
          </div>
        </div>
      </div>

      {/* Right Controls: Grouped Clusters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {/* Cluster 1: Playback Toggles (Segmented Glass Pill) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            padding: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: '8px'
          }}
        >
          {/* Auto Slide Toggle */}
          <button
            onClick={onToggleAutoSlide}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              border: autoSlide ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
              backgroundColor: autoSlide ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
              color: autoSlide ? '#38bdf8' : 'var(--text-muted, #64748b)',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
            title={autoSlide ? 'Auto-Advance Slides: ON (Click to disable)' : 'Auto-Advance Slides: OFF (Click to enable)'}
            aria-label="Toggle Auto Slide"
          >
            <PlayCircle size={14} style={{ color: autoSlide ? '#38bdf8' : 'var(--text-muted, #64748b)' }} />
            <span>Auto Slide</span>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: autoSlide ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)',
                boxShadow: autoSlide ? '0 0 6px rgba(56, 189, 248, 0.8)' : 'none'
              }}
            />
          </button>

          {/* Voice Narrator Toggle */}
          <button
            onClick={onToggleAutoNarrate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              border: autoNarrate ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
              backgroundColor: autoNarrate ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
              color: autoNarrate ? '#38bdf8' : 'var(--text-muted, #64748b)',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
            title={autoNarrate ? 'Auto Voice: ON (Click to mute)' : 'Auto Voice: MUTED (Click to activate)'}
            aria-label="Toggle Auto Voice Narration"
          >
            {autoNarrate ? <Volume2 size={14} style={{ color: '#38bdf8' }} /> : <VolumeX size={14} />}
            <span>Voice</span>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: autoNarrate ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)',
                boxShadow: autoNarrate ? '0 0 6px rgba(56, 189, 248, 0.8)' : 'none'
              }}
            />
          </button>

          {/* Subtitles (CC) Toggle */}
          <button
            onClick={onToggleSubtitles}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 9px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              border: showSubtitles ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
              backgroundColor: showSubtitles ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
              color: showSubtitles ? '#38bdf8' : 'var(--text-muted, #64748b)',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
            title={showSubtitles ? 'Subtitles: ON' : 'Subtitles: OFF'}
            aria-label="Toggle Subtitles"
          >
            <MessageSquareText size={14} style={{ color: showSubtitles ? '#38bdf8' : 'var(--text-muted, #64748b)' }} />
            <span>CC</span>
          </button>
        </div>

        {/* Subtle Vertical Hairline Divider */}
        <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border-subtle, rgba(255,255,255,0.08))' }} />

        {/* Cluster 2: Workspace Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Slides Grid Overview */}
          <button
            onClick={onOpenOverview}
            className="btn btn-secondary"
            style={{
              fontSize: '12px',
              padding: '5px 10px',
              height: '32px',
              gap: '5px',
              backgroundColor: 'var(--bg-surface-elevated, #111827)',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))'
            }}
            title="View All Slides Grid (O or G)"
            aria-label="View All Slides Grid"
          >
            <Grid size={13} style={{ color: 'var(--text-secondary, #94a3b8)' }} />
            <span className="hide-on-mobile">Slides</span>
          </button>

          {/* Executive Brief */}
          {onOpenBrief && (
            <button
              onClick={onOpenBrief}
              className="btn btn-secondary"
              style={{
                fontSize: '12px',
                padding: '5px 10px',
                height: '32px',
                gap: '5px',
                backgroundColor: 'var(--bg-surface-elevated, #111827)',
                border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))'
              }}
              title="Export Executive Meeting Brief & Q&A Report"
              aria-label="Export Executive Meeting Brief & Q&A Report"
            >
              <FileText size={13} style={{ color: 'var(--text-secondary, #94a3b8)' }} />
              <span className="hide-on-mobile">Brief</span>
            </button>
          )}

          {/* Knowledge Check / Quiz */}
          {onOpenQuiz && (
            <button
              onClick={onOpenQuiz}
              className="btn btn-secondary"
              style={{
                fontSize: '12px',
                padding: '5px 10px',
                height: '32px',
                gap: '5px',
                backgroundColor: 'var(--bg-surface-elevated, #111827)',
                border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))'
              }}
              title="Slide Comprehension Check"
              aria-label="Slide Comprehension Check"
            >
              <HelpCircle size={13} style={{ color: 'var(--text-secondary, #94a3b8)' }} />
              <span className="hide-on-mobile">Quiz</span>
            </button>
          )}
        </div>

        {/* Subtle Vertical Hairline Divider */}
        <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border-subtle, rgba(255,255,255,0.08))' }} />

        {/* Cluster 3: Utilities (Clean Compact Icon Buttons) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Upload Presentation */}
          {onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="btn btn-ghost btn-icon"
              style={{ height: '32px', width: '32px', borderRadius: '6px' }}
              title="Upload Presentation (.pptx / .pdf)"
              aria-label="Upload Presentation"
            >
              <UploadCloud size={15} style={{ color: 'var(--text-secondary, #94a3b8)' }} />
            </button>
          )}

          {/* Share Link */}
          <button
            onClick={handleShare}
            className="btn btn-ghost btn-icon"
            style={{ height: '32px', width: '32px', borderRadius: '6px' }}
            title={copied ? `Slide ${currentSlideNumber} link copied to clipboard!` : 'Copy Shareable Slide Link'}
            aria-label="Copy Shareable Presentation Link"
          >
            {copied ? (
              <Check size={15} style={{ color: 'var(--text-success, #10b981)' }} />
            ) : (
              <Share2 size={15} style={{ color: 'var(--text-secondary, #94a3b8)' }} />
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={onToggleFullscreen}
            className="btn btn-ghost btn-icon"
            style={{ height: '32px', width: '32px', borderRadius: '6px' }}
            title={isFullscreen ? 'Exit Fullscreen (Esc or F)' : 'Enter Fullscreen (F)'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export const Header = memo(HeaderComponent);
