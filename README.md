# AI Presentation Assistant (PPTxplains)

> **Watch. Ask. Understand.**  
> A professional, shareable presentation web application powered by **React** and **Node.js/Express**, with an integrated, slide-context-aware **Google Gemini AI Doubt Assistant** supporting hands-free voice input and natural speech synthesis output.

---

## Table of Contents
1. [Overview](#1-overview)
2. [Architecture & Philosophy](#2-architecture--philosophy)
3. [Key Features](#3-key-features)
4. [Project Structure](#4-project-structure)
5. [Prerequisites](#5-prerequisites)
6. [Installation & Setup](#6-installation--setup)
7. [Running Locally](#7-running-locally)
8. [Configuring Google Gemini API](#8-configuring-google-gemini-api)
9. [How Slide AI Context Works](#9-how-slide-ai-context-works)
10. [How Voice Input Works](#10-how-voice-input-works)
11. [How Voice Output (TTS) Works](#11-how-voice-output-tts-works)
12. [Cancellation (AbortController) Feature](#12-cancellation-abortcontroller-feature)
13. [How to Add Another Presentation](#13-how-to-add-another-presentation)
14. [Building for Production & Deployment](#14-building-for-production--deployment)

---

## 1. Overview

The **AI Presentation Assistant** allows anyone to open a public URL (e.g. `/presentation/ai-video-strategy`) and view an interactive, high-retention corporate technical presentation. As the presentation progresses—either manually or automatically—an intelligent, context-aware AI assistant stands ready to clarify doubts.

Unlike generic chatbots, this assistant evaluates questions directly within the context of the **currently active slide**, its engineering metrics, case studies, and the overarching presentation roadmap.

### The Included 12-Slide Presentation:
**"AI-Generated Technical Videos Strategy"**
1. **AI-Generated Technical Videos Strategy** (Strategic Overview)
2. **Executive Summary** (Documentation Paradox & Solution)
3. **Education & Engagement** (Cognitive Retention & Micro-learning)
4. **Technical Demonstration** (Clock Tree Synthesis & Skew Optimization)
5. **Brand & Organic Growth** (Credibility & Distribution Moat)
6. **Recruitment & Talent** (Engineering Culture & Talent Magnet)
7. **Sales Enablement** (De-risking Enterprise PoCs)
8. **Operations & AI Scale** (Script-to-Video Generative Pipelines)
9. **Content Operations** (Modular Components & Zero-Shot Localization)
10. **Academic Bridge** (University Partnerships & Standards)
11. **Multi-Stakeholder ROI** (Quantifiable Engineering & Business Metrics)
12. **Summary Formula** (Compounding Flywheel & Roadmap)

---

## 2. Architecture & Philosophy

- **Zero Database / Zero Storage**: Intentionally simple, lightweight, and stateless. No MongoDB, PostgreSQL, SQL, Redis, or permanent user tracking. Everything is loaded statically from JSON and served in-memory.
- **No User Accounts / No Login**: Frictionless public access via shareable URL.
- **Secure Backend API Proxy**: `GEMINI_API_KEY` resides strictly on the Express backend and is **never** bundled or exposed to the client browser.
- **Frontend Stack**: React 19, Vite, Vanilla CSS design tokens, Lucide Icons.
- **Backend Stack**: Node.js, Express, `@google/generative-ai`, CORS, dotenv, express-rate-limit.

---

## 3. Key Features

- **Automatic Progression**: Click **START** to automatically advance through slides with a visual timer progress bar. Click **PAUSE** anytime.
- **Tab Inactivity Detection**: Uses the Page Visibility API to automatically pause the slide progression timer when the browser tab is hidden or backgrounded, preventing missed content.
- **Voice & Text Modes**:
  - **Voice Mode**: Tap to speak using the browser Web Speech API. Visual waveform indicator, transcript preview, and automatic submission.
  - **Text Mode**: Multiline input with `Enter` to submit, `Shift+Enter` for newline.
- **Voice Playback (TTS)**: Spoken answers with a live `🔊 Speaking...` indicator and an immediate `[ Stop ]` button.
- **Instant Cancellation (`X Cancel`)**: While Gemini is thinking, click `[X Cancel]` to abort the HTTP request via `AbortController`, silence speech, and immediately ask a new question.
- **Slide Overview Modal**: Instant thumbnail grid of all 12 slides for single-click jumping.
- **Keyboard Shortcuts**:
  - `Space`: Play / Pause auto-advance
  - `ArrowLeft` / `ArrowRight`: Navigate previous / next slide
  - `F`: Toggle Fullscreen mode
  - `Escape`: Exit Fullscreen or close Slide Overview

---

## 4. Project Structure

```
PPTxplains/
├── package.json                 # Monorepo root scripts
├── README.md                    # Complete documentation
├── test-endpoints.js            # End-to-end integration test suite
├── server/
│   ├── package.json             # Backend dependencies
│   ├── .env                     # Private environment variables (git-ignored)
│   ├── .env.example             # Example environment variables
│   ├── server.js                # Express app setup, CORS, and routing
│   ├── generate-slides.js       # Script generating 1920x1080 PNG slides & JSON
│   ├── routes/
│   │   └── aiRoutes.js          # /api/ai/doubt, /api/health, /api/presentations
│   ├── controllers/
│   │   └── aiController.js      # Request validation, abort handling, context assembly
│   ├── services/
│   │   └── geminiService.js     # Google Gemini Flash API integration & fallback engine
│   ├── middleware/
│   │   ├── errorHandler.js      # Safe error handler (no leaked secrets)
│   │   └── rateLimiter.js       # Express rate limiter (60 req / 15 min)
│   ├── data/
│   │   └── presentations.js     # Canonical server slide knowledge store
│   └── utils/
│       └── prompts.js           # System prompt & context-grounding builder
├── client/
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.js           # Vite config with API proxy
│   ├── index.html               # HTML5 shell with Inter & JetBrains Mono fonts
│   ├── public/
│   │   ├── favicon.svg          # Custom SVG favicon
│   │   └── presentations/
│   │       └── ai-video-strategy/
│   │           ├── presentation.json  # Presentation metadata & slide context
│   │           ├── slide-01.png       # 1920x1080 slide image
│   │           ├── ...
│   │           └── slide-12.png
│   └── src/
│       ├── main.jsx             # React DOM entrypoint
│       ├── App.jsx              # Lightweight history-based router
│       ├── index.css            # Dark mode corporate SaaS design system
│       ├── pages/
│       │   ├── LandingPage.jsx  # Hero and feature showcase
│       │   └── PresentationPage.jsx # Main 70/30 presentation & AI assistant split
│       ├── components/
│       │   ├── Header.jsx       # Title, slide counter, overview, fullscreen
│       │   ├── SlideViewer.jsx  # Stage, transition fade, completion modal
│       │   ├── SlideControls.jsx # Progression bar, start/pause, next/prev, duration
│       │   ├── AIDoubtPanel.jsx # AI assistant, mode switch, cancel, session history
│       │   ├── VoiceInput.jsx   # Mic button, ripple animation, transcript preview
│       │   ├── TextInput.jsx    # Textarea, enter-to-send, char count
│       │   └── SlideOverviewModal.jsx # 12-slide thumbnail navigation grid
│       ├── hooks/
│       │   ├── usePresentation.js      # Slide timer, progression, tab visibility
│       │   ├── useSpeechRecognition.js # Web Speech API voice input
│       │   ├── useSpeechSynthesis.js   # Browser TTS voice output
│       │   ├── useAIDoubt.js           # Query lifecycle & AbortController
│       │   └── useFullscreen.js        # Fullscreen API wrapper
│       └── services/
│           └── api.js                  # Frontend API requests
```

---

## 5. Prerequisites

- **Node.js**: v18.0.0 or higher (v22+ recommended)
- **npm**: v9.0.0 or higher
- A modern web browser (Google Chrome, Edge, Safari, or Firefox)

---

## 6. Installation & Setup

Clone the repository and install all dependencies:

```bash
# Clone the repository
git clone <repo-url>
cd PPTxplains

# Install root, backend, and frontend dependencies in one command
npm run install:all
```

Alternatively, install individually:

```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```

---

## 7. Running Locally

You can run both client and server concurrently from the root directory:

```bash
# From the root directory:
npm run dev
```

Or run them in separate terminals:

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
# Server runs on: http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Client runs on: http://localhost:5173
```

Open your browser to:
- **Landing Page**: [http://localhost:5173/](http://localhost:5173/)
- **Direct Presentation Route**: [http://localhost:5173/presentation/ai-video-strategy](http://localhost:5173/presentation/ai-video-strategy)

---

## 8. Configuring Google Gemini API

1. Obtain an API key from Google AI Studio: [https://aistudio.google.com/](https://aistudio.google.com/)
2. Open `server/.env` in your editor:
   ```env
   GEMINI_API_KEY=AIzaSy...your_actual_api_key_here
   PORT=5000
   CLIENT_URL=http://localhost:5173
   GEMINI_MODEL=gemini-1.5-flash
   ```
3. Restart the server (`npm run dev`).
4. **Fallback Mode**: If `GEMINI_API_KEY` is omitted or left blank, the application automatically activates its **smart local presentation knowledge engine**, providing domain-accurate answers for testing without any API keys.

---

## 9. How Slide AI Context Works

When a user submits a question (by typing or speaking), the client sends:

```json
{
  "presentationId": "ai-video-strategy",
  "slideNumber": 4,
  "slideTitle": "Technical Demonstration",
  "slideContext": "This slide showcases Clock Tree Synthesis (CTS) optimization...",
  "question": "What is CTS optimization?"
}
```

The Express backend enriches this with:
1. **Current Slide Highlights & Metrics**: Timing slack, skew targets (<15ps), buffer topologies.
2. **Surrounding Context**: Previous slide title, next slide title, and full 12-slide roadmap.
3. **System Instructions**:
   > *"You are an AI presentation assistant. Prioritize the current slide. If the question refers to something on the current slide, explain it specifically in that context. If unrelated, politely indicate that..."*

This prevents hallucination and guarantees answers are grounded in the active slide.

---

## 10. How Voice Input Works

- Uses the native browser **Web Speech API** (`window.SpeechRecognition` or `window.webkitSpeechRecognition`).
- Handled cleanly in `client/src/hooks/useSpeechRecognition.js`.
- If the user has not yet granted microphone permission, the browser displays a standard permission prompt.
- If the browser does not support the Web Speech API (e.g. some minimalist browsers), an informative message appears offering a one-click switch to Text mode.
- Speech is transcribed in real-time, displayed on screen (`"You asked: <transcript>"`), and sent automatically to Gemini.

---

## 11. How Voice Output (TTS) Works

- When a question is submitted in **Voice Mode**, the AI response is displayed as text **and** spoken aloud.
- Powered by `window.speechSynthesis` via `client/src/hooks/useSpeechSynthesis.js`.
- Automatically strips raw markdown syntax (headers, asterisks, bullet points) before speaking so the narration sounds natural and conversational.
- Displays a `🔊 Speaking...` status with a `[ Stop ]` button.
- Voice narration immediately halts if:
  - The user clicks `Stop`
  - The user clicks `[X Cancel]`
  - The user navigates to a new slide
  - The user submits a new question

---

## 12. Cancellation (`AbortController`) Feature

If the AI is currently processing a query:
- The UI displays `AI is thinking...` with a prominent `[X Cancel]` button.
- Clicking `[X Cancel]`:
  1. Fires `abort()` on the frontend `AbortController`.
  2. Cancels the active `fetch()` request immediately.
  3. Stops any ongoing speech synthesis.
  4. Resets the UI to an idle state with a friendly `"Request cancelled"` badge.
  5. Frees the user to immediately ask a different doubt without waiting.

---

## 13. How to Add Another Presentation

To add another static presentation (e.g. `quantum-computing-overview`):

1. **Create the Presentation Folder**:
   ```
   client/public/presentations/quantum-computing-overview/
       ├── presentation.json
       ├── slide-01.png
       └── ...
   ```
2. **Add Metadata & Slides in `presentation.json`**:
   ```json
   {
     "id": "quantum-computing-overview",
     "title": "Quantum Computing Architectural Overview",
     "description": "Foundations of superconducting qubits and quantum error correction.",
     "totalSlides": 8,
     "slides": [
       {
         "id": 1,
         "slideNumber": 1,
         "title": "Introduction to Superconducting Qubits",
         "image": "/presentations/quantum-computing-overview/slide-01.png",
         "context": "Overview of transmon qubits, Josephson junctions, and microwave control lines."
       }
     ]
   }
   ```
3. **Register in `server/data/presentations.js`**:
   Add the presentation definition to the `presentations` dictionary.
4. **Access the URL**:
   The presentation is instantly available at:
   `/presentation/quantum-computing-overview`

---

## 14. Building for Production & Deployment

### Production Build:
```bash
# Build the optimized client bundle
npm run build
```
This generates production assets in `client/dist/` (`index.html`, minified CSS, chunked JS).

### Deployment Options:
- **Unified Deployment (Render, Railway, Heroku, VPS)**:
  Configure `server/server.js` to serve static files from `../client/dist`:
  ```javascript
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
  ```
- **Separated Deployment**:
  - Deploy `client/` to Vercel, Netlify, or Cloudflare Pages.
  - Deploy `server/` to Render, Railway, or Google Cloud Run.
  - Update `CLIENT_URL` in `server/.env` and `API_BASE` in `client/src/services/api.js`.

---

## 15. Verification & Tests

To run the automated integration test suite across both frontend and backend:

```bash
node test-endpoints.js
```

All 8 automated test suites verify health checks, slide metadata, static image serving, contextual Gemini doubt queries, and `AbortController` cancellation.
