import React from 'react';
import { X, Keyboard } from 'lucide-react';

/**
 * KeyboardShortcutsModal
 * Interactive Slide Keyboard Shortcut Cheat Sheet ('?' or Shift+/ key trigger)
 * Strictly styled in deep navy, royal blue, black, and white.
 */
export function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Start / Stop presentation narration & timer' },
    { key: '→ / ←', desc: 'Next / Previous slide' },
    { key: 'D', desc: 'Toggle Dimmer (Cinema focus spotlight on active slide)' },
    { key: 'T / G', desc: 'Toggle Slide Thumbnails Drawer / Mini-Map' },
    { key: 'L', desc: 'Toggle Presenter Laser Pointer' },
    { key: 'P', desc: 'Toggle Speaker Notes & Teleprompter' },
    { key: 'C', desc: 'Toggle Synchronized Subtitles (Closed Captions)' },
    { key: 'M', desc: 'Toggle Audio Narration Mute' },
    { key: 'F', desc: 'Toggle Fullscreen mode' },
    { key: '?', desc: 'Open this Keyboard Shortcuts cheat sheet' },
    { key: 'Esc', desc: 'Close any active modal or drawer' }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 4, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 180ms ease'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#0a1128',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          borderRadius: '16px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(59, 130, 246, 0.2)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#070d1e',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6'
              }}
            >
              <Keyboard size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                Keyboard Shortcuts
              </h3>
              <p style={{ fontSize: '11px', color: '#93c5fd', margin: 0 }}>
                Speed up your presentation navigation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ width: '30px', height: '30px' }}
            title="Close"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Shortcuts List */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {shortcuts.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{item.desc}</span>
              <kbd
                style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#93c5fd',
                  backgroundColor: '#101c3d',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)'
                }}
              >
                {item.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
