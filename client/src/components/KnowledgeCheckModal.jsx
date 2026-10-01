import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, AlertCircle, RotateCcw, ArrowRight, HelpCircle, Sparkles, Award } from 'lucide-react';

/**
 * Generates an intelligent quiz question for a slide if not explicitly defined
 */
function getQuizForSlide(slide) {
  if (!slide) return null;
  if (slide.quiz) return slide.quiz;

  // Derive from slide metrics if available
  if (Array.isArray(slide.metrics) && slide.metrics.length > 0) {
    const m = slide.metrics[0];
    const otherMetrics = slide.metrics.slice(1);
    const distractors = [
      m.change || 'Standard baseline',
      otherMetrics[0] ? otherMetrics[0].value : '50% reduction',
      '2x degradation'
    ];
    // shuffle options with correct value
    const options = [m.value, ...distractors.slice(0, 3)].sort(() => 0.5 - Math.random());
    return {
      question: `According to ${slide.title}, what is the targeted "${m.label}"?`,
      options,
      correctIndex: options.indexOf(m.value),
      explanation: `The architecture metrics state that ${m.label} achieves ${m.value} (${m.change || 'benchmark'}).`
    };
  }

  // Derive from slide key points if available
  if (Array.isArray(slide.keyPoints) && slide.keyPoints.length > 0) {
    const correctPt = slide.keyPoints[0];
    const options = [
      correctPt,
      'Increase static whitepaper documentation frequency',
      'Completely manual video rendering without automation',
      'Deprecated monolithic legacy rendering'
    ].sort(() => 0.5 - Math.random());

    return {
      question: `Which core engineering concept is emphasized in "${slide.title}"?`,
      options,
      correctIndex: options.indexOf(correctPt),
      explanation: `This slide specifically focuses on: "${correctPt}".`
    };
  }

  return {
    question: `What is the strategic objective of "${slide.title}"?`,
    options: [
      slide.subtitle || 'Transforming engineering knowledge into scalable visual intelligence',
      'Maintaining legacy static documentation',
      'Decreasing content production frequency',
      'Removing technical architectural rigor'
    ],
    correctIndex: 0,
    explanation: slide.subtitle || 'The slide addresses scalable engineering knowledge transfer.'
  };
}

export function KnowledgeCheckModal({
  isOpen,
  slide,
  onClose,
  onGoToSlide
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Generate or retrieve quiz for the active slide
  const quiz = useMemo(() => {
    return getQuizForSlide(slide);
  }, [slide]);

  // Reset state when slide changes
  const handleReset = () => {
    setSelectedOption(null);
    setIsAnswered(false);
  };

  if (!isOpen || !slide || !quiz) return null;

  const isCorrect = selectedOption === quiz.correctIndex;

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
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
          maxWidth: '640px',
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
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}
            >
              <HelpCircle size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                Comprehension Knowledge Check
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                Slide {slide.slideNumber}: {slide.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ width: '32px', height: '32px' }}
            title="Close quiz"
            aria-label="Close quiz"
          >
            <X size={17} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Question Text */}
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', lineHeight: '1.5' }}>
            {quiz.question}
          </div>

          {/* 4 Choices */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {quiz.options.map((opt, idx) => {
              const isCurrentSelected = selectedOption === idx;
              const isOptionCorrect = idx === quiz.correctIndex;

              let border = '1px solid rgba(255, 255, 255, 0.1)';
              let bg = 'rgba(255, 255, 255, 0.03)';
              let textColor = '#e2e8f0';

              if (isAnswered) {
                if (isOptionCorrect) {
                  border = '1px solid #10b981';
                  bg = 'rgba(16, 185, 129, 0.15)';
                  textColor = '#34d399';
                } else if (isCurrentSelected) {
                  border = '1px solid #ef4444';
                  bg = 'rgba(239, 68, 68, 0.15)';
                  textColor = '#f87171';
                } else {
                  textColor = '#64748b';
                  bg = 'rgba(255, 255, 255, 0.01)';
                }
              } else if (isCurrentSelected) {
                border = '1px solid #38bdf8';
                bg = 'rgba(56, 189, 248, 0.1)';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={isAnswered}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border,
                    backgroundColor: bg,
                    color: textColor,
                    fontSize: '13.5px',
                    textAlign: 'left',
                    cursor: isAnswered ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 150ms ease',
                    fontWeight: isAnswered && isOptionCorrect ? '600' : '400'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#94a3b8',
                        flexShrink: 0
                      }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswered && isOptionCorrect && (
                    <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                  )}
                  {isAnswered && isCurrentSelected && !isOptionCorrect && (
                    <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Explanation Box */}
          {isAnswered && (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                animation: 'fadeIn 200ms ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: isCorrect ? '#34d399' : '#f87171' }}>
                {isCorrect ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Correct! Concept Mastered</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} />
                    <span>Incorrect Option</span>
                  </>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
                {quiz.explanation}
              </p>
            </div>
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
            onClick={handleReset}
            className="btn btn-ghost"
            style={{ fontSize: '12px', padding: '6px 12px', gap: '6px' }}
            disabled={!isAnswered}
          >
            <RotateCcw size={13} />
            <span>Try Again</span>
          </button>

          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ fontSize: '12px', padding: '6px 16px', gap: '6px' }}
          >
            <span>{isAnswered ? 'Continue Presentation' : 'Skip Check'}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
