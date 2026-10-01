import { generateNeuralAudio, NEURAL_VOICES } from '../services/ttsService.js';

/**
 * Handle neural TTS generation and stream MP3 back to client.
 */
export async function handleGenerateTTS(req, res, next) {
  try {
    const { text, voice = 'en-US-GuyNeural', rate = 1.0 } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Text is required for TTS generation.'
      });
    }

    const audioBuffer = await generateNeuralAudio({
      text,
      voice,
      rate
    });

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=86400, immutable',
      'Accept-Ranges': 'bytes'
    });

    return res.end(audioBuffer);
  } catch (error) {
    console.error('[TTS Controller] Error generating speech:', error);
    next(error);
  }
}

/**
 * Return list of supported neural studio voices.
 */
export function getAvailableNeuralVoices(req, res) {
  res.status(200).json({
    success: true,
    voices: NEURAL_VOICES
  });
}
