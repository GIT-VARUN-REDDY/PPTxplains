import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';

/**
 * TextInput (Text Doubt Section)
 * Exactly mirrors the design in Image 4:
 * - Upper area: Textarea with "Ask doubt about Slide X..."
 * - Subtle divider line
 * - Bottom row: "Press Enter to send • Shift+Enter for newline", "0/500", [ Send ] button
 */
export function TextInput({
  isThinking,
  onSubmit,
  placeholder = "Ask doubt about Slide 1..."
}) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;
    onSubmit(trimmed);
    setText('');
  };

  return (
    <div
      style={{
        backgroundColor: '#0a101d',
        border: '1px solid rgba(56, 189, 248, 0.16)',
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '128px',
        position: 'relative',
        transition: 'border-color 150ms ease'
      }}
    >
      {/* Upper Area: Textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isThinking}
        rows={3}
        maxLength={500}
        placeholder={placeholder}
        aria-label="Ask your doubt about this presentation slide"
        style={{
          width: '100%',
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontSize: '14px',
          lineHeight: '1.45',
          fontFamily: 'inherit',
          minHeight: '52px'
        }}
      />

      {/* Horizontal Divider Line matching Image 4 */}
      <div style={{
        height: '1px',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        margin: '8px 0 10px 0'
      }} />

      {/* Bottom Action Row matching Image 4 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        {/* Left Hint */}
        <div style={{
          fontSize: '11px',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          lineHeight: '1.3'
        }}>
          <span>Press Enter to send</span>
          <span style={{ opacity: 0.6 }}>•</span>
          <span>Shift+Enter for newline</span>
        </div>

        {/* Right Counter & Send Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {text.length}/500
          </span>

          <button
            onClick={handleSend}
            disabled={!text.trim() || isThinking}
            className="btn btn-primary"
            style={{
              height: '32px',
              padding: '0 14px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '8px',
              gap: '6px'
            }}
            title="Send doubt (Enter)"
            aria-label="Send doubt"
          >
            <Send size={13} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
