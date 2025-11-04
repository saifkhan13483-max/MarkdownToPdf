/**
 * Test HTML sanitization to ensure XSS prevention
 * Run with: tsx server/test/sanitization.test.ts
 */

import { sanitizeHtml } from '../middleware/sanitize';

console.log('Testing HTML Sanitization\n');
console.log('='.repeat(60));

const tests = [
  {
    name: 'Script tag removal',
    input: '<p>Hello</p><script>alert("XSS")</script><p>World</p>',
    shouldContain: '<p>Hello</p>',
    shouldNotContain: '<script>',
  },
  {
    name: 'Event handler removal',
    input: '<img src="x" onerror="alert(\'XSS\')" />',
    shouldNotContain: 'onerror',
  },
  {
    name: 'Iframe removal',
    input: '<p>Safe content</p><iframe src="evil.com"></iframe>',
    shouldContain: '<p>Safe content</p>',
    shouldNotContain: '<iframe',
  },
  {
    name: 'JavaScript protocol removal',
    input: '<a href="javascript:alert(\'XSS\')">Click me</a>',
    shouldNotContain: 'javascript:',
  },
  {
    name: 'Safe HTML preservation',
    input: '<h1>Title</h1><p>Paragraph with <strong>bold</strong> and <em>italic</em></p><code>code</code>',
    shouldContain: '<h1>Title</h1>',
  },
  {
    name: 'Link preservation',
    input: '<a href="https://example.com">Safe Link</a>',
    shouldContain: 'https://example.com',
  },
  {
    name: 'Code block preservation',
    input: '<pre><code>const x = 5;</code></pre>',
    shouldContain: '<pre><code>const x = 5;</code></pre>',
  },
  {
    name: 'Style tag removal',
    input: '<style>body { background: red; }</style><p>Content</p>',
    shouldNotContain: '<style>',
    shouldContain: '<p>Content</p>',
  },
  {
    name: 'Form elements removal',
    input: '<form><input type="text" /><button>Submit</button></form>',
    shouldNotContain: '<form>',
    shouldNotContain: '<input',
    shouldNotContain: '<button>',
  },
];

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
  console.log(`\nTest ${index + 1}: ${test.name}`);
  console.log('-'.repeat(60));
  console.log(`Input:  ${test.input}`);
  
  const result = sanitizeHtml(test.input);
  console.log(`Output: ${result}`);
  
  let testPassed = true;
  
  if (test.shouldContain && !result.includes(test.shouldContain)) {
    console.log(`❌ FAILED: Expected to contain "${test.shouldContain}"`);
    testPassed = false;
  }
  
  if (test.shouldNotContain && result.includes(test.shouldNotContain)) {
    console.log(`❌ FAILED: Should not contain "${test.shouldNotContain}"`);
    testPassed = false;
  }
  
  if (testPassed) {
    console.log('✅ PASSED');
    passed++;
  } else {
    failed++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`\nTest Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('✅ All sanitization tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some sanitization tests failed');
  process.exit(1);
}
