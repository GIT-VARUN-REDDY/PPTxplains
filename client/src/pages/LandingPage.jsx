import React, { useState, useEffect } from 'react';
import { Sparkles, Play, UploadCloud, ArrowRight } from 'lucide-react';
import { UploadPresentationModal } from '../components/UploadPresentationModal.jsx';
import { CanvasBackground } from '../components/CanvasBackground.jsx';

export function LandingPage({ onStartPresentation }) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: '#010204', overflowX: 'hidden' }}>
      {/* 3D Background */}
      <CanvasBackground />

      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        minHeight: '64px',
        padding: '16px clamp(16px, 5vw, 48px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 50,
        background: 'rgba(1, 2, 4, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/pptxplains-logo.png" 
            alt="PPTxplains" 
            style={{ 
              height: '34px', 
              width: 'auto', 
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.45))'
            }} 
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setIsUploadOpen(true)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(59, 130, 246, 0.45)',
              color: '#60a5fa',
              padding: '8px 18px',
              borderRadius: '6px',
              fontSize: '11.5px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            Upload Deck
          </button>
        </div>
      </header>

      {/* Main Editorial Content */}
      <main style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* Chapter 01: Hero */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(130px, 20vh, 180px) clamp(20px, 6vw, 8vw) clamp(60px, 10vh, 100px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          boxSizing: 'border-box'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'clamp(18px, 3vh, 32px)' }}>
              <div style={{ width: '20px', height: '1px', background: '#3b82f6' }} />
              <h4 style={{ color: '#60a5fa', fontSize: 'clamp(10px, 1.6vw, 11px)', letterSpacing: '4px', textTransform: 'uppercase', margin: 0 }}>
                Chapter 01 &mdash; The Threshold
              </h4>
            </div>

            <h1 style={{
              fontSize: 'clamp(48px, 9.5vw, 140px)',
              fontWeight: '300',
              lineHeight: '0.94',
              color: '#ffffff',
              letterSpacing: '-2px',
              marginBottom: 'clamp(24px, 4vh, 40px)',
              maxWidth: '1000px',
              wordBreak: 'break-word'
            }}>
              Analyze <br/>
              <span style={{ fontStyle: 'italic', color: '#3b82f6' }}>Understand.</span>
            </h1>

            <p style={{
              color: '#93c5fd',
              fontSize: 'clamp(14px, 2vw, 16px)',
              maxWidth: '480px',
              lineHeight: '1.7',
              marginBottom: 'clamp(32px, 5vh, 48px)',
              fontWeight: '400'
            }}>
              An immersive editorial journey through your presentation data. Powered by advanced AI to synthesize, narrate, and interact with your slides in real-time.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
              <button
                onClick={onStartPresentation}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: '#ffffff',
                  border: 'none',
                  padding: 'clamp(14px, 2vw, 18px) clamp(24px, 4vw, 40px)',
                  borderRadius: '6px',
                  fontSize: 'clamp(11.5px, 1.8vw, 13px)',
                  fontWeight: '700',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 24px rgba(37, 99, 235, 0.4)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <Play size={16} fill="currentColor" /> Enter The Experience
              </button>

              <button
                onClick={() => setIsUploadOpen(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: 'clamp(14px, 2vw, 18px) clamp(20px, 3vw, 32px)',
                  borderRadius: '6px',
                  fontSize: 'clamp(11.5px, 1.8vw, 13px)',
                  fontWeight: '600',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <UploadCloud size={16} /> Choose File
              </button>
            </div>
          </div>
        </section>

        {/* Chapter 02: Engine */}
        <section
          className="chapter-engine-section"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 'clamp(80px, 14vh, 140px) clamp(20px, 6vw, 8vw)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            backgroundColor: 'rgba(2, 4, 8, 0.55)',
            boxSizing: 'border-box'
          }}
        >
          <div className="chapter-engine-container">
            <h4 style={{ color: '#60a5fa', fontSize: 'clamp(10px, 1.6vw, 11px)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: 'clamp(20px, 3vh, 32px)' }}>
              Chapter 02 &mdash; The Engine
            </h4>
            <h2 style={{
              fontSize: 'clamp(36px, 7vw, 96px)',
              fontWeight: '300',
              lineHeight: '1',
              color: '#ffffff',
              letterSpacing: '-2px',
              marginBottom: 'clamp(24px, 3vh, 40px)',
              maxWidth: '800px',
              wordBreak: 'break-word'
            }}>
              Procedural <br/>
              Intelligence.
            </h2>
            <p style={{
              color: '#93c5fd',
              fontSize: 'clamp(14px, 2vw, 16px)',
              maxWidth: '480px',
              lineHeight: '1.7',
              fontWeight: '400'
            }}>
              Our deep-learning engine parses every technical diagram, metric, and bullet point. It extracts profound meaning from the noise, presenting you with unparalleled clarity.
            </p>
          </div>
        </section>

        {/* Chapter 03: Interaction */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(80px, 14vh, 140px) clamp(20px, 6vw, 8vw)',
          backgroundColor: 'rgba(2, 4, 8, 0.3)',
          boxSizing: 'border-box'
        }}>
          <h4 style={{ color: '#3b82f6', fontSize: 'clamp(10px, 1.6vw, 11px)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: 'clamp(20px, 3vh, 32px)' }}>
            Chapter 03 &mdash; Interaction
          </h4>
          <h2 style={{
            fontSize: 'clamp(36px, 7vw, 96px)',
            fontWeight: '300',
            lineHeight: '1',
            color: '#ffffff',
            letterSpacing: '-2px',
            marginBottom: 'clamp(36px, 6vh, 64px)',
            maxWidth: '800px',
            wordBreak: 'break-word'
          }}>
            Speak to <br/>
            the Data.
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 'clamp(24px, 4vw, 40px)',
            maxWidth: '1000px'
          }}>
            <div style={{
              padding: 'clamp(24px, 4vw, 40px) 0',
              borderTop: '1px solid rgba(59, 130, 246, 0.4)'
            }}>
              <h3 style={{ fontSize: 'clamp(17px, 2.5vw, 20px)', color: '#fff', marginBottom: '14px', fontWeight: '500' }}>
                Voice Command
              </h3>
              <p style={{ color: '#93c5fd', fontSize: 'clamp(13.5px, 2vw, 15px)', lineHeight: '1.7' }}>
                Hands-free exploration. Ask questions naturally and receive synthesized auditory responses customized to your slide context.
              </p>
            </div>
            <div style={{
              padding: 'clamp(24px, 4vw, 40px) 0',
              borderTop: '1px solid rgba(37, 99, 235, 0.4)'
            }}>
              <h3 style={{ fontSize: 'clamp(17px, 2.5vw, 20px)', color: '#fff', marginBottom: '14px', fontWeight: '500' }}>
                Text Context
              </h3>
              <p style={{ color: '#93c5fd', fontSize: 'clamp(13.5px, 2vw, 15px)', lineHeight: '1.7' }}>
                Type specific technical queries. The AI uses the exact visual context of your current slide to deliver precise, accurate answers.
              </p>
            </div>
          </div>
        </section>
        
        {/* Footer Manifesto */}
        <footer style={{
          padding: 'clamp(48px, 8vh, 80px) clamp(20px, 6vw, 8vw) clamp(32px, 5vh, 48px)',
          backgroundColor: '#020408',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '32px'
          }}>
            <div>
              <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '300', color: '#fff', letterSpacing: '-1px', marginBottom: '14px' }}>
                PPTxplains.
              </h1>
              <p style={{ color: '#64748b', fontSize: 'clamp(13px, 1.8vw, 14px)', maxWidth: '340px', lineHeight: '1.6' }}>
                A deliberately minimal, highly interactive intelligence tool built for technical presentations.
              </p>
            </div>
            <button
              onClick={onStartPresentation}
              style={{
                background: '#fff',
                color: '#000',
                border: 'none',
                padding: 'clamp(12px, 2vw, 16px) clamp(20px, 3vw, 32px)',
                borderRadius: '4px',
                fontSize: 'clamp(11px, 1.6vw, 12px)',
                fontWeight: '800',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Launch Platform <ArrowRight size={14} />
            </button>
          </div>
        </footer>
      </main>

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
