import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Curated list of ultra-realistic, natural studio-grade neural voices.
 * Features human breathing, pitch modulation (accurate highs and lows),
 * fluent cadence, and precise technical pronunciation.
 */
export const NEURAL_STUDIO_VOICES = [
  { voiceURI: 'neural:en-US-GuyNeural', name: 'Guy (Keynote Presenter)', lang: 'en-US', gender: 'Male', isNeural: true },
  { voiceURI: 'neural:en-US-JennyNeural', name: 'Jenny (Executive Clear)', lang: 'en-US', gender: 'Female', isNeural: true },
  { voiceURI: 'neural:en-US-AriaNeural', name: 'Aria (Technical Specialist)', lang: 'en-US', gender: 'Female', isNeural: true },
  { voiceURI: 'neural:en-US-ChristopherNeural', name: 'Christopher (Deep Broadcaster)', lang: 'en-US', gender: 'Male', isNeural: true },
  { voiceURI: 'neural:en-IN-NeerjaNeural', name: 'Neerja (Fluent Indian English)', lang: 'en-IN', gender: 'Female', isNeural: true },
  { voiceURI: 'neural:en-IN-PrabhatNeural', name: 'Prabhat (Professional Indian)', lang: 'en-IN', gender: 'Male', isNeural: true }
];

/**
 * Strips markdown symbols, asterisks, hash marks, bullet symbols, etc.
 * to produce clean, natural speech audio.
 */
