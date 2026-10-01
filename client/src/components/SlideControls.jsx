import React, { useState, memo } from 'react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Clock, 
  Keyboard,
  Square,
  Crosshair,
  Gauge,
  Mic,
  BookOpen
} from 'lucide-react';

function SlideControlsComponent({
  isPlaying,
  progress,
  durationSec,
  currentSlideIndex,
  totalSlides,
  isVoiceSynced = false,
  currentSlideDurationSec,
  laserActive = false,
  isNotesOpen = false,
  onToggleNotes,
  speechRate = 1.0,
  onSpeechRateChange,
  voices = [],
  selectedVoiceURI = '',
  onVoiceChange,
  onToggleLaser,
  onTogglePlay,
  onNext,
  onPrev,
  onRestart,
  onDurationChange,
  onSeek
}) {
  const [hoverPct, setHoverPct] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    onSeek?.(pct);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    setHoverPct(pct);
  };

  const handleCycleRate = () => {
    const rates = [1.0, 1.15, 1.25, 1.5];
    const currentIndex = rates.indexOf(speechRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    onSpeechRateChange?.(nextRate);
  };

  return (
    <footer
      style={{
        height: 'var(--bottom-bar-height)',
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 20
      }}
    >
      {/* Interactive Seekable Slide Progression Bar */}
      <div
        onClick={handleProgressClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoverPct(null);
        }}
        style={{
          width: '100%',
          height: isHovered ? '9px' : '5px',
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          position: 'relative',
          cursor: 'pointer',
          transition: 'height 160ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          userSelect: 'none'
        }}
        title={`Click anywhere to seek & continue explanation (${Math.round(progress)}%)`}
      >
        {/* Hover preview fill */}
        {isHovered && hoverPct !== null && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${hoverPct}%`,
              backgroundColor: 'rgba(56, 189, 248, 0.25)',
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Current playback fill (Hardware-accelerated continuous linear motion) */}
        <div
          style={{
            height: '100%',
            width: `${Math.min(100, Math.max(0, Number(progress) || 0))}%`,
            background: 'var(--accent-gradient)',
            transition: isPlaying
              ? 'none'
              : 'width 240ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            boxShadow: '0 0 12px rgba(56, 189, 248, 0.85)',
            position: 'relative',
            willChange: 'width'
          }}
        />

        {/* Glowing Scrubber Thumb (Moving in continuous lockstep with zero lag) */}
        <div
          style={{
            position: 'absolute',
            left: `${Math.min(100, Math.max(0, Number(progress) || 0))}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: isHovered ? '13px' : '9px',
            height: isHovered ? '13px' : '9px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 8px #38bdf8, 0 0 16px rgba(56, 189, 248, 0.9)',
            pointerEvents: 'none',
            transition: isPlaying
              ? 'width 140ms ease, height 140ms ease'
              : 'left 240ms cubic-bezier(0.2, 0.8, 0.2, 1), width 140ms ease, height 140ms ease',
            willChange: 'left'
          }}
        />

        {/* Hover Tooltip showing target percentage */}
        {isHovered && hoverPct !== null && (
          <div
            style={{
              position: 'absolute',
              left: `${hoverPct}%`,
              bottom: '14px',
              transform: 'translateX(-50%)',
              backgroundColor: '#0c1626',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#38bdf8',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'none',
              zIndex: 30
            }}
          >
            Seek to {Math.round(hoverPct)}%
          </div>
        )}
      </div>

      {/* Control Buttons Container */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: '100%'
        }}
      >
        {/* Left Section: Restart & Slide Counter Dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onRestart}
            className="btn btn-ghost"
            style={{ fontSize: '13px', padding: '6px 10px' }}
            title="Restart Presentation from Slide 1"
          >
            <RotateCcw size={15} />
            <span className="hide-on-mobile">Restart</span>
          </button>

          {/* Virtual Laser Pointer Toggle */}
          <button
            onClick={onToggleLaser}
            className={`btn ${laserActive ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              fontSize: '12px',
              padding: '5px 10px',
              height: '32px',
              gap: '6px',
              border: laserActive ? 'none' : '1px solid var(--border-subtle)'
            }}
            title={laserActive ? "Laser Pointer ON (Press 'L' to toggle)" : "Presenter Laser Pointer (Press 'L')"}
            aria-label="Toggle Laser Pointer"
          >
            <Crosshair size={13} style={{ color: laserActive ? '#060b14' : 'var(--accent-cyan)' }} />
            <span className="hide-on-mobile">{laserActive ? 'Laser ON' : 'Laser (L)'}</span>
          </button>

          {/* Presenter Notes & Teleprompter Toggle (Feature 7) */}
          {onToggleNotes && (
            <button
              onClick={onToggleNotes}
              className={`btn ${isNotesOpen ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                fontSize: '12px',
                padding: '5px 10px',
                height: '32px',
                gap: '6px',
                border: isNotesOpen ? 'none' : '1px solid var(--border-subtle)'
              }}
              title={isNotesOpen ? "Presenter Notes ON (Press 'P' to close)" : "Speaker Notes & Teleprompter (Press 'P')"}
              aria-label="Toggle Presenter Notes"
            >
              <BookOpen size={13} style={{ color: isNotesOpen ? '#060b14' : 'var(--accent-cyan)' }} />
              <span className="hide-on-mobile">{isNotesOpen ? 'Notes ON' : 'Notes (P)'}</span>
            </button>
          )}

          {/* Dots Indicator */}
          <div className="hide-on-mobile" style={{ display: 'flex', gap: '5px', marginLeft: '8px' }}>
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: idx === currentSlideIndex ? '18px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor:
                    idx === currentSlideIndex
                      ? 'var(--accent-cyan)'
                      : idx < currentSlideIndex
                      ? 'var(--accent-indigo)'
                      : 'var(--border-subtle)',
                  transition: 'all 200ms ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Center Section: Single Unified START / STOP Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onPrev}
            disabled={currentSlideIndex === 0}
            className="btn btn-secondary btn-icon"
            style={{ width: '40px', height: '40px' }}
            title="Previous Slide (←)"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={onTogglePlay}
            className={`btn ${isPlaying ? 'btn-danger' : 'btn-primary'}`}
            style={{
              height: '42px',
              padding: '0 24px',
              fontSize: '14px',
              fontWeight: '700',
              letterSpacing: '0.4px',
              minWidth: '115px',
              gap: '8px'
            }}
            title={isPlaying ? 'Stop Presentation & Voice (Space)' : 'Start Presentation & Voice (Space)'}
            aria-label={isPlaying ? 'Stop Presentation' : 'Start Presentation'}
          >
            {isPlaying ? (
              <>
                <Square size={13} fill="currentColor" />
                <span>STOP</span>
              </>
            ) : (
              <>
                <Play size={15} fill="currentColor" />
                <span>START</span>
              </>
            )}
          </button>

          <button
            onClick={onNext}
            disabled={currentSlideIndex === totalSlides - 1}
            className="btn btn-secondary btn-icon"
            style={{ width: '40px', height: '40px' }}
            title="Next Slide (→)"
            aria-label="Next Slide"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Right Section: Speed Rate, Voice Selector, Duration Selector & Keyboard Hint */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Feature 5: Presenter Speech Rate Toggle */}
          {onSpeechRateChange && (
            <button
              onClick={handleCycleRate}
              className="btn btn-ghost"
              style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '4px 8px',
                height: '30px',
                borderRadius: '6px',
                backgroundColor: speechRate !== 1.0 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid',
                borderColor: speechRate !== 1.0 ? 'rgba(56, 189, 248, 0.35)' : 'var(--border-subtle)',
                color: speechRate !== 1.0 ? '#38bdf8' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title={`Speech speed: ${speechRate}x (Click to cycle 1.0x → 1.15x → 1.25x → 1.5x)`}
              aria-label="Change Speech Speed"
            >
              <Gauge size={13} />
              <span>{speechRate}x</span>
            </button>
          )}

          {/* Feature 5: Voice Selector */}
          {voices && voices.length > 0 && onVoiceChange && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hide-on-mobile">
              <Mic size={12} style={{ color: 'var(--accent-primary, #06b6d4)' }} />
              <select
                value={selectedVoiceURI}
                onChange={(e) => onVoiceChange(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--accent-primary, #06b6d4)',
                  border: '1px solid rgba(6,182,212,0.45)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '3px 6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  outline: 'none',
                  maxWidth: '160px'
                }}
                title="Select Narrator Voice"
                aria-label="Select Narrator Voice"
              >
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Duration Selector (only in manual duration mode) */}
          {!isVoiceSynced && onDurationChange && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="hide-on-mobile">
              <Clock size={14} style={{ color: 'var(--text-muted)' }} />
              <select
                value={durationSec}
                onChange={(e) => onDurationChange(Number(e.target.value))}
                style={{
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
                title="Slide auto-advance duration"
              >
                <option value={8}>8s / slide</option>
                <option value={12}>12s / slide</option>
                <option value={16}>16s / slide</option>
                <option value={20}>20s / slide</option>
              </select>
            </div>
          )}

          {/* Keyboard Shortcuts Hint */}
          <div
            className="hide-on-mobile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: 'var(--text-muted)'
            }}
            title="Keyboard shortcuts: Space (Play/Pause), Left/Right Arrows, F (Fullscreen), L (Laser), C (Captions), M (Mute)"
          >
            <Keyboard size={13} />
            <span>Space / Arrows / L / P</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export const SlideControls = memo(SlideControlsComponent);
