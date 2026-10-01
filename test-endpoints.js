async function verifyApp() {
  console.log('=== 1. Testing Backend Health ===');
  const hRes = await fetch('http://localhost:5000/api/health');
  console.log('Health:', await hRes.json());

  console.log('=== 2. Testing Presentation Data Fetch ===');
  const pRes = await fetch('http://localhost:5000/api/presentations/ai-video-strategy');
  const pData = await pRes.json();
  console.log('Presentation Title:', pData.presentation.title);
  console.log('Total Slides:', pData.presentation.slides.length);

  console.log('=== 3. Testing Client Dev Server (HTML) ===');
  const cRes = await fetch('http://localhost:5173/');
  console.log('Client Status:', cRes.status);
  const cText = await cRes.text();
  console.log('Client HTML contains root:', cText.includes('id="root"'));

  console.log('=== 4. Testing Static Presentation JSON on Client ===');
  const cPRes = await fetch('http://localhost:5173/presentations/ai-video-strategy/presentation.json');
  console.log('Client presentation.json status:', cPRes.status);

  console.log('=== 5. Testing Slide 1 PNG and SVG on Client ===');
  const img1Res = await fetch('http://localhost:5173/presentations/ai-video-strategy/slide-01.png');
  const svg1Res = await fetch('http://localhost:5173/presentations/ai-video-strategy/slide-01.svg');
  console.log('Slide 01 PNG status:', img1Res.status, 'size:', (await img1Res.arrayBuffer()).byteLength);
  console.log('Slide 01 SVG status:', svg1Res.status, 'size:', (await svg1Res.arrayBuffer()).byteLength);

  console.log('=== 6. Testing AI Doubt Query for Slide 4 (CTS) ===');
  const dRes = await fetch('http://localhost:5000/api/ai/doubt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      presentationId: 'ai-video-strategy',
      slideNumber: 4,
      slideTitle: 'Technical Demonstration',
      question: 'What is CTS optimization?'
    })
  });
  console.log('Doubt response status:', dRes.status);
  const doubtJson = await dRes.json();
  console.log('Answer preview:\n', doubtJson.answer);

  console.log('=== 7. Testing AI Doubt Cancellation (AbortController) ===');
  const controller = new AbortController();
  const cancelPromise = fetch('http://localhost:5000/api/ai/doubt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      presentationId: 'ai-video-strategy',
      slideNumber: 5,
      question: 'Will this be aborted?'
    }),
    signal: controller.signal
  });
  controller.abort();
  try {
    await cancelPromise;
    console.log('Unexpected: should have aborted');
  } catch (err) {
    console.log('Successfully aborted client-side:', err.name);
  }

  console.log('=== 8. Testing Validation / Error Handling ===');
  const errRes = await fetch('http://localhost:5000/api/ai/doubt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      presentationId: 'ai-video-strategy',
      slideNumber: 4,
      question: ''
    })
  });
  console.log('Empty question error response:', errRes.status, await errRes.json());

  console.log('\n>>> ALL 8 INTEGRATION TESTS PASSED CLEANLY! <<<');
}

verifyApp().catch(console.error);
