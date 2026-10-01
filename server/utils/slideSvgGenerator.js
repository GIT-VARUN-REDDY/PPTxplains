/**
 * Generates an executive 1920x1080 16:9 SVG slide image for custom/uploaded presentations.
 * Modern dark-mode keynote aesthetic with glowing gradients, metrics cards, and clear typography.
 */
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateSlideSvg({
  slideNumber = 1,
  totalSlides = 5,
  title = 'Architecture Overview',
  subtitle = 'Strategic and Technical Breakdown',
  category = 'Technical Architecture',
  keyPoints = [],
  metrics = []
}) {
  const safeTitle = escapeXml(title || 'Presentation Slide');
  const safeSubtitle = escapeXml(subtitle || '');
  const safeCategory = escapeXml((category || 'STRATEGY').toUpperCase());

  // Metrics cards XML
  const metricsXml = (metrics || []).slice(0, 3).map((m, idx) => {
    const x = 1180;
    const y = 320 + idx * 170;
    const label = escapeXml(m.label || 'Metric');
    const val = escapeXml(m.value || '100%');
    const change = escapeXml(m.change || 'Benchmark target');

    return `
      <g transform="translate(${x}, ${y})">
        <rect width="600" height="145" rx="16" fill="#0e172a" stroke="rgba(56, 189, 248, 0.25)" stroke-width="2" />
        <rect x="0" y="0" width="6" height="145" rx="3" fill="#38bdf8" />
        <text x="32" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="600" fill="#94a3b8" letter-spacing="1">${label}</text>
        <text x="32" y="98" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="46" font-weight="800" fill="#f8fafc">${val}</text>
        <text x="32" y="128" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="#38bdf8">${change}</text>
      </g>
    `;
  }).join('');

  // Key points XML with auto text wrapping for long lines
  const pointsXml = (keyPoints || []).slice(0, 4).map((pt, idx) => {
    const y = 340 + idx * 140;
    const rawPt = String(pt || '').trim();
    let line1 = rawPt;
    let line2 = '';
    if (rawPt.length > 52) {
      const splitIdx = rawPt.lastIndexOf(' ', 52);
      if (splitIdx > 0) {
        line1 = rawPt.substring(0, splitIdx);
        line2 = rawPt.substring(splitIdx + 1);
      }
    }
    const safeLine1 = escapeXml(line1);
    const safeLine2 = escapeXml(line2);

    return `
      <g transform="translate(140, ${y})">
        <rect width="980" height="${line2 ? 120 : 100}" rx="14" fill="#0d1527" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1.2" />
        <circle cx="36" cy="${line2 ? 46 : 50}" r="16" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" stroke-width="2" />
        <text x="36" y="${line2 ? 52 : 56}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="800" fill="#38bdf8" text-anchor="middle">${idx + 1}</text>
        <text x="74" y="${line2 ? 40 : 56}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="500" fill="#f1f5f9">
          <tspan x="74" dy="0">${safeLine1}</tspan>
          ${safeLine2 ? `<tspan x="74" dy="30" fill="#94a3b8" font-size="19">${safeLine2}</tspan>` : ''}
        </text>
      </g>
    `;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#040812"/>
        <stop offset="50%" stop-color="#070e1c"/>
        <stop offset="100%" stop-color="#0a1426"/>
      </linearGradient>
      <linearGradient id="accentGlow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#818cf8"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.025)" stroke-width="1"/>
      </pattern>
    </defs>

    <!-- Background Base -->
    <rect width="1920" height="1080" fill="url(#bgGrad)" />
    <rect width="1920" height="1080" fill="url(#grid)" />

    <!-- Ambient glow orbs -->
    <circle cx="1700" cy="180" r="320" fill="rgba(56, 189, 248, 0.06)" filter="blur(60px)" />
    <circle cx="200" cy="900" r="360" fill="rgba(99, 102, 241, 0.07)" filter="blur(70px)" />

    <!-- Top Slide Header -->
    <g transform="translate(140, 90)">
      <rect width="200" height="34" rx="8" fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.3)" stroke-width="1.5" />
      <text x="100" y="23" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#38bdf8" text-anchor="middle" letter-spacing="1.5">${safeCategory}</text>

      <text x="0" y="90" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="800" fill="#ffffff" letter-spacing="-0.5">${safeTitle}</text>
      ${safeSubtitle ? `<text x="0" y="136" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#94a3b8">${safeSubtitle}</text>` : ''}
    </g>

    <!-- Divider Bar -->
    <rect x="140" y="260" width="1640" height="2" fill="rgba(255, 255, 255, 0.08)" />
    <rect x="140" y="260" width="${Math.round((slideNumber / totalSlides) * 1640)}" height="2" fill="url(#accentGlow)" />

    <!-- Key Points Container -->
    <g>
      ${pointsXml}
    </g>

    <!-- Metrics Cards Container -->
    <g>
      ${metricsXml}
    </g>

    <!-- Bottom Footer Status -->
    <g transform="translate(140, 990)">
      <text x="0" y="20" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="600" fill="#64748b">
        PPTxplains &#8226; AI-Generated Technical Deck
      </text>
      <text x="1640" y="20" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" font-weight="700" fill="#38bdf8" text-anchor="end">
        Slide ${slideNumber} / ${totalSlides}
      </text>
    </g>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;
}
