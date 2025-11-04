/**
 * Simple manual test script for rate limiting
 * Run with: tsx server/test/rate-limit.test.ts
 * 
 * This will send multiple requests to test the rate limiter
 */

async function testRateLimit() {
  const API_URL = 'http://localhost:5000/api/convert';
  const testMarkdown = '# Test Document\n\nThis is a test.';
  
  console.log('Testing rate limiting...\n');
  console.log(`Sending requests to ${API_URL}`);
  console.log('Rate limit: 10 requests per minute\n');

  const results = {
    success: 0,
    rateLimited: 0,
    errors: 0,
  };

  // Send 15 requests rapidly to trigger rate limit
  for (let i = 1; i <= 15; i++) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markdown: testMarkdown,
          filename: `test-${i}`,
          options: {
            pageSize: 'A4',
            orientation: 'portrait',
            margin: 20,
            theme: 'light',
            template: 'minimal',
          },
          action: 'download',
        }),
      });

      if (response.status === 429) {
        const data = await response.json();
        console.log(`Request ${i}: ❌ RATE LIMITED (${response.status})`);
        console.log(`  Message: ${data.message}`);
        results.rateLimited++;
      } else if (response.ok) {
        console.log(`Request ${i}: ✅ SUCCESS (${response.status})`);
        results.success++;
      } else {
        console.log(`Request ${i}: ⚠️  ERROR (${response.status})`);
        results.errors++;
      }
    } catch (error) {
      console.log(`Request ${i}: ❌ FAILED (${error instanceof Error ? error.message : 'Unknown error'})`);
      results.errors++;
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n=== Test Results ===');
  console.log(`Successful requests: ${results.success}`);
  console.log(`Rate limited requests: ${results.rateLimited}`);
  console.log(`Error requests: ${results.errors}`);
  console.log('\nExpected: ~10 successful, ~5 rate limited');
  
  if (results.rateLimited > 0) {
    console.log('\n✅ Rate limiting is working correctly!');
  } else {
    console.log('\n❌ Rate limiting may not be configured properly');
  }
}

// Run test
testRateLimit().catch(console.error);
