# Testing Guide

This project includes comprehensive unit and integration tests to ensure code quality and maintainability.

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Test Coverage
```bash
npm run test:coverage
```

### Interactive UI
```bash
npm run test:ui
```

## Test Structure

```
tests/
├── setup.ts              # Test setup and configuration
├── unit/                 # Unit tests
│   └── markdown.test.ts  # Markdown conversion tests
└── integration/          # Integration tests
    └── api.test.ts       # API endpoint tests
```

## Unit Tests

Unit tests focus on individual functions and modules in isolation:

- **Markdown Conversion** (`tests/unit/markdown.test.ts`)
  - Basic markdown to HTML conversion
  - Headings, lists, tables
  - Code blocks with syntax highlighting
  - Links and images
  - HTML sanitization (XSS prevention)

## Integration Tests

Integration tests verify API endpoints work correctly end-to-end:

- **POST /api/convert** (`tests/integration/api.test.ts`)
  - Download action (returns PDF)
  - View action (inline PDF)
  - Share action (returns shareable URL)
  - Different page sizes and orientations
  - Theme and template variations
  - Error handling (missing markdown, invalid action)
  - Content size validation
  
- **GET /api/pdf/:id**
  - Retrieve shared PDFs
  - 404 for non-existent PDFs

- **POST /api/upload-md**
  - File upload handling
  - Error handling

## Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../../path/to/module';

describe('MyFunction', () => {
  it('should do something specific', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';

describe('My API Endpoint', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    registerRoutes(app);
  });

  it('should return 200 OK', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Clear Descriptions**: Use descriptive test names that explain what is being tested
3. **Arrange-Act-Assert**: Structure tests with setup, execution, and verification
4. **Coverage**: Aim for high code coverage, especially for critical paths
5. **Edge Cases**: Test boundary conditions and error scenarios
6. **Fast Tests**: Keep tests fast by mocking external dependencies

## CI/CD Integration

Tests run automatically on every push and pull request via GitHub Actions:

1. Lint check (TypeScript type checking)
2. Unit tests
3. Integration tests
4. Build verification

See `.github/workflows/ci.yml` for the complete CI pipeline configuration.

## Debugging Tests

### Run specific test file
```bash
npx vitest tests/unit/markdown.test.ts
```

### Run tests matching a pattern
```bash
npx vitest -t "convert markdown"
```

### Debug mode
```bash
npx vitest --inspect-brk
```

## Test Configuration

Test configuration is in `vitest.config.ts`:

- **Environment**: happy-dom (lightweight DOM implementation)
- **Setup files**: `tests/setup.ts`
- **Coverage provider**: v8
- **Aliases**: Configured to match project structure (@, @shared)

## Coverage Reports

After running `npm run test:coverage`, view the HTML report:

```bash
open coverage/index.html
```

Coverage reports show:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage
