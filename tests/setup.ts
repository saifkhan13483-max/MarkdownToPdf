import { beforeAll, afterAll, afterEach } from 'vitest';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  // Clean up after each test
});

afterAll(() => {
  // Global cleanup
});
