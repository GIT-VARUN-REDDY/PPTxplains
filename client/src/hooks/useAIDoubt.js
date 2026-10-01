import { useState, useRef, useCallback, useEffect } from 'react';
import { askAIDoubt, askAIVoiceDoubt } from '../services/api.js';

export function useAIDoubt({
  presentationId,
  currentSlide,
  speak,
  stopSpeaking
}) {
  const [mode, setMode] = useState('text'); // 'text' | 'voice'
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'sending' | 'thinking' | 'speaking' | 'cancelled' | 'error'
  const [activeQuestion, setActiveQuestion] = useState('');
  const [activeAnswer, setActiveAnswer] = useState('');
  const [error, setError] = useState(null);
  const [doubtHistory, setDoubtHistory] = useState([]);

  const abortControllerRef = useRef(null);

  // When slide changes, update user notification and stop speaking
  const prevSlideNumRef = useRef(currentSlide?.slideNumber);
  const [slideChangedNotice, setSlideChangedNotice] = useState(false);

  useEffect(() => {
    if (currentSlide && prevSlideNumRef.current !== currentSlide.slideNumber) {
      prevSlideNumRef.current = currentSlide.slideNumber;
      stopSpeaking();
      setSlideChangedNotice(true);
      const timer = setTimeout(() => setSlideChangedNotice(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, stopSpeaking]);

  // Cancel active AI request immediately
  const cancelDoubt = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    stopSpeaking();
    setStatus('cancelled');
    setError(null);
  }, [stopSpeaking]);

  // Start a fresh doubt
  const newDoubt = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    stopSpeaking();
    setActiveQuestion('');
    setActiveAnswer('');
    setError(null);
    setStatus('idle');
  }, [stopSpeaking]);

  // Submit question or recorded voice audio to Gemini AI backend
  const submitDoubt = useCallback(
    async (questionText, { fromVoice = false, audioBlob, mimeType } = {}) => {
      const q = questionText?.trim();
      if (!q && !audioBlob) return;

      // Cancel any ongoing request or speech
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      stopSpeaking();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const displayQ = q || `Voice question on Slide ${currentSlide?.slideNumber || 1}: ${currentSlide?.title || 'Overview'}`;
      setActiveQuestion(displayQ);
      setActiveAnswer('');
      setError(null);
      setStatus('thinking');

      try {
        let res;
        if (audioBlob) {
          // Convert audio blob to base64
          const base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const resStr = reader.result || '';
              const commaIdx = resStr.indexOf(',');
              resolve(commaIdx >= 0 ? resStr.slice(commaIdx + 1) : resStr);
            };
            reader.onerror = reject;
            reader.readAsDataURL(audioBlob);
          });

          res = await askAIVoiceDoubt({
            presentationId: presentationId || 'ai-video-strategy',
            slideNumber: currentSlide?.slideNumber || 1,
            slideTitle: currentSlide?.title || 'Overview',
            slideContext: currentSlide?.context || '',
            audioBase64: base64Data,
            mimeType: mimeType || audioBlob.type || 'audio/webm',
            signal: controller.signal
          });
        } else {
          res = await askAIDoubt({
            presentationId: presentationId || 'ai-video-strategy',
            slideNumber: currentSlide?.slideNumber || 1,
            slideTitle: currentSlide?.title || 'Overview',
            slideContext: currentSlide?.context || '',
            question: q,
            signal: controller.signal
          });
        }

        if (controller.signal.aborted) return;

        const finalQuestion = res.question || q || `Voice question on Slide ${currentSlide?.slideNumber || 1}`;
        setActiveQuestion(finalQuestion);
        setActiveAnswer(res.answer);
        setStatus('idle');

        // Add to temporary session history
        const newEntry = {
          id: Date.now().toString(),
          question: finalQuestion,
          answer: res.answer,
          slideNumber: currentSlide?.slideNumber || 1,
          slideTitle: currentSlide?.title || 'Slide',
          fromVoice,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setDoubtHistory((prev) => [newEntry, ...prev]);

        // If from voice mode, speak answer
        if (fromVoice && speak) {
          speak(res.answer);
        }
      } catch (err) {
        if (err.name === 'AbortError' || controller.signal.aborted) {
          setStatus('cancelled');
          return;
        }

        console.error('[useAIDoubt] error:', err);
        setError(err.message || 'Something went wrong while getting the AI response. Please try again.');
        setStatus('error');
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [presentationId, currentSlide, speak, stopSpeaking]
  );

  return {
    mode,
    setMode,
    status,
    setStatus,
    activeQuestion,
    setActiveQuestion,
    activeAnswer,
    error,
    doubtHistory,
    slideChangedNotice,
    cancelDoubt,
    newDoubt,
    submitDoubt
  };
}
