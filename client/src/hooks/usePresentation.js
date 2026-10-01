import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchPresentation } from '../services/api.js';

export function usePresentation(presentationId = 'ai-video-strategy', { voiceSync = false, initialSlide = 1 } = {}) {
  const [presentation, setPresentation] = useState(null);
  const initialIdx = Math.max(0, parseInt(initialSlide, 10) - 1 || 0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialIdx);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [durationSec, setDurationSec] = useState(10);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const timerRef = useRef(null);
  const progressStartTimeRef = useRef(null);
  const accumulatedTimeRef = useRef(0);
  const isTabVisibleRef = useRef(true);

  // Load presentation data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchPresentation(presentationId)
      .then((data) => {
        if (!isMounted) return;
        setPresentation(data);
        if (data.defaultDurationSec) {
          setDurationSec(data.defaultDurationSec);
        }
        if (data.slides && initialIdx >= data.slides.length) {
          setCurrentSlideIndex(0);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[usePresentation] Failed to load:', err);
        setError(err.message || 'Failed to load presentation.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [presentationId]);

  // Preload next slide image
  useEffect(() => {
    if (!presentation || !presentation.slides) return;
    const nextIdx = currentSlideIndex + 1;
    if (nextIdx < presentation.slides.length) {
      const nextSlide = presentation.slides[nextIdx];
      if (nextSlide.image) {
        const img = new Image();
        img.src = nextSlide.image;
      }
    }
  }, [currentSlideIndex, presentation]);

  // Handle Tab Visibility (Pause timer when tab hidden, resume when visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isTabVisibleRef.current = false;
      } else {
        isTabVisibleRef.current = true;
        // Reset timestamp reference to prevent sudden jump
        progressStartTimeRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const totalSlides = presentation?.slides?.length || 12;
  const currentSlide = presentation?.slides?.[currentSlideIndex] || null;

  // Slide navigation
  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => {
      if (prev < totalSlides - 1) {
        setProgress(0);
        accumulatedTimeRef.current = 0;
        progressStartTimeRef.current = Date.now();
        setIsCompleted(false);
        return prev + 1;
      } else {
        // Reached the end
        setIsPlaying(false);
        setIsCompleted(true);
        setProgress(100);
        return prev;
      }
    });
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => {
      setProgress(0);
      accumulatedTimeRef.current = 0;
      progressStartTimeRef.current = Date.now();
      setIsCompleted(false);
      return Math.max(0, prev - 1);
    });
  }, []);

  const goToSlide = useCallback((index) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentSlideIndex(index);
      setProgress(0);
      accumulatedTimeRef.current = 0;
      progressStartTimeRef.current = Date.now();
      setIsCompleted(false);
    }
  }, [totalSlides]);

  const start = useCallback(() => {
    if (isCompleted) {
      setCurrentSlideIndex(0);
      setIsCompleted(false);
    }
    setIsPlaying(true);
    progressStartTimeRef.current = Date.now();
  }, [isCompleted]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      start();
    }
  }, [isPlaying, pause, start]);

  const restart = useCallback(() => {
    setCurrentSlideIndex(0);
    setProgress(0);
    accumulatedTimeRef.current = 0;
    progressStartTimeRef.current = Date.now();
    setIsCompleted(false);
    setIsPlaying(true);
  }, []);

  // Progression loop
  // If voiceSync is enabled, the slide progression and end time are driven by the voice explanation.
  // Otherwise, the fallback timer (durationSec) is used for silent auto-advancement.
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      return;
    }

    if (voiceSync) {
      // Voice narration is driving slide duration and end time
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      return;
    }

    let lastTime = performance.now();

    const loop = (currentTime) => {
      if (!isTabVisibleRef.current) {
        lastTime = currentTime;
        timerRef.current = requestAnimationFrame(loop);
        return;
      }

      const delta = currentTime - lastTime;
      lastTime = currentTime;

      accumulatedTimeRef.current += delta;
      const totalDurationMs = durationSec * 1000;
      const currentProgressPct = Math.min(100, (accumulatedTimeRef.current / totalDurationMs) * 100);

      setProgress(parseFloat(currentProgressPct.toFixed(2)));

      if (accumulatedTimeRef.current >= totalDurationMs) {
        accumulatedTimeRef.current = 0;
        nextSlide();
      } else {
        timerRef.current = requestAnimationFrame(loop);
      }
    };

    timerRef.current = requestAnimationFrame(loop);

    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [isPlaying, durationSec, nextSlide, voiceSync]);

  const seekTo = useCallback((pct) => {
    const clamped = Math.max(0, Math.min(100, pct));
    setProgress(clamped);
    accumulatedTimeRef.current = (clamped / 100) * (durationSec * 1000);
    progressStartTimeRef.current = Date.now() - accumulatedTimeRef.current;
  }, [durationSec]);

  return {
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
    error,
    start,
    pause,
    togglePlay,
    nextSlide,
    prevSlide,
    goToSlide,
    restart,
    seekTo,
    setDurationSec
  };
}