export function cleanTextForSpeech(text) {
  if (!text) return '';
  return text
    .replace(/###?\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/`{1,3}.*?`{1,3}/gs, 'code block')
    .replace(/&amp;/g, ' and ')
    .replace(/&/g, ' and ')
    .replace(/[<>]/g, ' ')
    .replace(/•\s*/g, '')
    .replace(/[-*]\s+/g, '')
    .replace(/[\r\n]+/g, '. ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Accurately estimates speech duration in seconds based on text length and speaking rate.
 * Average conversational rate is ~14.2 characters per second at 1.0x rate.
 */
export function estimateSpeechDurationSec(text, rate = 1.0) {
  const clean = cleanTextForSpeech(text);
  if (!clean) return 10;
  const charsPerSec = 14.2 * (typeof rate === 'number' ? rate : 1.0);
  return Math.max(5, Math.round(clean.length / charsPerSec));
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [spokenCharIndex, setSpokenCharIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');

  // Speech rate state (persisted)
  const [speechRate, setSpeechRateState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pptx_speech_rate');
      if (saved) {
        const parsed = parseFloat(saved);
        if ([1.0, 1.15, 1.25, 1.5].includes(parsed)) return parsed;
      }
    }
    return 1.0;
  });

  // Selected voice state (persisted, strictly neural studio)
  const [selectedVoiceURI, setSelectedVoiceURIState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pptx_speech_voice');
      if (saved && saved.startsWith('neural:')) return saved;
    }
    return 'neural:en-US-GuyNeural';
  });

  const [voices, setVoices] = useState(NEURAL_STUDIO_VOICES);

  const activeAudioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const abortControllerRef = useRef(null);
  const utteranceRef = useRef(null);
  const onEndCallbackRef = useRef(null);
  const keepAliveIntervalRef = useRef(null);
  const isPlayingRef = useRef(false);

  const speechRateRef = useRef(speechRate);
  speechRateRef.current = speechRate;

  const selectedVoiceURIRef = useRef(selectedVoiceURI);
  selectedVoiceURIRef.current = selectedVoiceURI;

  const setSpeechRate = useCallback((newRate) => {
    speechRateRef.current = newRate;
    setSpeechRateState(newRate);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pptx_speech_rate', String(newRate));
    }
    if (activeAudioRef.current) {
      activeAudioRef.current.playbackRate = newRate;
    }
  }, []);

  const setSelectedVoiceURI = useCallback((voiceURI) => {
    selectedVoiceURIRef.current = voiceURI;
    setSelectedVoiceURIState(voiceURI);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pptx_speech_voice', voiceURI);
    }
  }, []);

  // Exclusively expose the curated Studio Neural voices (no robotic device voices)
  useEffect(() => {
    setVoices(NEURAL_STUDIO_VOICES);

    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const clearKeepAlive = () => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
  };

  const startKeepAlive = () => {
    clearKeepAlive();
    keepAliveIntervalRef.current = setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 12000);
  };

  const stopSpeaking = useCallback(() => {
    clearKeepAlive();
    isPlayingRef.current = false;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Stop HTML5 Neural Audio
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    // Stop Web Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setIsPaused(false);
    setSpokenCharIndex(0);
    onEndCallbackRef.current = null;
  }, []);

  const pauseSpeaking = useCallback(() => {
    if (activeAudioRef.current && !activeAudioRef.current.paused) {
      activeAudioRef.current.pause();
      setIsPaused(true);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resumeSpeaking = useCallback(() => {
    if (activeAudioRef.current && activeAudioRef.current.paused) {
      activeAudioRef.current.play().catch(console.error);
      setIsPaused(false);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  /**
   * Instantly seeks the active neural audio forward or backward to target percentage.
   * Returns true if active audio was sought directly, false if audio needs to load.
   */
  const seekToPercent = useCallback((pct) => {
    const clampedPct = Math.max(0, Math.min(100, pct));
    if (activeAudioRef.current && activeAudioRef.current.duration && !isNaN(activeAudioRef.current.duration)) {
      const targetTime = (clampedPct / 100) * activeAudioRef.current.duration;
      try {
        activeAudioRef.current.currentTime = targetTime;
        if (activeAudioRef.current.paused) {
          activeAudioRef.current.play().catch(console.error);
        }
        setIsSpeaking(true);
        setIsPaused(false);
        if (currentText) {
          setSpokenCharIndex(Math.round((clampedPct / 100) * currentText.length));
        }
        return true;
      } catch (err) {
        console.warn('[useSpeechSynthesis] seek error:', err);
      }
    }
    return false;
  }, [currentText]);

  /**
   * Speak function supporting Neural Studio Speech with natural highs/lows
   * and automatic browser speech synthesis fallback.
   */
  const speak = useCallback(async (text, { onStart, onEnd, onBoundary, rate, voiceURI, startCharOffset = 0 } = {}) => {
    if (!text) return;

    // Stop any existing playback and in-flight fetch
    stopSpeaking();

    const fullSpokenText = cleanTextForSpeech(text);
    if (!fullSpokenText) return;

    const chosenVoiceURI = voiceURI || selectedVoiceURIRef.current || 'neural:en-US-GuyNeural';
    const activeRate = typeof rate === 'number' ? rate : speechRateRef.current || 1.0;

    setCurrentText(fullSpokenText);
    onEndCallbackRef.current = onEnd;
    isPlayingRef.current = true;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Check if Neural Studio Voice is selected (starts with "neural:")
    const isNeural = chosenVoiceURI.startsWith('neural:');

    if (isNeural) {
      try {
        const rawVoiceId = chosenVoiceURI.replace(/^neural:/, '');

        setIsSpeaking(true);
        setIsPaused(false);

        // Fetch Studio Neural MP3 from server
        const response = await fetch('/api/tts/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            text: fullSpokenText,
            voice: rawVoiceId,
            rate: activeRate
          })
        });

        if (!response.ok) {
          throw new Error(`TTS server returned status ${response.status}`);
        }

        if (!isPlayingRef.current || controller.signal.aborted) return; // User stopped/switched while fetching

        const audioBlob = await response.blob();
        if (!isPlayingRef.current || controller.signal.aborted) return;

        const audioUrl = URL.createObjectURL(audioBlob);
        audioUrlRef.current = audioUrl;

        const audio = new Audio(audioUrl);
        activeAudioRef.current = audio;
        audio.playbackRate = activeRate;

        // Approximate starting position if seeking
        if (startCharOffset > 0 && fullSpokenText.length > 0) {
          const ratio = Math.max(0, Math.min(1, startCharOffset / fullSpokenText.length));
          audio.onloadedmetadata = () => {
            if (audio.duration) {
              audio.currentTime = ratio * audio.duration;
            }
          };
        }

        audio.onplay = () => {
          if (onStart) {
            onStart({ duration: audio.duration || null });
          }
        };

        // Time updates to drive subtitles and char highlighting
        audio.ontimeupdate = () => {
          if (audio.duration && audio.duration > 0) {
            const charIdx = Math.min(
              fullSpokenText.length,
              Math.round((audio.currentTime / audio.duration) * fullSpokenText.length)
            );
            setSpokenCharIndex(charIdx);
            if (onBoundary) onBoundary(charIdx);
          }
        };

        audio.onended = () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setSpokenCharIndex(fullSpokenText.length);
          if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
          }
          activeAudioRef.current = null;
          if (onEndCallbackRef.current) {
            onEndCallbackRef.current();
            onEndCallbackRef.current = null;
          }
        };

        audio.onerror = (e) => {
          if (!isPlayingRef.current || controller.signal.aborted) return;
          console.warn('[Neural Audio] playback error, falling back to Web Speech:', e);
          fallbackWebSpeech();
        };

        try {
          await audio.play();
        } catch (playErr) {
          if (playErr.name === 'AbortError' || !isPlayingRef.current || controller.signal.aborted) return;
          console.warn('[Neural Audio] play() error, falling back to Web Speech:', playErr);
          fallbackWebSpeech();
        }
        return;
      } catch (neuralErr) {
        if (neuralErr.name === 'AbortError' || !isPlayingRef.current || controller.signal.aborted) {
          return; // Intentional stop or abort
        }
        console.warn('[Neural TTS] Server call failed, falling back to local Web Speech API:', neuralErr.message);
        fallbackWebSpeech();
        return;
      }
    } else {
      // Local device voice selected explicitly
      fallbackWebSpeech();
    }

    function fallbackWebSpeech() {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();

      let offset = Math.max(0, Math.min(fullSpokenText.length - 1, Math.round(startCharOffset)));
      if (offset > 0) {
        const nextSpace = fullSpokenText.indexOf(' ', offset);
        if (nextSpace !== -1) offset = nextSpace + 1;
      }

      const textToSpeak = fullSpokenText.slice(offset);
      if (!textToSpeak.trim()) {
        setIsSpeaking(false);
        if (onEnd) onEnd();
        return;
      }

      setSpokenCharIndex(offset);
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utteranceRef.current = utterance;

      const allVoices = window.speechSynthesis.getVoices();
      const chosen = allVoices.find((v) => v.voiceURI === chosenVoiceURI || v.name === chosenVoiceURI);
      if (chosen) utterance.voice = chosen;

      utterance.rate = activeRate;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        startKeepAlive();
        if (onStart) {
          onStart({ duration: null });
        }
      };

      utterance.onboundary = (event) => {
        if (typeof event.charIndex === 'number') {
          const globalCharIndex = offset + event.charIndex;
          setSpokenCharIndex(globalCharIndex);
          if (onBoundary) onBoundary(globalCharIndex);
        }
      };

      utterance.onend = () => {
        clearKeepAlive();
        setIsSpeaking(false);
        setIsPaused(false);
        setSpokenCharIndex(fullSpokenText.length);
        if (onEndCallbackRef.current) {
          onEndCallbackRef.current();
          onEndCallbackRef.current = null;
        }
      };

      utterance.onerror = () => {
        clearKeepAlive();
        setIsSpeaking(false);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  }, [stopSpeaking]);

  return {
    isSpeaking,
    isPaused,
    isSupported,
    spokenCharIndex,
    currentText,
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
  };
}
