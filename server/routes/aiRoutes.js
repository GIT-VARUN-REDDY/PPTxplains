import express from 'express';
import { handleDoubt, handleVoiceDoubt, getPresentationDetails, handleUploadPresentation } from '../controllers/aiController.js';
import { handleGenerateTTS, getAvailableNeuralVoices } from '../controllers/ttsController.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI Presentation Assistant API'
  });
});

// Neural Studio TTS endpoints: Ultra-clear human speech with natural highs and lows
router.post('/tts/speak', handleGenerateTTS);
router.get('/tts/voices', getAvailableNeuralVoices);

// Presentation upload / ingestion endpoint (Feature 8)
router.post('/presentations/upload', handleUploadPresentation);

// Presentation details endpoint
router.get('/presentations/:id', getPresentationDetails);

// AI Doubt processing endpoint with rate limiting
router.post('/ai/doubt', aiRateLimiter, handleDoubt);

// AI Voice Doubt processing endpoint with rate limiting
router.post('/ai/voice-doubt', aiRateLimiter, handleVoiceDoubt);

export default router;
