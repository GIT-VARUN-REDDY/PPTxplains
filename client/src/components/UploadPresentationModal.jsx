import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Link2,
  Globe,
  Clipboard,
  Check,
  Cpu,
  Layers,
  ExternalLink
} from 'lucide-react';
import { uploadPresentation, explainPostUrl } from '../services/api.js';

export function UploadPresentationModal({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'link'
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'link' | 'file' | 'topic'
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [postUrl, setPostUrl] = useState('');
  const [postNotes, setPostNotes] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [outlineInput, setOutlineInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState(null);
  const [copiedPasteSuccess, setCopiedPasteSuccess] = useState(false);

  const fileInputRef = useRef(null);

  // Sync initialTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'link');
      setError(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setPostUrl(text.trim());
          setError(null);
          setCopiedPasteSuccess(true);
          setTimeout(() => setCopiedPasteSuccess(false), 2000);
        }
      }
    } catch (err) {
      console.warn('Clipboard read permission not available:', err);
    }
  };

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

  const handleSelectSampleLink = (sample) => {
    setPostUrl(sample.url);
    if (sample.notes) setPostNotes(sample.notes);
    setError(null);
  };

  const handleSelectTopicPreset = (presetTitle) => {
    setTopicInput(presetTitle);
    setSelectedFile(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      let response = null;

      if (activeTab === 'link') {
        if (!postUrl.trim()) {
          setError('Please paste a link to the post or article you want explained.');
          setIsProcessing(false);
          return;
        }

        setProcessingStep('Reaching out to post link & extracting content...');

        // Step 1: Reach out to URL & synthesize through Gemini
        setTimeout(() => {
          setProcessingStep('Gemini reading post, understanding matter & extracting core insights...');
        }, 800);

        setTimeout(() => {
          setProcessingStep('Synthesizing visual slides, speech narration & interactive quizzes...');
        }, 2200);

        response = await explainPostUrl({
          url: postUrl.trim(),
          additionalNotes: postNotes.trim()
        });
      } else if (activeTab === 'file') {
        if (!selectedFile) {
          setError('Please choose a presentation file (.pptx or .pdf) to upload.');
          setIsProcessing(false);
          return;
        }

        setProcessingStep(`Reading ${selectedFile.name}...`);
        const mimeType = selectedFile.type || 'application/pdf';
        let textContent = '';
        let fileBase64 = null;

        if (selectedFile.type.includes('text') || selectedFile.name.endsWith('.txt') || selectedFile.name.endsWith('.md')) {
          textContent = await selectedFile.text();
        } else {
          fileBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result;
              const base64 = result.includes(',') ? result.split(',')[1] : result;
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });
        }

        setProcessingStep('Gemini analyzing architecture & synthesizing visual slides...');

        response = await uploadPresentation({
          topicTitle: selectedFile.name.replace(/\.[^/.]+$/, ''),
          textContent,
          fileBase64,
          mimeType
        });
      } else {
        // Topic outline
        if (!topicInput.trim() && !outlineInput.trim()) {
          setError('Please enter an architecture topic or outline.');
          setIsProcessing(false);
          return;
        }

        setProcessingStep('Gemini architecting custom presentation...');

        response = await uploadPresentation({
          topicTitle: topicInput.trim(),
          textContent: outlineInput.trim()
        });
      }

      setProcessingStep('Finalizing SVGs, speech scripts & launching presentation...');

      setTimeout(() => {
        setIsProcessing(false);
        if (response && response.presentationId) {
          onSuccess(response.presentationId);
          onClose();
        }
      }, 600);
    } catch (err) {
      console.error('[UploadPresentation] Error:', err);
      setError(err.message || 'Failed to process presentation. Please verify the input and try again.');
      setIsProcessing(false);
    }
  };

  const isSubmitDisabled = isProcessing || (
    activeTab === 'link' ? !postUrl.trim() :
    activeTab === 'file' ? !selectedFile :
    (!topicInput.trim() && !outlineInput.trim())
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 6, 14, 0.88)',
        backdropFilter: 'blur(10px)',
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
          border: '1px solid rgba(56, 189, 248, 0.28)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.9), 0 0 40px rgba(56, 189, 248, 0.15)',
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
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 10px rgba(37, 99, 235, 0.4)'
              }}
            >
              {activeTab === 'link' ? <Link2 size={19} /> : <UploadCloud size={19} />}
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Create Interactive Presentation</span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    letterSpacing: '0.8px',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    textTransform: 'uppercase'
                  }}
                >
                  Gemini Multimodal
                </span>
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Paste any post link or upload a deck &bull; Gemini analyzes the matter and explains everything
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

        {/* Tab Navigation Segment */}
        <div
          style={{
            display: 'flex',
            padding: '10px 22px 0 22px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#0a101f',
            gap: '8px'
          }}
        >
          <button
            type="button"
            onClick={() => { setActiveTab('link'); setError(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'link' ? '2px solid #38bdf8' : '2px solid transparent',
              color: activeTab === 'link' ? '#38bdf8' : '#94a3b8',
              fontSize: '13px',
              fontWeight: activeTab === 'link' ? '700' : '500',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
          >
            <Link2 size={15} />
            <span>Paste Post Link</span>
            <span
              style={{
                fontSize: '9.5px',
                padding: '1px 5px',
                borderRadius: '4px',
                backgroundColor: 'rgba(56, 189, 248, 0.18)',
                color: '#38bdf8',
                fontWeight: '700'
              }}
            >
              NEW
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('file'); setError(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'file' ? '2px solid #38bdf8' : '2px solid transparent',
              color: activeTab === 'file' ? '#38bdf8' : '#94a3b8',
              fontSize: '13px',
              fontWeight: activeTab === 'file' ? '700' : '500',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
          >
            <UploadCloud size={15} />
            <span>Upload Deck (.pptx / .pdf)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('topic'); setError(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'topic' ? '2px solid #38bdf8' : '2px solid transparent',
              color: activeTab === 'topic' ? '#38bdf8' : '#94a3b8',
              fontSize: '13px',
              fontWeight: activeTab === 'topic' ? '700' : '500',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
          >
            <Cpu size={15} />
            <span>Topic Outline</span>
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
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
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
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                  boxShadow: '0 0 24px rgba(56, 189, 248, 0.25)'
                }}
              >
                <Loader2 size={30} className="animate-spin-slow" />
              </div>

              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: '0 0 6px 0' }}>
                  {activeTab === 'link' ? 'Reaching Out to Post & Synthesizing Presentation' : 'Ingesting Presentation'}
                </h4>
                <p style={{ fontSize: '13.5px', color: '#38bdf8', margin: 0, fontWeight: '500' }}>
                  {processingStep}
                </p>
              </div>

              {/* Progress bar shimmer */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '380px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  marginTop: '8px'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: '65%',
                    background: 'linear-gradient(90deg, #0284c7, #38bdf8, #2563eb)',
                    borderRadius: '3px',
                    animation: 'pulse 1.5s infinite ease-in-out'
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: PASTE POST LINK */}
              {activeTab === 'link' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#f8fafc', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      Post / Article Link
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        borderRadius: '10px',
                        padding: '4px 6px 4px 14px',
                        gap: '10px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                        transition: 'border-color 150ms ease'
                      }}
                    >
                      <Globe size={18} style={{ color: '#38bdf8', flexShrink: 0 }} />
                      <input
                        type="url"
                        placeholder="Paste link: e.g. https://x.com/... , https://medium.com/... , blog or article URL"
                        value={postUrl}
                        onChange={(e) => { setPostUrl(e.target.value); setError(null); }}
                        style={{
                          flex: 1,
                          background: 'transparent',
                          border: 'none',
                          color: '#f8fafc',
                          fontSize: '13.5px',
                          outline: 'none',
                          padding: '8px 0'
                        }}
                        autoFocus
                      />

                      {postUrl ? (
                        <button
                          type="button"
                          onClick={() => setPostUrl('')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '6px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Clear"
                        >
                          <X size={15} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handlePasteFromClipboard}
                          style={{
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            borderRadius: '6px',
                            color: '#38bdf8',
                            fontSize: '11.5px',
                            fontWeight: '600',
                            padding: '5px 10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap'
                          }}
                          title="Paste from clipboard"
                        >
                          {copiedPasteSuccess ? <Check size={13} /> : <Clipboard size={13} />}
                          <span>{copiedPasteSuccess ? 'Pasted!' : 'Paste'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Supported platform badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Works with:</span>
                    {['X / Twitter Threads', 'Medium & Substack', 'Reddit Discussions', 'Tech Blogs & News', 'GitHub & Arxiv', 'Any Web Page'].map((plat, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '11px',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#cbd5e1'
                        }}
                      >
                        {plat}
                      </span>
                    ))}
                  </div>

                  {/* Optional Focus Notes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      Specific angle or focus instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Focus on architectural trade-offs, P99 latency numbers, or executive takeaways..."
                      value={postNotes}
                      onChange={(e) => setPostNotes(e.target.value)}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: '#f8fafc',
                        fontSize: '12.5px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Quick 1-Click Sample Articles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Or try these popular technical publications:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {[
                        {
                          label: 'Meta Llama 3 Architecture',
                          url: 'https://ai.meta.com/blog/meta-llama-3/'
                        },
                        {
                          label: 'DeepSeek-V3 MoE Architecture',
                          url: 'https://arxiv.org/abs/2412.19437'
                        },
                        {
                          label: 'Stripe Engineering P99 Tuning',
                          url: 'https://stripe.com/blog/rate-limiters'
                        }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSampleLink(item)}
                          style={{
                            background: 'none',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            borderRadius: '6px',
                            padding: '4px 9px',
                            fontSize: '11px',
                            color: '#38bdf8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 150ms ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.12)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <ExternalLink size={10} />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: UPLOAD FILE (.pptx / .pdf) */}
              {activeTab === 'file' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.15)'}`,
                      borderRadius: '12px',
                      padding: '28px 16px',
                      backgroundColor: dragActive ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
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
                        width: '46px',
                        height: '46px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#38bdf8'
                      }}
                    >
                      <FileText size={24} />
                    </div>

                    {selectedFile ? (
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#38bdf8' }}>
                          {selectedFile.name}
                        </span>
                        <span style={{ fontSize: '11.5px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                          {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click or drop another to replace
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>
                          Drag &amp; drop your <strong style={{ color: '#38bdf8' }}>.pptx</strong> or <strong style={{ color: '#38bdf8' }}>.pdf</strong> deck here
                        </span>
                        <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '3px' }}>
                          or click to browse from your computer
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: TOPIC OUTLINE */}
              {activeTab === 'topic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#f8fafc', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      Presentation Topic
                    </label>
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
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      Outline or Notes (Optional)
                    </label>
                    <textarea
                      placeholder="Paste bullet points, benchmarks, or key architecture requirements..."
                      value={outlineInput}
                      onChange={(e) => setOutlineInput(e.target.value)}
                      rows={3}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: '#f8fafc',
                        fontSize: '12.5px',
                        outline: 'none',
                        resize: 'none'
                      }}
                    />
                  </div>

                  {/* 1-Click Architecture Presets */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Quick presets:</span>
                    {[
                      'Next-Gen RISC-V Neural Core',
                      'Distributed Microservices P99 Tuning',
                      'Multi-Die 2.5D Packaging'
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectTopicPreset(preset)}
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
              )}
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
            style={{
              fontSize: '13px',
              padding: '8px 22px',
              gap: '7px',
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.45)'
            }}
            disabled={isSubmitDisabled}
          >
            <Sparkles size={15} />
            <span>
              {activeTab === 'link' ? 'Explain Post as Presentation' : 'Generate & Launch Deck'}
            </span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
