import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Header } from '../components/Header.jsx';
import { SlideViewer } from '../components/SlideViewer.jsx';
import { SlideControls } from '../components/SlideControls.jsx';
import { AIDoubtPanel } from '../components/AIDoubtPanel.jsx';
import { SlideOverviewModal } from '../components/SlideOverviewModal.jsx';
import { ExecutiveBriefModal } from '../components/ExecutiveBriefModal.jsx';
import { KnowledgeCheckModal } from '../components/KnowledgeCheckModal.jsx';
import { UploadPresentationModal } from '../components/UploadPresentationModal.jsx';
import { usePresentation } from '../hooks/usePresentation.js';
import { useSpeechSynthesis, estimateSpeechDurationSec, cleanTextForSpeech } from '../hooks/useSpeechSynthesis.js';
import { useAIDoubt } from '../hooks/useAIDoubt.js';
import { useFullscreen } from '../hooks/useFullscreen.js';

export function PresentationPage({
  presentationId = 'ai-video-strategy',
  onBackToHome
}) {
  const containerRef = useRef(null);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [autoNarrate, setAutoNarrate] = useState(false);
  const [autoSlide, setAutoSlide] = useState(true); // Auto-advance slides upon completion
  const [hasStarted, setHasStarted] = useState(false);
  const [laserActive, setLaserActive] = useState(false);

  // Deep link URL parsing: ?slide=X
  const initialSlide = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    const params = new URLSearchParams(window.location.search);
    const s = parseInt(params.get('slide'), 10);
    return s >= 1 ? s : 1;
  }, []);

  // Presentation State (voiceSync option connects slide progression to voice narration)
  const {
    presentation,
    currentSlide,
    currentSlideIndex,
    totalSlides,
    isPlaying,
    progress,
    setProgress,
    durationSec,
    isCompleted,
    loading,
    error: presentationError,
    start,
    pause,
    nextSlide,
    prevSlide,
    goToSlide,
    restart,
    seekTo: presentationSeekTo,
    setDurationSec
  } = usePresentation(presentationId, { voiceSync: autoNarrate, initialSlide });

  // Synchronize active slide with browser URL deep link (?slide=X)
  useEffect(() => {
    if (!currentSlide) return;
    const currentNum = currentSlide.slideNumber || currentSlideIndex + 1;
    const url = new URL(window.location.href);
    if (url.searchParams.get('slide') !== String(currentNum)) {
      url.searchParams.set('slide', currentNum);
      window.history.replaceState({ slide: currentNum }, '', url.toString());
    }
  }, [currentSlide, currentSlideIndex]);

  // Speech Synthesis Hook (TTS for both slide narration & AI doubt assistant)
  const {
    isSpeaking,
    isPaused,
    spokenCharIndex,
    setSpokenCharIndex,
    voices,
    speechRate,
    setSpeechRate,
    selectedVoiceURI,
    setSelectedVoiceURI,
    speak,
    seekToPercent,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking
  } = useSpeechSynthesis();

  const speechRateRef = useRef(speechRate);
  speechRateRef.current = speechRate;

  // Fresh mutable state references to guarantee zero stale closure issues in speech/timers
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const autoSlideRef = useRef(autoSlide);
  autoSlideRef.current = autoSlide;

  const autoNarrateRef = useRef(autoNarrate);
  autoNarrateRef.current = autoNarrate;

  const currentSlideRef = useRef(currentSlide);
  currentSlideRef.current = currentSlide;

  const currentSlideIndexRef = useRef(currentSlideIndex);
  currentSlideIndexRef.current = currentSlideIndex;

  const totalSlidesRef = useRef(totalSlides);
  totalSlidesRef.current = totalSlides;

  const isCompletedRef = useRef(isCompleted);
  isCompletedRef.current = isCompleted;

  const spokenCharIndexRef = useRef(spokenCharIndex);
  spokenCharIndexRef.current = spokenCharIndex;

  // Dynamic estimated slide duration in seconds based on explanation text and speech rate
  const currentSlideDurationSec = useMemo(() => {
    if (!currentSlide) return durationSec;
    return estimateSpeechDurationSec(currentSlide.narration || currentSlide.context, speechRate);
  }, [currentSlide, durationSec, speechRate]);

  // Timers and animation frame references for synchronization
  const speechStartTimeRef = useRef(null);
  const progressAnimFrameRef = useRef(null);
  const slideAdvanceTimerRef = useRef(null);

  const clearAdvanceTimer = useCallback(() => {
    if (slideAdvanceTimerRef.current) {
      clearTimeout(slideAdvanceTimerRef.current);
      slideAdvanceTimerRef.current = null;
    }
  }, []);

  const clearProgressAnim = useCallback(() => {
    if (progressAnimFrameRef.current) {
      cancelAnimationFrame(progressAnimFrameRef.current);
      progressAnimFrameRef.current = null;
    }
  }, []);

  // Slide narration management: Syncs slide end time and progress bar with explanation
  const playSlideNarration = useCallback((slideParam = null, startPct = 0, onlyTimeline = false) => {
    const slideToPlay = slideParam || currentSlideRef.current;
    if (!slideToPlay) return;

    setHasStarted(true);
    if (!isPlayingRef.current) {
      start();
    }

    clearAdvanceTimer();
    clearProgressAnim();

    const textToSpeak = slideToPlay.narration || slideToPlay.context;
    const cleanText = cleanTextForSpeech(textToSpeak);
    const totalChars = cleanText.length || 1;
    // Conversational pacing ~13.6 characters per second adjusted by speechRate
    const currentRate = speechRateRef.current || 1.0;
    const totalDurationMs = Math.max(4000, (totalChars / (13.6 * currentRate)) * 1000);

    const clampedStartPct = Math.max(0, Math.min(100, Number(startPct) || 0));
    const targetCharIndex = Math.min(totalChars - 1, Math.round((clampedStartPct / 100) * totalChars));
    let activeDurationMs = totalDurationMs;

    const startProgressLoop = (exactMs) => {
      clearProgressAnim();
      if (exactMs && exactMs > 0) {
        activeDurationMs = exactMs;
      }
      const elapsedOffsetMs = (clampedStartPct / 100) * activeDurationMs;
      speechStartTimeRef.current = Date.now() - elapsedOffsetMs;
      setProgress(clampedStartPct);

      // Continuous, linear, uninterrupted 60fps/120fps smooth progression:
      const updateSmoothProgress = () => {
        if (!speechStartTimeRef.current) return;
        const elapsedMs = Math.max(0, Date.now() - speechStartTimeRef.current);

        const rawPct = (elapsedMs / activeDurationMs) * 100;

        // In the final 5% before speech ends, smoothly glide towards 99.4% without halting
        let currentPct;
        if (rawPct < 95) {
          currentPct = rawPct;
        } else {
          const excess = rawPct - 95;
          currentPct = 95 + (4.4 * (1 - Math.exp(-excess / 10)));
        }

        const clamped = Math.min(99.4, Math.max(0, parseFloat(currentPct.toFixed(2))));
        setProgress(clamped);
        progressAnimFrameRef.current = requestAnimationFrame(updateSmoothProgress);
      };

      progressAnimFrameRef.current = requestAnimationFrame(updateSmoothProgress);
    };

    startProgressLoop(totalDurationMs);

    // If only updating timeline (audio already seeked directly via seekToPercent):
    if (onlyTimeline) {
      spokenCharIndexRef.current = targetCharIndex;
      setSpokenCharIndex(targetCharIndex);
      return;
    }

    speak(textToSpeak, {
      rate: currentRate,
      startCharOffset: targetCharIndex,
      onStart: ({ duration }) => {
        if (duration && duration > 0) {
          startProgressLoop(duration * 1000);
        }
      },
      onBoundary: (charIndex) => {
        spokenCharIndexRef.current = charIndex;
      },
      onEnd: () => {
        // Voice explanation has reached the end!
        clearProgressAnim();
        speechStartTimeRef.current = null;

        // Slide progression bar reaches 100% synchronized with the end of speech
        setProgress(100);

        // If autoSlide is enabled and presentation is playing, automatically advance to next slide!
        if (autoSlideRef.current && isPlayingRef.current) {
          clearAdvanceTimer();
          slideAdvanceTimerRef.current = setTimeout(() => {
            if (isPlayingRef.current && autoSlideRef.current) {
              if (currentSlideIndexRef.current < totalSlidesRef.current - 1) {
                nextSlide();
              }
            }
          }, 800);
        }
      }
    });
  }, [speak, clearAdvanceTimer, clearProgressAnim, setProgress, nextSlide, start, setSpokenCharIndex]);

  // Interactive seeking handler: continues presentation & narration from clicked point (forward & backward)
  const handleSeek = useCallback((pct) => {
    const clampedPct = Math.max(0, Math.min(99.4, pct));
    setHasStarted(true);
    setShowSubtitles(true);
    setAutoNarrate(true);
    setProgress(clampedPct);

    if (!isPlayingRef.current) {
      start();
    }

    // Try instant seek in active audio without network re-fetch
    const didSeekAudio = seekToPercent(clampedPct);
    if (didSeekAudio) {
      playSlideNarration(currentSlide, clampedPct, true);
    } else {
      playSlideNarration(currentSlide, clampedPct, false);
    }

    if (presentationSeekTo) {
      presentationSeekTo(clampedPct);
    }
  }, [start, playSlideNarration, currentSlide, seekToPercent, setProgress, presentationSeekTo]);

  // Primary Start / Stop handler:
  // - START: Starts presentation, activates subtitles, enables auto-advance, and speaks slide narration
  // - STOP: Stops presentation and stops voice narration immediately
  const handleTogglePlay = useCallback(() => {
    if (!isPlaying) {
      // Starting or Resuming
      setHasStarted(true);
      setShowSubtitles(true);
      setAutoNarrate(true);
      start();

      if (isPaused) {
        resumeSpeaking();
      } else if (!isSpeaking) {
        playSlideNarration();
      }
    } else {
      // Stopping
      pause();
      clearAdvanceTimer();
      clearProgressAnim();
      stopSpeaking();
    }
  }, [isPlaying, isPaused, isSpeaking, start, pause, playSlideNarration, stopSpeaking, resumeSpeaking, clearAdvanceTimer, clearProgressAnim]);

  const handleRestart = useCallback(() => {
    clearAdvanceTimer();
    clearProgressAnim();
    stopSpeaking();
    setHasStarted(true);
    setProgress(0);
    restart();
    if (autoNarrateRef.current || isPlayingRef.current) {
      const slideZero = presentation?.slides?.[0] || currentSlide;
      const t = setTimeout(() => {
        playSlideNarration(slideZero, 0);
      }, 100);
      return () => clearTimeout(t);
    }
  }, [clearAdvanceTimer, clearProgressAnim, stopSpeaking, restart, setProgress, presentation, currentSlide, playSlideNarration]);

  const handleNext = useCallback(() => {
    clearAdvanceTimer();
    clearProgressAnim();
    stopSpeaking();
    setHasStarted(true);
    setProgress(0);
    nextSlide();
  }, [clearAdvanceTimer, clearProgressAnim, stopSpeaking, nextSlide, setProgress]);

  const handlePrev = useCallback(() => {
    clearAdvanceTimer();
    clearProgressAnim();
    stopSpeaking();
    setHasStarted(true);
    setProgress(0);
    prevSlide();
  }, [clearAdvanceTimer, clearProgressAnim, stopSpeaking, prevSlide, setProgress]);

  const handleGoToSlide = useCallback((idx) => {
    clearAdvanceTimer();
    clearProgressAnim();
    stopSpeaking();
    setHasStarted(true);
    setProgress(0);
    goToSlide(idx);
  }, [clearAdvanceTimer, clearProgressAnim, stopSpeaking, goToSlide, setProgress]);

  // Pause speech & presentation when opening full-screen modals
  const handleOpenModal = useCallback((setter) => {
    if (isPlayingRef.current || isSpeaking) {
      pause();
      pauseSpeaking();
      clearAdvanceTimer();
      clearProgressAnim();
    }
    setter(true);
  }, [pause, pauseSpeaking, clearAdvanceTimer, clearProgressAnim, isSpeaking]);

  // Automatically start next slide when currentSlideIndex advances
  const prevSlideIndexRef = useRef(currentSlideIndex);
  useEffect(() => {
    if (prevSlideIndexRef.current !== currentSlideIndex) {
      prevSlideIndexRef.current = currentSlideIndex;
      clearAdvanceTimer();
      clearProgressAnim();
      stopSpeaking();
      setProgress(0);

      // Automatically start narration on the new slide if autoNarrate/isPlaying is active
      if ((autoNarrateRef.current || isPlayingRef.current) && !isCompletedRef.current) {
        const targetSlide = presentation?.slides?.[currentSlideIndex] || currentSlide;
        const timer = setTimeout(() => {
          playSlideNarration(targetSlide);
        }, 250);
        return () => clearTimeout(timer);
      }
    }
  }, [currentSlideIndex, presentation, currentSlide, playSlideNarration, stopSpeaking, clearAdvanceTimer, clearProgressAnim, setProgress]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearAdvanceTimer();
      clearProgressAnim();
    };
  }, [clearAdvanceTimer, clearProgressAnim]);

  // AI Doubt State
  const {
    status,
    activeQuestion,
    activeAnswer,
    error: aiError,
    doubtHistory,
    slideChangedNotice,
    cancelDoubt,
    newDoubt,
    submitDoubt
  } = useAIDoubt({
    presentationId,
    currentSlide,
    speak: (text) => {
      // When AI Doubt speaks, pause slide narration and speak doubt response
      pause();
      clearAdvanceTimer();
      clearProgressAnim();
      speak(text);
    },
    stopSpeaking
  });

  // Fullscreen Management & Mouse Inactivity Auto-Hide
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
  const [isInactive, setIsInactive] = useState(false);
  const inactiveTimerRef = useRef(null);

  useEffect(() => {
    if (!isFullscreen) {
      setIsInactive(false);
      if (inactiveTimerRef.current) clearTimeout(inactiveTimerRef.current);
      return;
    }

    const resetInactivity = () => {
      setIsInactive(false);
      if (inactiveTimerRef.current) clearTimeout(inactiveTimerRef.current);
      inactiveTimerRef.current = setTimeout(() => {
        setIsInactive(true);
      }, 2500);
    };

    resetInactivity();
    window.addEventListener('mousemove', resetInactivity);
    window.addEventListener('pointermove', resetInactivity);
    window.addEventListener('mousedown', resetInactivity);
    window.addEventListener('keydown', resetInactivity);

    return () => {
      if (inactiveTimerRef.current) clearTimeout(inactiveTimerRef.current);
      window.removeEventListener('mousemove', resetInactivity);
      window.removeEventListener('pointermove', resetInactivity);
      window.removeEventListener('mousedown', resetInactivity);
      window.removeEventListener('keydown', resetInactivity);
    };
  }, [isFullscreen]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'textarea' || tag === 'input' || tag === 'select') {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setShowSubtitles((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setAutoNarrate((prev) => {
          const next = !prev;
          if (!next && isSpeaking) {
            clearAdvanceTimer();
            clearProgressAnim();
            stopSpeaking();
          }
          return next;
        });
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setLaserActive((prev) => !prev);
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsNotesOpen((prev) => !prev);
      } else if (e.key === 'o' || e.key === 'O' || e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setIsOverviewOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOverviewOpen(false);
        setIsBriefOpen(false);
        setIsQuizOpen(false);
        setIsNotesOpen(false);
        setIsUploadOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleTogglePlay, toggleFullscreen, isSpeaking, stopSpeaking, clearAdvanceTimer, clearProgressAnim]);

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Loading Presentation...
          </div>
          <div style={{ fontSize: '14px' }}>Preparing slides, voice narration, and subtitles...</div>
        </div>
      </div>
    );
  }

  if (presentationError) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '20px', color: 'var(--text-danger)', marginBottom: '12px' }}>
            Failed to Load Presentation
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            {presentationError}
          </p>
          <button onClick={onBackToHome} className="btn btn-primary">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`app-container ${isFullscreen ? 'fullscreen-active' : ''} ${isInactive ? 'fullscreen-inactive' : ''}`}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Presentation Header */}
      <Header
        title={presentation?.title}
        currentSlideNumber={currentSlide?.slideNumber || currentSlideIndex + 1}
        totalSlides={totalSlides}
        isFullscreen={isFullscreen}
        showSubtitles={showSubtitles}
        onToggleSubtitles={() => setShowSubtitles(!showSubtitles)}
        autoSlide={autoSlide}
        onToggleAutoSlide={() => setAutoSlide((prev) => !prev)}
        autoNarrate={autoNarrate}
        onToggleAutoNarrate={() => {
          const nextVal = !autoNarrate;
          setAutoNarrate(nextVal);
          if (nextVal && !isSpeaking) {
            setHasStarted(true);
            playSlideNarration();
          } else if (!nextVal && isSpeaking) {
            clearAdvanceTimer();
            clearProgressAnim();
            stopSpeaking();
          }
        }}
        onToggleFullscreen={toggleFullscreen}
        onOpenOverview={() => handleOpenModal(setIsOverviewOpen)}
        onOpenBrief={() => handleOpenModal(setIsBriefOpen)}
        onOpenQuiz={() => handleOpenModal(setIsQuizOpen)}
        onOpenUpload={() => handleOpenModal(setIsUploadOpen)}
        onBackToHome={onBackToHome}
      />

      {/* Main Presentation Stage & AI Doubt Assistant Split Layout */}
      <main className="presentation-workspace">
        {/* Left: Presentation Slide Stage with Synchronized Movie Subtitles */}
        <SlideViewer
          slide={currentSlide}
          slideIndex={currentSlideIndex}
          totalSlides={totalSlides}
          nextSlide={presentation?.slides?.[currentSlideIndex + 1]}
          hasStarted={hasStarted}
          isPlaying={isPlaying}
          isCompleted={isCompleted}
          isNarrating={isSpeaking}
          spokenCharIndex={spokenCharIndex}
          showSubtitles={showSubtitles}
          laserActive={laserActive}
          isNotesOpen={isNotesOpen}
          onCloseNotes={() => setIsNotesOpen(false)}
          onToggleSubtitles={() => setShowSubtitles(!showSubtitles)}
          onPlayNarration={playSlideNarration}
          onStopNarration={stopSpeaking}
          onRestart={handleRestart}
          onNext={handleNext}
          onPrev={handlePrev}
        />

        {/* Right: AI Doubt Assistant Panel with Dual Voice + Text Sections */}
        <AIDoubtPanel
          currentSlide={currentSlide}
          slides={presentation?.slides}
          status={status}
          activeQuestion={activeQuestion}
          activeAnswer={activeAnswer}
          error={aiError}
          doubtHistory={doubtHistory}
          slideChangedNotice={slideChangedNotice}
          isSpeaking={isSpeaking}
          onCancel={cancelDoubt}
          onNewDoubt={newDoubt}
          onSubmitDoubt={submitDoubt}
          onStopSpeaking={stopSpeaking}
          onGoToSlide={handleGoToSlide}
        />
      </main>

      {/* Bottom Slide Progression & Playback Controls */}
      <SlideControls
        isPlaying={isPlaying}
        progress={progress}
        durationSec={durationSec}
        currentSlideIndex={currentSlideIndex}
        totalSlides={totalSlides}
        isVoiceSynced={autoNarrate}
        currentSlideDurationSec={currentSlideDurationSec}
        laserActive={laserActive}
        isNotesOpen={isNotesOpen}
        onToggleNotes={() => setIsNotesOpen((prev) => !prev)}
        speechRate={speechRate}
        onSpeechRateChange={(newRate) => {
          setSpeechRate(newRate);
          // If currently speaking, immediately apply new speed to remaining narration
          if (isPlaying && isSpeaking) {
            playSlideNarration(currentSlide, progress);
          }
        }}
        voices={voices}
        selectedVoiceURI={selectedVoiceURI}
        onVoiceChange={(v) => {
          setSelectedVoiceURI(v);
          if (isPlaying && isSpeaking) {
            playSlideNarration(currentSlide, progress);
          }
        }}
        onToggleLaser={() => setLaserActive((prev) => !prev)}
        onTogglePlay={handleTogglePlay}
        onNext={handleNext}
        onPrev={handlePrev}
        onRestart={handleRestart}
        onDurationChange={setDurationSec}
        onSeek={handleSeek}
      />

      {/* Slide Overview Grid Modal */}
      <SlideOverviewModal
        isOpen={isOverviewOpen}
        slides={presentation?.slides}
        currentSlideIndex={currentSlideIndex}
        onSelectSlide={(idx) => {
          handleGoToSlide(idx);
        }}
        onClose={() => setIsOverviewOpen(false)}
      />

      {/* Executive Brief & Q&A Report Modal */}
      <ExecutiveBriefModal
        isOpen={isBriefOpen}
        presentation={presentation}
        doubtHistory={doubtHistory}
        onClose={() => setIsBriefOpen(false)}
      />

      {/* Feature 6: Knowledge Check / Comprehension Quiz Modal */}
      <KnowledgeCheckModal
        isOpen={isQuizOpen}
        slide={currentSlide}
        onClose={() => setIsQuizOpen(false)}
        onGoToSlide={handleGoToSlide}
      />

      {/* Feature 8: Upload / Ingest Presentation Modal */}
      <UploadPresentationModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={(newId) => {
          window.location.href = `/presentation/${newId}`;
        }}
      />
    </div>
  );
}
