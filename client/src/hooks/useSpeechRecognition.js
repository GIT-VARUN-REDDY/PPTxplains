import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useSpeechRecognition
 * Resilient, dual-mode speech recording & frequency analysis hook:
 * 1. Web Audio API frequency analysis generates dynamic 20-bar beat lines in real time.
 * 2. MediaRecorder captures high-fidelity local audio chunks for direct Gemini multimodal answering.
 * 3. Chromium SpeechRecognition runs concurrently for live interim transcript preview.
 * 4. Network STT errors are gracefully absorbed without aborting the recording or showing error banners.
 * 5. Auto-submits on natural speech pause (~2.2s after speaking).
 */
export function useSpeechRecognition({ onResult } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [audioLevels, setAudioLevels] = useState(() => new Array(20).fill(8));
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState(null); // { blob, mimeType }

  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const latestTranscriptRef = useRef('');
  const silenceTimerRef = useRef(null);
  const userHasSpokenRef = useRef(false);

  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordedMimeTypeRef = useRef('audio/webm');
  const finalAudioBlobRef = useRef(null);

  // Check browser support on mount
  useEffect(() => {
    const hasMedia = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
    const hasSpeech = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    setIsSupported(hasMedia || hasSpeech);
  }, []);

  // Cleanup helper
  const cleanupAudioStream = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setAudioLevels(new Array(20).fill(8));
    setVolumeLevel(0);
  }, []);

  // Stop recording and compile final results
  const stopListening = useCallback(() => {
    if (!isListening) return;

    // Stop MediaRecorder and package blob
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.requestData();
      } catch {
        // ignore
      }
      mediaRecorderRef.current.stop();
    }

    cleanupAudioStream();
    setIsListening(false);

    // Package recorded audio blob
    setTimeout(() => {
      let blob = finalAudioBlobRef.current;
      if (!blob && audioChunksRef.current.length > 0) {
        blob = new Blob(audioChunksRef.current, {
          type: recordedMimeTypeRef.current || 'audio/webm'
        });
        finalAudioBlobRef.current = blob;
      }

      const audioResult = blob
        ? { audioBlob: blob, mimeType: recordedMimeTypeRef.current }
        : null;

      if (audioResult) {
        setRecordedAudio(audioResult);
      }

      const finalText = latestTranscriptRef.current.trim();
      if (onResultRef.current && (finalText || audioResult)) {
        onResultRef.current(finalText, audioResult);
      }
    }, 120);
  }, [isListening, cleanupAudioStream]);

  // Start microphone capture, frequency analysis & speech recognition
  const startListening = useCallback(async () => {
    setError(null);
    setTranscript('');
    latestTranscriptRef.current = '';
    userHasSpokenRef.current = false;
    audioChunksRef.current = [];
    finalAudioBlobRef.current = null;
    setRecordedAudio(null);

    // 1. Acquire microphone stream
    let stream = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        mediaStreamRef.current = stream;
      }
    } catch (micErr) {
      console.warn('[Microphone] getUserMedia error:', micErr);
      if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
        setError('Microphone permission blocked. Please allow microphone access in your browser address bar.');
        return;
      }
    }

    if (!stream) {
      setError('Unable to access microphone. Please ensure a microphone is connected.');
      return;
    }

    setIsListening(true);

    // 2. Set up MediaRecorder on the local stream
    let mimeType = 'audio/webm';
    if (typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      try {
        const recorder = new MediaRecorder(stream, { mimeType });
        recordedMimeTypeRef.current = mimeType;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            finalAudioBlobRef.current = new Blob(audioChunksRef.current, {
              type: recordedMimeTypeRef.current
            });
          }
        };

        recorder.start(150);
        mediaRecorderRef.current = recorder;
      } catch (recErr) {
        console.warn('[MediaRecorder] init notice:', recErr);
      }
    }

    // 3. Web Audio API frequency analysis for dynamic beat lines
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.55;
        source.connect(analyser);
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkWave = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          const levels = [];
          const numBars = 20;
          const step = Math.max(1, Math.floor(bufferLength / numBars));

          for (let i = 0; i < numBars; i++) {
            // Apply a voice-frequency curve (boost mid frequencies)
            const rawVal = dataArray[i * step] || 0;
            const midBoost = 1 - Math.abs(i - numBars / 2) / (numBars / 1.6);
            const boosted = Math.round(rawVal * (0.8 + midBoost * 0.45));
            sum += rawVal;

            // Map to bar height in px: 6px minimum, 38px maximum
            const barH = Math.max(6, Math.min(38, Math.round((boosted / 255) * 42)));
            levels.push(barH);
          }

          const avgVol = Math.round(sum / (bufferLength || 1));
          setVolumeLevel(avgVol);
          setAudioLevels(levels);

          // Detect when user speaks
          if (avgVol > 16) {
            userHasSpokenRef.current = true;
            // Reset silence timeout while user is actively speaking
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
          } else if (userHasSpokenRef.current && avgVol < 12) {
            // User was speaking and is now silent: auto-submit after 2.3 seconds
            if (!silenceTimerRef.current) {
              silenceTimerRef.current = setTimeout(() => {
                stopListening();
              }, 2300);
            }
          }

          animFrameRef.current = requestAnimationFrame(checkWave);
        };

        checkWave();
      }
    } catch (audioErr) {
      console.warn('[Web Audio] Analyser error:', audioErr);
    }

    // 4. Start Chromium SpeechRecognition in parallel for live text feedback
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let fullText = '';
          for (let i = 0; i < event.results.length; ++i) {
            const item = event.results[i];
            if (item && item[0]) {
              fullText += item[0].transcript + ' ';
            }
          }

          const clean = fullText.trim();
          if (clean) {
            setTranscript(clean);
            latestTranscriptRef.current = clean;
            userHasSpokenRef.current = true;

            // Reset silence timer on new words
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              stopListening();
            }, 2300);
          }
        };

        recognition.onerror = (event) => {
          console.info(`[SpeechRecognition] event: ${event.error} (audio recorder active)`);
          if (event.error === 'not-allowed') {
            setError('Microphone permission blocked. Please allow microphone in browser.');
            stopListening();
          }
          // Intentionally do NOT abort or set error on 'network', 'no-speech', etc.!
          // The local MediaRecorder and beat lines remain completely functional.
        };

        recognition.onend = () => {
          // Do not close listening if user is still speaking with audio
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (recErr) {
        console.info('[SpeechRecognition] Optional text preview offline; using audio stream.');
      }
    }
  }, [stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    latestTranscriptRef.current = '';
    setError(null);
    setRecordedAudio(null);
    finalAudioBlobRef.current = null;
    audioChunksRef.current = [];
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    audioLevels,
    volumeLevel,
    recordedAudio,
    startListening,
    stopListening,
    resetTranscript
  };
}
