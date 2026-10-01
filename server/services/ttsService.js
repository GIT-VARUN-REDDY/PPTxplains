import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import crypto from 'crypto';

/**
 * Curated executive neural studio voices with natural highs, lows,
 * fluent pacing, and crystal-clear pronunciation of technical concepts.
 */
export const NEURAL_VOICES = [
  {
    id: 'en-US-GuyNeural',
    name: 'Guy (Keynote Studio)',
    gender: 'Male',
    lang: 'en-US',
    description: 'Dynamic, confident keynote presenter with natural pitch variation'
  },
  {
    id: 'en-US-JennyNeural',
    name: 'Jenny (Executive Clear)',
    gender: 'Female',
    lang: 'en-US',
    description: 'Warm, articulate, and highly intelligible technical speaker'
  },
  {
    id: 'en-US-AriaNeural',
    name: 'Aria (Technical Specialist)',
    gender: 'Female',
    lang: 'en-US',
    description: 'Expressive and sharp, perfect for deep engineering topics'
  },
  {
    id: 'en-US-ChristopherNeural',
    name: 'Christopher (Deep Broadcaster)',
    gender: 'Male',
    lang: 'en-US',
    description: 'Authoritative, resonant voice ideal for executive briefings'
  },
  {
    id: 'en-IN-NeerjaNeural',
    name: 'Neerja (Fluent Indian English)',
    gender: 'Female',
    lang: 'en-IN',
    description: 'Natural Indian English cadence with crystal-clear pronunciation'
  },
  {
    id: 'en-IN-PrabhatNeural',
    name: 'Prabhat (Professional Indian English)',
    gender: 'Male',
    lang: 'en-IN',
    description: 'Smooth, polished Indian English tone with great technical clarity'
  }
];

// In-memory audio buffer cache (MD5 hash -> Buffer)
const audioCache = new Map();
const MAX_CACHE_ITEMS = 80;

function cleanTextForTTS(text) {
  if (!text) return '';
  return text
    .replace(/###?\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/`{1,3}.*?`{1,3}/gs, 'code block')
    .replace(/&amp;/g, ' and ')
    .replace(/&/g, ' and ')
    .replace(/[<>]/g, ' ')
    .replace(/•\s*/g, '')
    .replace(/[-*]\s+/g, '')
    .replace(/[\r\n]+/g, '. ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Generate studio-quality Neural MP3 audio buffer using Microsoft Edge Neural TTS.
 */
export async function generateNeuralAudio({
  text,
  voice = 'en-US-GuyNeural',
  rate = 1.0
}) {
  const clean = cleanTextForTTS(text);
  if (!clean) {
    throw new Error('Text cannot be empty for TTS generation.');
  }

  // Format rate string for edge-tts (e.g., 1.15 -> "+15%", 1.25 -> "+25%", 1.5 -> "+50%")
  let rateStr = '+0%';
  const rateNum = typeof rate === 'number' ? rate : parseFloat(rate) || 1.0;
  if (rateNum > 1.0) {
    rateStr = `+${Math.round((rateNum - 1.0) * 100)}%`;
  } else if (rateNum < 1.0) {
    rateStr = `-${Math.round((1.0 - rateNum) * 100)}%`;
  }

  // Check cache
  const cacheKey = crypto.createHash('md5').update(`${voice}:${rateStr}:${clean}`).digest('hex');
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey);
  }

  // Fallback to Guy if voice not recognized
  const validVoice = NEURAL_VOICES.some((v) => v.id === voice) ? voice : 'en-US-GuyNeural';

  const tts = new MsEdgeTTS();
  await tts.setMetadata(validVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const { audioStream } = tts.toStream(clean, { rate: rateStr });

  const buffer = await new Promise((resolve, reject) => {
    const chunks = [];
    const timeout = setTimeout(() => {
      reject(new Error('TTS generation timed out after 8s'));
    }, 8000);

    audioStream.on('data', (c) => chunks.push(c));
    audioStream.on('end', () => {
      clearTimeout(timeout);
      resolve(Buffer.concat(chunks));
    });
    audioStream.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });

  // Store in cache (manage size)
  if (audioCache.size >= MAX_CACHE_ITEMS) {
    const firstKey = audioCache.keys().next().value;
    audioCache.delete(firstKey);
  }
  audioCache.set(cacheKey, buffer);

  return buffer;
}
