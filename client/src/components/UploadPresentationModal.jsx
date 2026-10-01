import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Layers,
  Cpu,
  Server
} from 'lucide-react';
import { uploadPresentation } from '../services/api.js';

export function UploadPresentationModal({
  isOpen,
  onClose,
  onSuccess
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [topicInput, setTopicInput] = useState('');
  const [outlineInput, setOutlineInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSelectPreset = (presetTitle) => {
    setTopicInput(presetTitle);
    setSelectedFile(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!selectedFile && !topicInput.trim() && !outlineInput.trim()) {
      setError('Please choose a presentation file (.pptx / .pdf) or enter an architecture topic.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingStep('Preparing presentation content...');

    try {
      let fileBase64 = null;
      let mimeType = null;
      let textContent = outlineInput.trim();

      if (selectedFile) {
        setProcessingStep(`Reading ${selectedFile.name}...`);
        mimeType = selectedFile.type || 'application/pdf';

        if (selectedFile.type.includes('text') || selectedFile.name.endsWith('.txt') || selectedFile.name.endsWith('.md')) {
          textContent = await selectedFile.text();
        } else {
          // Read base64 for PDF or binary presentations
          const base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result;
              const base64 = result.includes(',') ? result.split(',')[1] : result;
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });
          fileBase64 = base64Data;
        }
      }

      setProcessingStep('Gemini analyzing architecture & synthesizing visual slides...');

      const response = await uploadPresentation({
        topicTitle: topicInput.trim() || (selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : ''),
        textContent,
        fileBase64,
        mimeType
      });

      setProcessingStep('Finalizing SVGs, speech scripts & interactive quizzes...');

      setTimeout(() => {
        setIsProcessing(false);
        if (response && response.presentationId) {
          onSuccess(response.presentationId);
          onClose();
        }
      }, 600);
    } catch (err) {
      console.error('[UploadPresentation] Error:', err);
      setError(err.message || 'Failed to ingest presentation. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(4, 8, 16, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 200ms ease'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#0c1424',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(56, 189, 248, 0.15)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0f192c'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#060b14'
              }}
            >
              <UploadCloud size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                Upload &amp; Ingest Presentation
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                Powered by Gemini &bull; Ingest .pptx, .pdf, or architecture outlines into interactive decks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ width: '32px', height: '32px' }}
            title="Close"
            aria-label="Close"
            disabled={isProcessing}
          >
            <X size={17} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Processing State */}
          {isProcessing ? (
            <div
              style={{
                padding: '40px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8'
                }}
              >
                <Loader2 size={28} className="animate-spin-slow" />
              </div>

              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: '0 0 6px 0' }}>
                  Ingesting Presentation
                </h4>
                <p style={{ fontSize: '13px', color: '#38bdf8', margin: 0 }}>
                  {processingStep}
                </p>
              </div>

              {/* Progress bar shimmer */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '360px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  marginTop: '6px'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: '60%',
                    background: 'var(--accent-gradient)',
                    borderRadius: '3px',
                    animation: 'pulse 1.5s infinite ease-in-out'
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.15)'}`,
                  borderRadius: '12px',
                  padding: '24px 16px',
                  backgroundColor: dragActive ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 160ms ease',
                  textAlign: 'center'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.pptx,.txt,.md,.json"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8'
                  }}
                >
                  <FileText size={22} />
                </div>

                {selectedFile ? (
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#38bdf8' }}>
                      {selectedFile.name}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                      {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click or drop another to replace
                    </span>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>
                      Drag &amp; drop your <strong style={{ color: '#38bdf8' }}>.pptx</strong> or <strong style={{ color: '#38bdf8' }}>.pdf</strong> here
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                      or click to browse from your computer
                    </span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.6px' }}>
                  OR ENTER ARCHITECTURE TOPIC
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
              </div>

              {/* Text / Topic Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. Next-Gen RISC-V Neural Core & Matrix Accelerators..."
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#f8fafc',
                    fontSize: '13.5px',
                    outline: 'none',
                    transition: 'border-color 150ms ease'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#38bdf8')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                />

                {/* 1-Click Architecture Presets */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', marginRight: '2px' }}>
                    Quick presets:
                  </span>
                  {[
                    'Next-Gen RISC-V Neural Core',
                    'Distributed Microservices P99 Tuning',
                    'Multi-Die 2.5D Packaging'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      style={{
                        background: 'none',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        transition: 'all 150ms ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#38bdf8';
                        e.currentTarget.style.color = '#38bdf8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = '#94a3b8';
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0f192c'
          }}
        >
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ fontSize: '13px' }}
            disabled={isProcessing}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            style={{ fontSize: '13px', padding: '8px 20px', gap: '6px' }}
            disabled={isProcessing || (!selectedFile && !topicInput.trim() && !outlineInput.trim())}
          >
            <Sparkles size={15} />
            <span>Generate &amp; Launch Deck</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
