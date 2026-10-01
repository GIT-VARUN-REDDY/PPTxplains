import React, { useState } from 'react';
import { Mic, MicOff, Send, Square, AlertCircle, Sparkles, RefreshCw, Radio } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';

/**
 * VoiceInput (Voice Chat Section)
 * Features:
 * - Real-time animated audio beat lines driven by live microphone input.
 * - Live transcript feedback so users immediately see recognized words.
 * - Prominent STOP and SEND buttons during active recording.
 * - Seamless fallback: records voice audio directly even if cloud STT is offline.
 * - Auto-submission on natural speech pause.
 */
export function VoiceInput({
  currentSlide,
  isThinking,
  onStartRecording,
  onQuestionReady
}) {
  const [localTranscript, setLocalTranscript] = useState('');
  const slideNum = currentSlide?.slideNumber || 1;

  const {
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
  } = useSpeechRecognition({
    onResult: (finalText, audioData) => {
      const clean = finalText?.trim() || '';
      if (clean || audioData?.audioBlob) {
        setLocalTranscript(clean);
        onQuestionReady(clean, audioData);
      }
    }
  });

  const activeText = transcript || localTranscript;

  const handleStart = () => {
    if (isThinking) return;
    if (onStartRecording) {
      onStartRecording();
    }
    setLocalTranscript('');
    startListening();
  };

  const handleStop = () => {
    stopListening();
  };

  const handleManualSend = () => {
    if (isThinking) return;
    const q = (activeText || '').trim();
    stopListening();
    // Pass both transcribed text (if any) and recorded audio
    setTimeout(() => {
      onQuestionReady(q, recordedAudio);
      setLocalTranscript('');
      resetTranscript();
    }, 150);
  };

  return (
    <div
      style={{
        backgroundColor: '#0a101d',
        border: isListening ? '1.5px solid #38bdf8' : '1px solid rgba(56, 189, 248, 0.2)',
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '146px',
        position: 'relative',
        transition: 'all 200ms ease',
        boxShadow: isListening ? '0 0 24px rgba(56, 189, 248, 0.3)' : 'none'
      }}
    >
      {/* Upper Area: Live Voice Visualizer & Real-time Transcript */}
      <div style={{ minHeight: '68px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* STATE 1: Idle (Not Listening & No Recorded Audio) */}
        {!isListening && !activeText && !recordedAudio && (
          <div
            onClick={!isThinking && isSupported ? handleStart : undefined}
            style={{ cursor: !isThinking && isSupported ? 'pointer' : 'default' }}
          >
            <div style={{
              color: '#94a3b8',
              fontSize: '14px',
              fontWeight: '500',
              lineHeight: '1.4',
              userSelect: 'none'
            }}>
              Ask doubt by speaking about Slide {slideNum}...
            </div>
            <div style={{
              color: '#475569',
              fontSize: '11.5px',
              marginTop: '4px',
              userSelect: 'none'
            }}>
              Tap "Speak" below to start speaking your question
            </div>
          </div>
        )}

        {/* STATE 2: Actively Listening to User Voice */}
        {isListening && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Top Indicator: Live Recording Badge & Volume */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '11px', fontWeight: '700', letterSpacing: '0.4px' }}>
                <span style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  boxShadow: '0 0 10px #ef4444',
                  display: 'inline-block',
                  animation: 'pulse 1s infinite'
                }} />
                <span>RECORDING YOUR VOICE...</span>
              </div>

              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '600' }}>
                {volumeLevel > 14 ? 'Voice Detected' : 'Waiting for voice...'}
              </span>
            </div>

            {/* REAL-TIME AUDIO BEAT LINES VISUALIZER */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                height: '44px',
                backgroundColor: 'rgba(14, 21, 37, 0.75)',
                borderRadius: '8px',
                padding: '0 12px',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                boxShadow: 'inset 0 0 12px rgba(56, 189, 248, 0.1)'
              }}
              title="Live voice frequency beat lines"
            >
              {audioLevels.map((lvl, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '5px',
                    height: `${lvl}px`,
                    minHeight: '6px',
                    maxHeight: '38px',
                    background: 'linear-gradient(180deg, #38bdf8 0%, #818cf8 60%, #c084fc 100%)',
                    borderRadius: '2.5px',
                    boxShadow: lvl > 15 ? '0 0 10px rgba(56, 189, 248, 0.8)' : 'none',
                    transition: 'height 50ms ease'
                  }}
                />
              ))}
            </div>

            {/* Real-time Recognized Speech Transcript Preview or Prompt */}
            <div style={{
              fontSize: '13px',
              color: activeText ? '#ffffff' : '#94a3b8',
              fontStyle: activeText ? 'normal' : 'italic',
              fontWeight: activeText ? '600' : '400',
              lineHeight: '1.4',
              minHeight: '20px',
              maxHeight: '44px',
              overflowY: 'auto'
            }}>
              {activeText
                ? `"${activeText}"`
                : (volumeLevel > 14
                    ? 'Speaking... Audio recording in progress'
                    : 'Speak clearly into your microphone — auto-submits on pause...')}
            </div>
          </div>
        )}

        {/* STATE 3: Finished Recording, Reviewing Spoken Question */}
        {!isListening && (activeText || recordedAudio) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: '700', letterSpacing: '0.4px' }}>
              VOICE DOUBT READY:
            </span>
            <span style={{ fontSize: '14px', color: '#f8fafc', fontWeight: '600', lineHeight: '1.4' }}>
              {activeText ? `"${activeText}"` : 'Spoken question recorded and ready to submit.'}
            </span>
          </div>
        )}

        {/* Browser Not Supported Warning */}
        {!isSupported && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-danger)',
            fontSize: '12px'
          }}>
            <MicOff size={14} />
            <span>Voice input is not supported in this browser. Please use Chrome or Edge.</span>
          </div>
        )}

        {/* Actionable Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '6px',
            padding: '6px 10px',
            marginTop: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fca5a5', fontSize: '11.5px' }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
            <button
              onClick={() => resetTranscript()}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Divider Line */}
      <div style={{
        height: '1px',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        margin: '10px 0'
      }} />

      {/* Bottom Action Row: Status Hint & Control Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        {/* Left Status Text */}
        <div style={{
          fontSize: '11px',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          lineHeight: '1.3'
        }}>
          {isListening ? (
            <>
              <span style={{ color: '#ef4444', fontWeight: '600' }}>Active Recording</span>
              <span style={{ opacity: 0.6 }}>•</span>
              <span>Tap Stop or wait to send</span>
            </>
          ) : (
            <>
              <span>Tap Speak</span>
              <span style={{ opacity: 0.6 }}>•</span>
              <span>Auto-submits on pause</span>
            </>
          )}
        </div>

        {/* Right Buttons: Contextual Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isListening ? (
            <>
              {/* STOP BUTTON */}
              <button
                onClick={handleStop}
                className="btn btn-danger"
                style={{
                  height: '34px',
                  padding: '0 14px',
                  fontSize: '13px',
                  fontWeight: '700',
                  borderRadius: '8px',
                  gap: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.25)',
                  borderColor: '#ef4444',
                  color: '#ffffff',
                  boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)',
                  cursor: 'pointer'
                }}
                title="Stop recording voice"
                aria-label="Stop recording voice"
              >
                <Square size={13} fill="currentColor" />
                <span>Stop</span>
              </button>

              {/* SEND BUTTON */}
              <button
                onClick={handleManualSend}
                disabled={isThinking}
                className="btn btn-primary"
                style={{
                  height: '34px',
                  padding: '0 14px',
                  fontSize: '13px',
                  fontWeight: '700',
                  borderRadius: '8px',
                  gap: '6px',
                  cursor: 'pointer'
                }}
                title="Send doubt question now"
                aria-label="Send doubt question"
              >
                <Send size={13} />
                <span>Send</span>
              </button>
            </>
          ) : (activeText || recordedAudio) ? (
            <>
              {/* Retake Voice Button */}
              <button
                onClick={handleStart}
                disabled={isThinking}
                className="btn btn-secondary"
                style={{
                  height: '34px',
                  padding: '0 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  gap: '5px'
                }}
                title="Speak again"
              >
                <RefreshCw size={12} />
                <span>Retake</span>
              </button>

              {/* Send Button */}
              <button
                onClick={handleManualSend}
                disabled={isThinking}
                className="btn btn-primary"
                style={{
                  height: '34px',
                  padding: '0 16px',
                  fontSize: '13px',
                  fontWeight: '700',
                  borderRadius: '8px',
                  gap: '6px'
                }}
                title="Send doubt question"
              >
                <Send size={13} />
                <span>Send Doubt</span>
              </button>
            </>
          ) : (
            /* SPEAK BUTTON (Initial State) */
            <button
              onClick={handleStart}
              disabled={!isSupported || isThinking}
              className="btn btn-primary"
              style={{
                height: '34px',
                padding: '0 18px',
                fontSize: '13px',
                fontWeight: '700',
                borderRadius: '8px',
                gap: '6px',
                boxShadow: '0 2px 14px rgba(56, 189, 248, 0.45)',
                cursor: 'pointer'
              }}
              title="Click to speak your doubt question"
              aria-label="Click to speak your doubt question"
            >
              <Mic size={15} />
              <span>Speak</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
