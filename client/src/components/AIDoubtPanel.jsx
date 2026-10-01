import React, { useState, memo, useMemo } from 'react';
import { 
  Bot, 
  X, 
  Volume2, 
  Square, 
  PlusCircle, 
  AlertCircle, 
  History, 
  Loader2, 
  Sparkles,
  MessageSquare,
  ArrowUpRight
} from 'lucide-react';
import { TextInput } from './TextInput.jsx';
import { VoiceInput } from './VoiceInput.jsx';

/**
 * Extract slide references mentioned in text (e.g., "Slide 3", "slide 4", "Slide #2")
 * Returns array of unique slide numbers
 */
function extractSlideReferences(text) {
  if (!text || typeof text !== 'string') return [];
  const matches = [...text.matchAll(/\b(?:slide|Slide)\s*#?\s*(\d+)\b/gi)];
  const slideNumbers = matches
    .map((m) => parseInt(m[1], 10))
    .filter((num, idx, arr) => !isNaN(num) && num >= 1 && arr.indexOf(num) === idx);
  return slideNumbers;
}

function AIDoubtPanelComponent({
  currentSlide,
  slides = [],
  status,
  activeQuestion,
  activeAnswer,
  error,
  doubtHistory,
  slideChangedNotice,
  isSpeaking,
  onCancel,
  onNewDoubt,
  onSubmitDoubt,
  onStopSpeaking,
  onGoToSlide
}) {
  const [showHistory, setShowHistory] = useState(false);

  const isThinking = status === 'thinking';
  const isCancelled = status === 'cancelled';
  const isError = status === 'error';

  // Extract slide references in the AI answer for 1-click jump chips
  const activeReferencedSlides = useMemo(() => extractSlideReferences(activeAnswer), [activeAnswer]);

  return (
    <aside className="ai-panel" aria-label="AI Presentation Assistant">
      {/* Top Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface-elevated)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#060b14'
            }}>
              <Bot size={16} />
            </div>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              AI Presentation Assistant
            </h2>
          </div>

          {doubtHistory.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="btn btn-ghost"
              style={{ fontSize: '12px', padding: '4px 8px', height: '28px' }}
              title="Toggle Doubt History"
            >
              <History size={14} />
              <span>{doubtHistory.length}</span>
            </button>
          )}
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Have a doubt about this presentation?
        </p>

        {/* Current Slide Context Indicator */}
        <div style={{
          marginTop: '6px',
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: '600' }}>
              CURRENT CONTEXT:
            </span>
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-primary)',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            Slide {currentSlide?.slideNumber || 1} &mdash; {currentSlide?.title || 'Overview'}
          </div>
        </div>
      </div>

      {/* Main Assistant Body / Content Area */}
      <div style={{
        flex: 1,
        padding: '16px 20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Thinking State with [X Cancel] Button */}
        {isThinking && (
          <div style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: 'var(--shadow-md)'
          }}>
            {activeQuestion && (
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>You asked:</strong> "{activeQuestion}"
              </div>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-cyan)' }}>
                <Loader2 size={18} className="animate-spin-slow" />
                <span style={{ fontSize: '13px', fontWeight: '600' }}>AI is thinking...</span>
              </div>

              {/* Cancel Button */}
              <button
                onClick={onCancel}
                className="btn btn-danger"
                style={{ padding: '4px 10px', fontSize: '12px', height: '28px' }}
                title="Cancel AI request"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {/* Cancelled State notice */}
        {isCancelled && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '13px', color: 'var(--text-danger)' }}>
              Request cancelled. You can ask a new question.
            </span>
            <button
              onClick={onNewDoubt}
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-danger)', fontSize: '13px', fontWeight: '600' }}>
              <AlertCircle size={16} />
              <span>Failed to get AI response</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {error || 'Something went wrong while getting the AI response. Please try again.'}
            </p>
            <button
              onClick={onNewDoubt}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px', alignSelf: 'flex-start' }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Active AI Answer Display */}
        {activeAnswer && (
          <div style={{
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: 'var(--shadow-md)'
          }}>
            {/* Question Recap */}
            <div style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '8px'
            }}>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>Q: </span>
              "{activeQuestion}"
            </div>

            {/* Answer Content */}
            <div style={{
              fontSize: '13.5px',
              lineHeight: '1.6',
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap'
            }}>
              {activeAnswer}
            </div>

            {/* Feature 4: Interactive Slide Jump Chips */}
            {activeReferencedSlides.length > 0 && onGoToSlide && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                alignItems: 'center',
                padding: '8px 10px',
                backgroundColor: 'rgba(56, 189, 248, 0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(56, 189, 248, 0.2)'
              }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowUpRight size={13} />
                  Referenced:
                </span>
                {activeReferencedSlides.map((num) => {
                  const slideObj = slides?.find((s) => s.slideNumber === num);
                  const isCurrent = currentSlide?.slideNumber === num;
                  return (
                    <button
                      key={num}
                      onClick={() => onGoToSlide(num - 1)}
                      disabled={isCurrent}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: isCurrent ? 'rgba(255, 255, 255, 0.06)' : 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid',
                        borderColor: isCurrent ? 'rgba(255, 255, 255, 0.12)' : 'rgba(56, 189, 248, 0.35)',
                        color: isCurrent ? 'var(--text-muted)' : '#38bdf8',
                        cursor: isCurrent ? 'default' : 'pointer',
                        transition: 'all 150ms ease',
                        fontWeight: '600'
                      }}
                      title={isCurrent ? `Currently on Slide ${num}` : `Jump to Slide ${num}${slideObj?.title ? `: ${slideObj.title}` : ''}`}
                    >
                      <span>Slide {num}</span>
                      {slideObj?.title && (
                        <span style={{ opacity: 0.8, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          • {slideObj.title}
                        </span>
                      )}
                      {!isCurrent && <ArrowUpRight size={11} />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Action Bar: Voice Speaking Indicator & New Doubt Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              paddingTop: '10px',
              marginTop: '4px'
            }}>
              {/* Voice Speaking status with Stop button */}
              {isSpeaking ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Volume2 size={14} className="animate-pulse-ring" />
                    <span>Speaking...</span>
                  </div>
                  <button
                    onClick={onStopSpeaking}
                    className="btn btn-danger"
                    style={{ fontSize: '11px', padding: '4px 8px', height: '26px' }}
                    title="Stop speaking"
                  >
                    <Square size={11} fill="currentColor" />
                    <span>Stop</span>
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Slide {currentSlide?.slideNumber} Context
                </div>
              )}

              {/* New Doubt Button */}
              <button
                onClick={onNewDoubt}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '5px 12px', height: '30px' }}
              >
                <PlusCircle size={14} />
                <span>New Doubt</span>
              </button>
            </div>
          </div>
        )}

        {/* Both Voice Doubt Section AND Text Doubt Section Visible Together */}
        {!isThinking && !activeAnswer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 1. Voice Doubt Section */}
            <VoiceInput
              currentSlide={currentSlide}
              isThinking={isThinking}
              onStartRecording={onStopSpeaking}
              onQuestionReady={(q, audioData) => onSubmitDoubt(q, { fromVoice: true, ...(audioData || {}) })}
            />

            {/* Subtle Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '2px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>
                OR TYPE YOUR DOUBT
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            </div>

            {/* 2. Text Doubt Section */}
            <TextInput
              isThinking={isThinking}
              onSubmit={(q) => onSubmitDoubt(q, { fromVoice: false })}
              placeholder={`Ask doubt about Slide ${currentSlide?.slideNumber || 1}...`}
            />
          </div>
        )}

        {/* Doubt History Drawer / View */}
        {showHistory && doubtHistory.length > 0 && (
          <div style={{
            marginTop: '12px',
            backgroundColor: 'rgba(8, 12, 20, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '6px'
            }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                SESSION DOUBTS ({doubtHistory.length})
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Temporary session only</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
              {doubtHistory.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                    <button
                      onClick={() => onGoToSlide && onGoToSlide((item.slideNumber || 1) - 1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: 'var(--accent-cyan)',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: onGoToSlide ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      title={`Jump to Slide ${item.slideNumber}`}
                    >
                      <span>Slide {item.slideNumber}</span>
                      {onGoToSlide && <ArrowUpRight size={11} />}
                    </button>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{item.timestamp}</span>
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                    "{item.question}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export const AIDoubtPanel = memo(AIDoubtPanelComponent);
