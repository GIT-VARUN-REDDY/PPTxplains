/**
 * topicRecognizer.js
 * Universal Context Recognition & Dimension Mapping Engine:
 * - Recognizes every context zone (Title, Key Points, Metrics, Custom Zones) with exact coordinates for ANY slide.
 * - Dynamically adapts to any number of key points, metrics, and slide layouts.
 * - Synchronizes the active topic with real-time speech narration and subtitle text.
 * - Enables click-to-explain interactions on any recognized card.
 */

const STOP_WORDS = new Set([
  'this', 'that', 'with', 'from', 'have', 'more', 'than', 'into', 'will',
  'about', 'each', 'their', 'when', 'what', 'which', 'where', 'our', 'and',
  'for', 'the', 'are', 'was', 'were', 'been', 'being', 'slide', 'here', 'also'
]);

const NUMBER_MAP = {
  fifteen: '15',
  forty: '40',
  eighty: '80',
  four: '4',
  three: '3',
  two: '2',
  one: '1',
  sixty: '60',
  twenty: '20',
  ten: '10'
};

function normalizeWords(str) {
  if (!str) return [];
  return (str.toLowerCase().match(/[a-z0-9%<-]+/g) || [])
    .map((w) => NUMBER_MAP[w] || w)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

/**
 * Computes exact dimensions and coordinates for every context zone on ANY slide.
 * High-precision pixel-aligned bounding boxes for 1920x1080 canvas.
 */
export function getSlideContextZones(slide) {
  if (!slide) return [];

  // If slide provides custom zones/elements explicitly, use them
  if (Array.isArray(slide.zones) && slide.zones.length > 0) {
    return slide.zones;
  }
  if (Array.isArray(slide.elements) && slide.elements.length > 0) {
    return slide.elements;
  }

  const zones = [];

  // 1. Title & Subtitle Zone: Spans across the full header area without clipping words
  if (slide.title) {
    zones.push({
      id: 'title',
      zoneKey: 'title',
      label: slide.title,
      type: 'title',
      left: '6.77%',
      top: '15.83%',
      width: '86.46%',
      height: '13.43%',
      text: `${slide.title} ${slide.subtitle || ''}`,
      keywords: normalizeWords(`${slide.title} ${slide.subtitle || ''}`)
    });
  }

  // 2. Key Points Zones (aligned with exact 980x145 cards at x=140)
  const keyPoints = Array.isArray(slide.keyPoints) ? slide.keyPoints : [];
  const pointCount = keyPoints.length;

  if (pointCount > 0) {
    // Exact standard layout for 3 points: y = 370, 545, 720
    const standardTops = [34.26, 50.46, 66.67];

    keyPoints.forEach((pt, idx) => {
      let topPct = standardTops[idx];
      let cardHeight = 13.43;

      if (pointCount !== 3) {
        const startTop = 34.26;
        const totalSlotHeight = 46.0;
        const slotHeight = totalSlotHeight / pointCount;
        topPct = startTop + idx * slotHeight;
        cardHeight = Math.min(13.43, slotHeight * 0.88);
      }

      zones.push({
        id: `point-${idx + 1}`,
        zoneKey: `point${idx + 1}`,
        label: pt.length > 36 ? pt.slice(0, 36) + '...' : pt,
        type: 'point',
        index: idx,
        left: '7.29%',
        top: `${topPct.toFixed(2)}%`,
        width: '51.04%',
        height: `${cardHeight.toFixed(2)}%`,
        text: pt,
        keywords: normalizeWords(pt)
      });
    });
  }

  // 3. Metrics Zones (aligned with exact 600x150 cards at x=1180, y=340, 530, 720)
  const metrics = Array.isArray(slide.metrics) ? slide.metrics : [];
  const metricCount = metrics.length;

  if (metricCount > 0) {
    const standardMetricTops = [31.48, 49.07, 66.67];

    metrics.forEach((m, idx) => {
      let topPct = standardMetricTops[idx];
      let cardHeight = 13.89;

      if (metricCount !== 3) {
        const startTop = 31.48;
        const slotHeight = 17.6;
        topPct = startTop + idx * slotHeight;
        cardHeight = 13.89;
      }

      const label = `${m.value || ''} ${m.label || 'Metric'}`.trim();
      zones.push({
        id: `metric-${idx + 1}`,
        zoneKey: `metric${idx + 1}`,
        label,
        type: 'metric',
        index: idx,
        left: '61.46%',
        top: `${topPct.toFixed(2)}%`,
        width: '31.25%',
        height: `${cardHeight.toFixed(2)}%`,
        text: `${m.label || ''} ${m.value || ''} ${m.change || ''}`,
        keywords: normalizeWords(`${m.label || ''} ${m.value || ''} ${m.change || ''}`)
      });
    });
  }

  // Distribute speech timeline ratios across zones
  const totalZones = zones.length;
  if (totalZones > 0) {
    const hasTitle = zones.some((z) => z.id === 'title');
    const remainingRatio = hasTitle ? 0.76 : 1.0;
    const nonTitleCount = hasTitle ? totalZones - 1 : totalZones;
    const step = nonTitleCount > 0 ? remainingRatio / nonTitleCount : 1.0;

    let currentStart = 0;
    zones.forEach((z) => {
      if (z.id === 'title') {
        z.startRatio = 0.0;
        z.endRatio = 0.24;
        currentStart = 0.24;
      } else {
        z.startRatio = parseFloat(currentStart.toFixed(3));
        currentStart += step;
        z.endRatio = parseFloat(Math.min(1.0, currentStart).toFixed(3));
      }
    });
  }

  return zones;
}

/**
 * Slide-specific curated topic highlights for precision synchronization
 */
export const CURATED_SLIDE_MAPPINGS = {
  1: [
    { startRatio: 0.0, endRatio: 0.28, zoneId: 'title', label: 'AI Video Strategy' },
    { startRatio: 0.28, endRatio: 0.55, zoneId: 'point-2', label: 'Static Documentation Failure' },
    { startRatio: 0.55, endRatio: 0.78, zoneId: 'metric-1', label: '4x Engineering Retention' },
    { startRatio: 0.78, endRatio: 1.0, zoneId: 'metric-2', label: '2 Hours Production Turnaround' }
  ],
  2: [
    { startRatio: 0.0, endRatio: 0.22, zoneId: 'title', label: 'Executive Summary' },
    { startRatio: 0.22, endRatio: 0.48, zoneId: 'point-1', label: 'Problem: <15% Read-Through' },
    { startRatio: 0.48, endRatio: 0.70, zoneId: 'point-2', label: 'Solution: AI Video Pipeline' },
    { startRatio: 0.70, endRatio: 0.85, zoneId: 'metric-2', label: 'Sales Cycle: -40% Friction' },
    { startRatio: 0.85, endRatio: 1.0, zoneId: 'metric-3', label: 'Cost Per Video: -80% Savings' }
  ],
  3: [
    { startRatio: 0.0, endRatio: 0.24, zoneId: 'title', label: 'Cognitive Retention' },
    { startRatio: 0.24, endRatio: 0.54, zoneId: 'point-1', label: 'Visual Learning Advantage' },
    { startRatio: 0.54, endRatio: 0.78, zoneId: 'metric-1', label: '65% 72-Hour Retention' },
    { startRatio: 0.78, endRatio: 1.0, zoneId: 'metric-2', label: '3x Comprehension Velocity' }
  ],
  4: [
    { startRatio: 0.0, endRatio: 0.22, zoneId: 'title', label: 'Silicon Knowledge Bottleneck' },
    { startRatio: 0.22, endRatio: 0.50, zoneId: 'point-1', label: 'H-Tree & Clock Skew' },
    { startRatio: 0.50, endRatio: 0.75, zoneId: 'point-3', label: 'SPICE Waveforms & Rigor' },
    { startRatio: 0.75, endRatio: 1.0, zoneId: 'metric-1', label: 'Clock Skew: <15ps' }
  ]
};

/**
 * Identifies the currently active topic and its exact dimensions for ANY slide.
 */
export function getActiveTopicForSlide(slide, spokenCharIndex = 0, currentLineText = '') {
  if (!slide) return null;

  const zones = getSlideContextZones(slide);
  if (zones.length === 0) return null;

  const narration = slide.narration || slide.context || '';
  const totalLength = narration.length || 1;
  const ratio = Math.max(0, Math.min(1, spokenCharIndex / totalLength));
  const slideNum = slide.slideNumber || slide.id || 1;

  // 1. If active subtitle text is available, check keyword match first
  if (currentLineText && currentLineText.trim().length > 3) {
    const lineWords = normalizeWords(currentLineText);
    let bestZone = null;
    let maxMatch = 0;

    for (const z of zones) {
      if (z.keywords && z.keywords.length > 0) {
        let matchCount = 0;
        for (const kw of z.keywords) {
          if (lineWords.some((lw) => lw.includes(kw) || kw.includes(lw))) {
            matchCount++;
          }
        }
        if (matchCount > maxMatch) {
          maxMatch = matchCount;
          bestZone = z;
        }
      }
    }

    if (bestZone && maxMatch >= 1) {
      return bestZone;
    }
  }

  // 2. Check curated mappings if available
  const curated = CURATED_SLIDE_MAPPINGS[slideNum];
  if (curated && curated.length > 0) {
    for (const item of curated) {
      if (ratio >= item.startRatio && ratio < item.endRatio) {
        const found = zones.find((z) => z.id === item.zoneId);
        if (found) {
          return { ...found, label: item.label || found.label };
        }
      }
    }
  }

  // 3. Match against dynamic timeline ratios
  for (const z of zones) {
    if (ratio >= (z.startRatio || 0) && ratio < (z.endRatio || 1)) {
      return z;
    }
  }

  return zones[0];
}
