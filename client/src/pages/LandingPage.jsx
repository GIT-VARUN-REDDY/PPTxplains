import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  Mic, 
  MessageSquare, 
  Layers, 
  ArrowRight, 
  CheckCircle,
  Clock,
  Volume2,
  ShieldAlert,
  UploadCloud
} from 'lucide-react';
import { UploadPresentationModal } from '../components/UploadPresentationModal.jsx';

export function LandingPage({ onStartPresentation }) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  return (
    <div className="app-container bg-grid-pattern" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <header style={{
        height: '68px',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(8, 12, 20, 0.8)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#060b14'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              PPTxplains
            </span>
            <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', marginLeft: '6px', fontWeight: '600' }}>
              AI Assistant
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '13px', gap: '6px' }}
          >
            <UploadCloud size={15} />
            <span>Upload Deck</span>
          </button>

          <button
            onClick={onStartPresentation}
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            <span>Launch Demo</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        {/* Pill Badge */}
        <div className="badge badge-cyan" style={{ marginBottom: '20px', padding: '6px 14px', fontSize: '13px' }}>
          <Sparkles size={14} />
          <span>Interactive AI Deck Companion</span>
        </div>

        {/* Hero Title */}
        <h1 style={{
          fontSize: 'clamp(36px, 5vw, 64px)',
          fontWeight: '800',
          textAlign: 'center',
          lineHeight: '1.15',
          letterSpacing: '-1.5px',
          color: 'var(--text-primary)',
          maxWidth: '850px',
          marginBottom: '16px'
        }}>
          AI Presentation Assistant
        </h1>

        {/* Subtitle */}
        <div style={{
          fontSize: 'clamp(20px, 2.5vw, 28px)',
          fontWeight: '600',
          color: 'var(--accent-cyan)',
          textAlign: 'center',
          marginBottom: '20px',
          letterSpacing: '-0.5px'
        }}>
          Watch. Ask. Understand.
        </div>

        {/* Supporting Text */}
        <p style={{
          fontSize: '17px',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          maxWidth: '640px',
          lineHeight: '1.6',
          marginBottom: '36px'
        }}>
          Explore technical presentations with an AI assistant that understands the exact slide you're viewing. Ask questions by voice or text and receive instant, context-aware answers.
        </p>

        {/* Primary CTA Buttons */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '60px' }}>
          <button
            onClick={onStartPresentation}
            className="btn btn-primary"
            style={{
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: '700',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 4px 20px rgba(56, 189, 248, 0.4)',
              gap: '8px'
            }}
          >
            <Play size={17} fill="currentColor" />
            <span>Explore Technical Deck</span>
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="btn btn-secondary"
            style={{
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: '600',
              borderRadius: 'var(--radius-lg)',
              gap: '8px',
              border: '1px solid rgba(56, 189, 248, 0.35)'
            }}
          >
            <UploadCloud size={17} style={{ color: 'var(--accent-cyan)' }} />
            <span>Upload Your Own Presentation (.pptx / .pdf)</span>
          </button>
        </div>

        {/* Featured Presentation Card */}
        <div style={{
          width: '100%',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '48px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'center'
        }}>
          {/* Card Preview Details */}
          <div>
            <div className="badge badge-emerald" style={{ marginBottom: '10px' }}>
              Available Now
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              AI-Generated Technical Videos Strategy
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
              A 12-slide comprehensive framework for translating complex engineering, semiconductor, and deep-tech architectures into high-retention video assets using generative AI workflows.
            </p>

            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span>• 12 Interactive Slides</span>
              <span>• Clock Tree Synthesis Case Study</span>
              <span>• Gemini Flash Powered</span>
            </div>
          </div>

          {/* Quick Launch Preview */}
          <div style={{
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            aspectRatio: '16/9',
            position: 'relative',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)'
          }}
          onClick={onStartPresentation}
          >
            <img
              src="/presentations/ai-video-strategy/slide-01.png"
              alt="Slide Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(8, 12, 20, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 200ms ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(8, 12, 20, 0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(8, 12, 20, 0.4)')}
            >
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#060b14',
                boxShadow: '0 4px 16px rgba(56, 189, 248, 0.5)'
              }}>
                <Play size={22} fill="currentColor" style={{ marginLeft: '3px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          width: '100%'
        }}>
          {/* Feature 1 */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ color: 'var(--accent-cyan)' }}>
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Automatic Progression
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Slides progress automatically on configurable timers. Pause anytime to inspect waveforms or ask doubts.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ color: 'var(--accent-cyan)' }}>
              <MessageSquare size={24} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Text Doubts
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Type your questions directly. The AI assistant receives the exact context and metrics of your current slide.
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ color: 'var(--accent-cyan)' }}>
              <Mic size={24} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Voice Mode & TTS
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Speak your doubts hands-free via browser speech recognition and listen to natural spoken responses.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px 32px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '13px',
        color: 'var(--text-muted)'
      }}>
        <div>AI Presentation Assistant &bull; Public No-Login Architecture</div>
        <div>React &bull; Node.js &bull; Express &bull; Google Gemini API</div>
      </footer>

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
