/**
 * API service for loading presentation data and communicating with backend Gemini AI endpoint.
 */

const API_BASE = '/api';

/**
 * Fetch presentation metadata and slides.
 * Checks local static JSON first for zero-latency, then API fallback.
 */
export async function fetchPresentation(id = 'ai-video-strategy') {
  try {
    // Try static JSON first
    const staticRes = await fetch(`/presentations/${id}/presentation.json`);
    if (staticRes.ok) {
      const data = await staticRes.json();
      return data;
    }
  } catch (err) {
    console.warn('[API] Could not load static JSON, falling back to server API...', err);
  }

  // Fallback to Express backend API
  const res = await fetch(`${API_BASE}/presentations/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to load presentation (${res.status} ${res.statusText})`);
  }
  const data = await res.json();
  return data.presentation;
}

/**
 * Submit user doubt to Gemini AI backend.
 * Supports AbortSignal for immediate cancellation via X button.
 */
export async function askAIDoubt({
  presentationId = 'ai-video-strategy',
  slideNumber,
  slideTitle,
  slideContext,
  question,
  signal
}) {
  const res = await fetch(`${API_BASE}/ai/doubt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      presentationId,
      slideNumber,
      slideTitle,
      slideContext,
      question
    }),
    signal
  });

  if (!res.ok) {
    let errorMsg = 'Failed to get AI response. Please try again.';
    try {
      const errorData = await res.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch {
      // Use status text
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  const data = await res.json();
  return data;
}

/**
 * Submit spoken voice doubt (with recorded audio base64) to Gemini AI backend.
 * Enables full multimodal voice queries even if browser STT is offline.
 */
export async function askAIVoiceDoubt({
  presentationId = 'ai-video-strategy',
  slideNumber,
  slideTitle,
  slideContext,
  audioBase64,
  mimeType = 'audio/webm',
  signal
}) {
  const res = await fetch(`${API_BASE}/ai/voice-doubt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      presentationId,
      slideNumber,
      slideTitle,
      slideContext,
      audioBase64,
      mimeType
    }),
    signal
  });

  if (!res.ok) {
    let errorMsg = 'Failed to process voice doubt. Please try again.';
    try {
      const errorData = await res.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch {
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  const data = await res.json();
  return data;
}

/**
 * Check backend health status.
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Feature 8: Upload / Ingest presentation (.pptx, .pdf, text outline) via Gemini pipeline
 */
export async function uploadPresentation(payload) {
  const res = await fetch(`${API_BASE}/presentations/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    let errorMsg = 'Failed to ingest presentation. Please try again.';
    try {
      const errorData = await res.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch {
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  const data = await res.json();
  return data;
}
