import React, { useMemo } from 'react';
import { X, Download, Printer, CheckCircle, FileText, Sparkles, MessageSquare } from 'lucide-react';

/**
 * ExecutiveBriefModal
 * Compiles a comprehensive meeting brief and Q&A session report:
 * - Slide-by-slide executive takeaways and metrics.
 * - Complete Q&A transcript with concise AI answers.
 * - One-click Markdown export and clean formatted printable PDF view.
 */
export function ExecutiveBriefModal({
  isOpen,
  presentation,
  doubtHistory = [],
  onClose
}) {
  if (!isOpen || !presentation) return null;

  // Compile all key metrics across slides
  const allMetrics = useMemo(() => {
    const list = [];
    if (Array.isArray(presentation.slides)) {
      presentation.slides.forEach((s) => {
        if (Array.isArray(s.metrics)) {
          s.metrics.forEach((m) => {
            list.push({
              slideNum: s.slideNumber,
              slideTitle: s.title,
              label: m.label,
              value: m.value,
              change: m.change
            });
          });
        }
      });
    }
    return list;
  }, [presentation]);

  // Generate clean Markdown content
  const markdownContent = useMemo(() => {
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    let md = `# Executive Brief & Presentation Summary\n\n`;
    md += `**Presentation:** ${presentation.title}\n`;
    md += `**Date:** ${dateStr}\n`;
    md += `**Total Slides:** ${presentation.totalSlides || presentation.slides?.length || 12}\n\n`;
    md += `## 1. Executive Summary\n\n${presentation.description || ''}\n\n`;

    md += `## 2. Key Architecture Metrics\n\n`;
    md += `| Slide | Metric | Value | Baseline Benchmark |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    allMetrics.forEach((m) => {
      md += `| Slide ${m.slideNum}: ${m.slideTitle} | ${m.label} | **${m.value}** | ${m.change} |\n`;
    });
    md += `\n`;

    md += `## 3. Slide-by-Slide Core Takeaways\n\n`;
    presentation.slides?.forEach((s) => {
      md += `### Slide ${s.slideNumber}: ${s.title}\n`;
      if (s.subtitle) md += `*${s.subtitle}*\n\n`;
      s.keyPoints?.forEach((pt) => {
        md += `- ${pt}\n`;
      });
      md += `\n`;
    });

    if (doubtHistory.length > 0) {
      md += `## 4. Live Q&A Session Transcript\n\n`;
      doubtHistory.forEach((d, idx) => {
        md += `### Q${idx + 1} (${d.slideTitle || `Slide ${d.slideNumber}`})\n`;
        md += `**Question:** ${d.question}\n\n`;
        md += `**AI Explanation:** ${d.answer}\n\n`;
      });
    }

    return md;
  }, [presentation, allMetrics, doubtHistory]);

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(presentation.id || 'presentation')}-executive-brief.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
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
        className="executive-brief-container"
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          backgroundColor: '#0c1424',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.15)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 24px',
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
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}
            >
              <FileText size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                Executive Meeting Brief &amp; Q&amp;A Report
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                Synthesized summary, architecture benchmarks &amp; audience doubt log
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleDownloadMarkdown}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px', gap: '6px', height: '34px' }}
              title="Download Markdown Report"
            >
              <Download size={14} />
              <span>Export .MD</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '6px 12px', gap: '6px', height: '34px' }}
              title="Print or Save PDF"
            >
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="btn btn-ghost btn-icon"
              style={{ width: '34px', height: '34px' }}
              title="Close modal"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Document Body */}
        <div
          className="brief-document-body"
          style={{
            padding: '24px 32px',
            overflowY: 'auto',
            color: '#e2e8f0',
            fontSize: '14px',
            lineHeight: '1.6'
          }}
        >
          {/* Cover Header */}
          <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#38bdf8', fontWeight: '700' }}>
              EXECUTIVE BRIEFING
            </span>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', marginTop: '4px', marginBottom: '8px' }}>
              {presentation.title}
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
              {presentation.description}
            </p>
          </div>

          {/* Key Metrics Benchmark Grid */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
              Core Technical &amp; Business Benchmarks
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {allMetrics.slice(0, 6).map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '12px 14px'
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>{m.label}</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#f8fafc', margin: '2px 0' }}>{m.value}</div>
                  <div style={{ fontSize: '11px', color: '#38bdf8' }}>{m.change}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Breakdown Accordion/Cards */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
              Slide-by-Slide Strategic Highlights
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {presentation.slides?.map((s) => (
                <div
                  key={s.id || s.slideNumber}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '12px 16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', color: '#f8fafc', fontSize: '13px' }}>
                      Slide {s.slideNumber}: {s.title}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{s.category || 'Strategic Overview'}</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', fontSize: '12px' }}>
                    {s.keyPoints?.map((pt, pIdx) => (
                      <li key={pIdx} style={{ marginBottom: '3px' }}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Q&A Session Transcript */}
          {doubtHistory.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} />
                Live Q&amp;A Session Transcript ({doubtHistory.length} doubts answered)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {doubtHistory.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    style={{
                      backgroundColor: 'rgba(56, 189, 248, 0.04)',
                      border: '1px solid rgba(56, 189, 248, 0.15)',
                      borderRadius: '8px',
                      padding: '12px 16px'
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '600', marginBottom: '2px' }}>
                      Q{idx + 1} &bull; {item.slideTitle || `Slide ${item.slideNumber || 1}`}
                    </div>
                    <div style={{ fontWeight: '600', color: '#ffffff', marginBottom: '6px', fontSize: '13px' }}>
                      "{item.question}"
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '12px', lineHeight: '1.5' }}>
                      {item.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
