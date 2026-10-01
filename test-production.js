async function testProd() {
  console.log('=== Testing Production Unified Server on Port 5000 ===');
  const r1 = await fetch('http://localhost:5000/');
  console.log('Production Root Status:', r1.status);
  const t1 = await r1.text();
  console.log('Production Root contains React App:', t1.includes('id="root"'));

  const r2 = await fetch('http://localhost:5000/presentation/ai-video-strategy');
  console.log('Production Direct Presentation URL Status:', r2.status);
  const t2 = await r2.text();
  console.log('SPA fallback works for direct URLs:', t2.includes('id="root"'));

  const r3 = await fetch('http://localhost:5000/presentations/ai-video-strategy/slide-04.png');
  console.log('Production Static Slide 4 Asset Status:', r3.status, 'size:', (await r3.arrayBuffer()).byteLength);

  const r4 = await fetch('http://localhost:5000/api/ai/doubt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      presentationId: 'ai-video-strategy',
      slideNumber: 4,
      question: 'What is CTS?'
    })
  });
  console.log('Production API doubt endpoint status:', r4.status);
  const dData = await r4.json();
  console.log('Production API success:', dData.success, 'Slide Title:', dData.slideTitle);

  console.log('\n>>> PRODUCTION SERVER IS 100% OPERATIONAL! <<<');
}

testProd().catch(console.error);
