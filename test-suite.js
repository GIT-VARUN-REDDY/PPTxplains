import fs from 'fs';
process.env.NODE_ENV = 'test';

const { default: app } = await import('./server/server.js');
const { getPresentation, saveCustomPresentation } = await import('./server/data/presentations.js');

const PORT = 5055;
let server;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('=====================================================');
  console.log('PPTxplains Comprehensive Test & Security Audit Suite');
  console.log('=====================================================\n');

  // Start server on isolated test port
  await new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`[Test Server] Started on http://localhost:${PORT}`);
      resolve();
    });
  });

  const BASE = `http://localhost:${PORT}`;
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    process.stdout.write(`TEST ${total}: ${name} ... `);
    try {
      await fn();
      console.log('PASSED');
      passed++;
    } catch (err) {
      console.log(`FAILED\n  --> ${err.message}`);
    }
  }

  try {
    // Test 1: Health check
    await test('Backend Health Check (/api/health)', async () => {
      const res = await fetch(`${BASE}/api/health`);
      assert(res.status === 200, `Expected status 200, got ${res.status}`);
      const data = await res.json();
      assert(data.status === 'ok', `Expected status 'ok', got ${data.status}`);
      assert(data.service === 'AI Presentation Assistant API', 'Service name mismatch');
      assert(data.geminiConfigured === true, 'Gemini API Key was not detected as configured');
      assert(typeof data.model === 'string' && data.model.length > 0, 'Gemini Model is missing');
    });

    // Test 2: Security Headers
    await test('Security Headers (nosniff, SAMEORIGIN, Referrer-Policy)', async () => {
      const res = await fetch(`${BASE}/api/health`);
      assert(res.headers.get('x-content-type-options') === 'nosniff', 'Missing X-Content-Type-Options: nosniff');
      assert(res.headers.get('x-frame-options') === 'SAMEORIGIN', 'Missing X-Frame-Options: SAMEORIGIN');
      assert(res.headers.get('referrer-policy') === 'strict-origin-when-cross-origin', 'Missing Referrer-Policy');
    });

    // Test 3: Fetch Default Presentation
    await test('Fetch Default Presentation (/api/presentations/ai-video-strategy)', async () => {
      const res = await fetch(`${BASE}/api/presentations/ai-video-strategy`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert(data.success === true, 'Response success is not true');
      assert(data.presentation && data.presentation.slides.length === 12, 'Expected 12 slides');
      assert(data.presentation.title === 'AI-Generated Technical Videos Strategy', 'Incorrect title');
    });

    // Test 4: AI Doubt Query (Contextual answering)
    await test('AI Doubt Query with Slide Context (/api/ai/doubt)', async () => {
      const res = await fetch(`${BASE}/api/ai/doubt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presentationId: 'ai-video-strategy',
          slideNumber: 4,
          slideTitle: 'Technical Demonstration',
          question: 'What is Clock Tree Synthesis (CTS)?'
        })
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert(data.success === true, 'Success flag false');
      assert(typeof data.answer === 'string' && data.answer.length > 20, 'Answer empty or too short');
      assert(data.slideNumber === 4, 'Slide number mismatch');
    });

    // Test 5: AI Doubt Cancellation (AbortSignal)
    await test('AI Doubt Cancellation via AbortSignal', async () => {
      const controller = new AbortController();
      const cancelPromise = fetch(`${BASE}/api/ai/doubt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presentationId: 'ai-video-strategy',
          slideNumber: 5,
          question: 'Will this be aborted immediately?'
        }),
        signal: controller.signal
      });
      controller.abort();
      try {
        await cancelPromise;
        assert(false, 'Should have thrown AbortError');
      } catch (err) {
        assert(err.name === 'AbortError', `Expected AbortError, got ${err.name}`);
      }
    });

    // Test 6: Validation - Empty question
    await test('Validation: Empty Question Rejection (HTTP 400)', async () => {
      const res = await fetch(`${BASE}/api/ai/doubt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presentationId: 'ai-video-strategy',
          slideNumber: 4,
          question: '   '
        })
      });
      assert(res.status === 400, `Expected 400, got ${res.status}`);
      const data = await res.json();
      assert(data.success === false, 'Expected success: false');
      assert(data.error.includes('empty'), 'Expected error message regarding empty question');
    });

    // Test 7: Validation - Question > 500 characters
    await test('Validation: Question Length Limit > 500 Chars (HTTP 400)', async () => {
      const longQuestion = 'a'.repeat(505);
      const res = await fetch(`${BASE}/api/ai/doubt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presentationId: 'ai-video-strategy',
          slideNumber: 1,
          question: longQuestion
        })
      });
      assert(res.status === 400, `Expected 400, got ${res.status}`);
      const data = await res.json();
      assert(data.error.includes('too long'), 'Expected error regarding question length');
    });

    // Test 8: Validation - Invalid Slide Number
    await test('Validation: Invalid Slide Number (HTTP 400)', async () => {
      const res = await fetch(`${BASE}/api/ai/doubt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presentationId: 'ai-video-strategy',
          slideNumber: -5,
          question: 'Is this invalid?'
        })
      });
      assert(res.status === 400, `Expected 400, got ${res.status}`);
    });

    // Test 9: TTS Voices List
    await test('TTS Voices Endpoint (/api/tts/voices)', async () => {
      const res = await fetch(`${BASE}/api/tts/voices`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert(data.success === true, 'Success false');
      assert(Array.isArray(data.voices) && data.voices.length >= 6, 'Expected at least 6 neural voices');
      assert(data.voices.some((v) => v.id === 'en-US-GuyNeural'), 'Missing GuyNeural voice');
    });

    // Test 10: TTS Input Validation - Empty Text
    await test('TTS Input Validation: Empty Text (HTTP 400)', async () => {
      const res = await fetch(`${BASE}/api/tts/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '' })
      });
      assert(res.status === 400, `Expected 400, got ${res.status}`);
    });

    // Test 11: TTS Input Validation - Oversized Text > 4000 Chars
    await test('TTS Input Validation: Oversized Text > 4000 Chars (HTTP 400)', async () => {
      const hugeText = 'Hello '.repeat(800); // 4800 chars
      const res = await fetch(`${BASE}/api/tts/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: hugeText })
      });
      assert(res.status === 400, `Expected 400, got ${res.status}`);
      const data = await res.json();
      assert(data.error.includes('maximum limit'), 'Expected error regarding text limit');
    });

    // Test 12: Presentation Upload Validation - Empty Payload
    await test('Presentation Upload Validation: Empty Payload (HTTP 400)', async () => {
      const res = await fetch(`${BASE}/api/presentations/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      assert(res.status === 400, `Expected 400, got ${res.status}`);
    });

    // Test 13: Presentation Ingestion via Topic Outline
    await test('Presentation Ingestion via Topic Outline (/api/presentations/upload)', async () => {
      const res = await fetch(`${BASE}/api/presentations/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle: 'Next-Gen RISC-V Neural Core Architecture',
          textContent: 'Design of vector matrix acceleration units with sub-5ns execution pipelines.'
        })
      });
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const data = await res.json();
      assert(data.success === true, 'Upload failed');
      assert(data.presentation && data.presentation.slides.length >= 4, 'Expected at least 4 slides');
      assert(data.presentation.slides[0].image.startsWith('data:image/svg+xml;base64,'), 'Slide image must be base64 SVG');
    });

    // Test 14: Custom Presentation In-Memory Store & LRU Eviction Bound
    await test('In-Memory Store Bounded Capacity (Max 50 Custom Decks)', async () => {
      for (let i = 0; i < 55; i++) {
        saveCustomPresentation({
          id: `custom-test-${i}`,
          title: `Test Deck ${i}`,
          slides: [{ slideNumber: 1, title: `Slide 1` }]
        });
      }
      // Earliest custom deck (custom-test-0) should be evicted to prevent memory leak
      const evicted = getPresentation('custom-test-0');
      assert(evicted === null, 'Oldest custom deck was not evicted');
      // Latest custom deck should exist
      const latest = getPresentation('custom-test-54');
      assert(latest !== null, 'Latest custom deck missing');
      // Default deck should still exist intact
      const defaultDeck = getPresentation('ai-video-strategy');
      assert(defaultDeck !== null && defaultDeck.slides.length === 12, 'Default deck must not be evicted');
    });

    // Test 15: Unknown API Endpoint (HTTP 404 JSON)
    await test('Unknown API Endpoint Returns 404 JSON (/api/non-existent)', async () => {
      const res = await fetch(`${BASE}/api/non-existent`);
      assert(res.status === 404, `Expected 404, got ${res.status}`);
      const data = await res.json();
      assert(data.success === false, 'Expected success: false');
    });

    // Test 16: Missing Static Asset Returns 404, Not HTML
    await test('Missing Static Asset Returns 404 Cleanly (/missing-asset.json)', async () => {
      const res = await fetch(`${BASE}/missing-asset.json`);
      assert(res.status === 404, `Expected 404, got ${res.status}`);
    });

    // Test 17: Production Client Static Index HTML
    await test('Production SPA Serves Client HTML (/)', async () => {
      const res = await fetch(`${BASE}/`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const html = await res.text();
      assert(html.includes('id="root"'), 'Root HTML element missing');
    });

    // Test 18: Production SPA Direct Route Routing (/presentation/ai-video-strategy)
    await test('Production SPA Direct URL Fallback (/presentation/ai-video-strategy)', async () => {
      const res = await fetch(`${BASE}/presentation/ai-video-strategy`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const html = await res.text();
      assert(html.includes('id="root"'), 'SPA fallback failed for direct URL');
    });

    // Test 19: Security & Gitignore Verification
    await test('Gitignore Security Audit (Root, Server, and Client ignore .env)', async () => {
      assert(fs.existsSync('./.gitignore'), 'Root .gitignore missing');
      assert(fs.existsSync('./server/.gitignore'), 'Server .gitignore missing');
      assert(fs.existsSync('./client/.gitignore'), 'Client .gitignore missing');

      const rootGitignore = fs.readFileSync('./.gitignore', 'utf8');
      const serverGitignore = fs.readFileSync('./server/.gitignore', 'utf8');
      const clientGitignore = fs.readFileSync('./client/.gitignore', 'utf8');

      assert(rootGitignore.includes('.env'), 'Root .gitignore does not ignore .env');
      assert(serverGitignore.includes('.env'), 'Server .gitignore does not ignore .env');
      assert(clientGitignore.includes('.env'), 'Client .gitignore does not ignore .env');
    });

    // Test 20: Safe Environment Templates
    await test('Safe Environment Templates (.env.example without leaked keys)', async () => {
      assert(fs.existsSync('./server/.env.example'), 'server/.env.example missing');
      assert(fs.existsSync('./.env.example'), 'root .env.example missing');

      const serverExample = fs.readFileSync('./server/.env.example', 'utf8');
      assert(serverExample.includes('GEMINI_API_KEY='), 'Missing GEMINI_API_KEY in server/.env.example');
      assert(serverExample.includes('YOUR_GEMINI_API_KEY_HERE'), 'server/.env.example must use placeholder');
      assert(!serverExample.includes('AQ.Ab8RN6ILRwl'), 'server/.env.example leaked real API key!');

      const rootExample = fs.readFileSync('./.env.example', 'utf8');
      assert(rootExample.includes('GEMINI_API_KEY='), 'Missing GEMINI_API_KEY in root .env.example');
      assert(!rootExample.includes('AQ.Ab8RN6ILRwl'), 'root .env.example leaked real API key!');
    });

    console.log(`\n=====================================================`);
    console.log(`TEST RESULTS: ${passed}/${total} TESTS PASSED`);
    console.log(`=====================================================\n`);

    if (passed === total) {
      console.log('>>> ALL VERIFICATION TESTS PASSED 100%! <<<');
    } else {
      process.exitCode = 1;
    }
  } finally {
    if (server) {
      server.close(() => {
        process.exit(passed === total ? 0 : 1);
      });
    } else {
      process.exit(passed === total ? 0 : 1);
    }
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
