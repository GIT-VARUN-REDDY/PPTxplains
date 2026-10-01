import React, { useMemo } from 'react';
import { cleanTextForSpeech } from '../hooks/useSpeechSynthesis.js';

/**
 * Splits text into compact, natural lines (~35-48 characters, 5-8 words per line).
 * Ensures subtitles appear one line at a time and never block presentation slides.
 */
function chunkTextIntoLines(text) {
  if (!text) return [];

  const clean = cleanTextForSpeech(text);
  const wordRegex = /\S+/g;
  let match;
  const words = [];

  while ((match = wordRegex.exec(clean)) !== null) {
    words.push({
      text: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }

  if (words.length === 0) return [];

  const lines = [];
  let currentLineWords = [];
  let currentLineChars = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    currentLineWords.push(word);
    currentLineChars += word.text.length + 1; // +1 for space

    const isLastWord = i === words.length - 1;
    const endsWithPunctuation = /[.,!?;:]$/.test(word.text);

    // Natural breaks:
    // 1. End of sentence or clause if line has at least 3 words (~18 chars)
    // 2. Length reaches ~38 chars with at least 5 words
    // 3. Length reaches ~46 chars max to keep subtitles single-line
    const shouldBreak =
      isLastWord ||
      (endsWithPunctuation && currentLineWords.length >= 3 && currentLineChars >= 18) ||
      (currentLineChars >= 38 && currentLineWords.length >= 5) ||
      currentLineChars >= 46;

    if (shouldBreak) {
      const lineStart = currentLineWords[0].startIndex;
      const lineEnd = currentLineWords[currentLineWords.length - 1].endIndex;
      lines.push({
        startIndex: lineStart,
        endIndex: lineEnd,
        words: [...currentLineWords],
        text: clean.slice(lineStart, lineEnd)
      });
      currentLineWords = [];
      currentLineChars = 0;
    }
  }

  return lines;
}

/**
 * SlideSubtitles
 * Line-by-line translucent captions with word-by-word opacity sync:
 * - Shows ONE concise line at a time (never covers slide content).
 * - Translucent background with sleek rounded pill corners.
 * - Words already spoken out: 100% opacity (crisp white #ffffff).
 * - Words yet to be spoken: 50% opacity (soft translucent white).
 * - Automatically advances line-by-line as speech proceeds.
 */
export function SlideSubtitles({
  narration,
  hasStarted = false,
  isSpeaking = false,
  spokenCharIndex = 0,
  showSubtitles = true
}) {
  // Show subtitles if enabled, narration exists, and presentation has started or is narrating
  if (!showSubtitles || !narration || (!hasStarted && !isSpeaking)) {
    return null;
  }

  // Pre-calculate line chunks with character offsets
  const lines = useMemo(() => {
    return chunkTextIntoLines(narration);
  }, [narration]);

  if (lines.length === 0) return null;

  // Determine active line based on spokenCharIndex
  let activeLineIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (spokenCharIndex >= lines[i].startIndex) {
      activeLineIdx = i;
    } else {
      break;
    }
  }

  const activeLine = lines[activeLineIdx] || lines[0];

  return (
    <div
      className="movie-subtitles-overlay"
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'auto',
        maxWidth: '88%',
        textAlign: 'center',
        zIndex: 25,
        pointerEvents: 'none',
        userSelect: 'none',
        animation: 'fadeIn 180ms ease'
      }}
      aria-live="polite"
    >
      <div
        className="movie-subtitles-pill"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '5px',
          backgroundColor: 'rgba(10, 16, 28, 0.65)', // translucent background
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '6px 20px',
          borderRadius: '9999px', // rounded corners
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.45)',
          maxWidth: '100%'
        }}
      >
        {activeLine.words.map((word, wIdx) => {
          // Word opacity logic:
          // - Spoken words: 100% opacity
          // - Upcoming words: 50% opacity
          const isSpoken = spokenCharIndex >= word.startIndex;

          return (
            <span
              key={`${activeLineIdx}-${wIdx}-${word.startIndex}`}
              style={{
                display: 'inline-block',
                fontSize: 'clamp(13px, 1.4vw, 16px)',
                lineHeight: '1.4',
                letterSpacing: '0.2px',
                opacity: isSpoken ? 1 : 0.5,
                color: isSpoken ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                fontWeight: isSpoken ? '600' : '500',
                transition: 'opacity 140ms ease, color 140ms ease',
                textShadow: isSpoken
                  ? '0 1px 3px rgba(0, 0, 0, 0.9), 0 0 2px rgba(0, 0, 0, 0.8)'
                  : 'none'
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
