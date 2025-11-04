# Markdown to PDF Converter

## Overview

This web-based application allows users to convert Markdown content into professionally formatted PDF documents. It features a split-pane interface with real-time preview, designed with a focus on clarity, efficiency, and a minimal aesthetic inspired by productivity tools like Linear and Notion. The project aims to provide a robust, deployable, and user-friendly tool for high-quality document generation from Markdown input.

**Maintainability Status:** Fully implemented with comprehensive testing, CI/CD pipeline, and monitoring (November 2025)

## Configuration & Environment Variables

### Analytics Configuration
- **VITE_PLAUSIBLE_ENABLED**: Set to `true` to enable Plausible Analytics tracking (default: disabled)
- **VITE_PLAUSIBLE_DOMAIN**: Optional domain for Plausible (defaults to `window.location.hostname`)

### Admin Access
- **ADMIN_API_KEY**: Required to access the feedback retrieval endpoint
  - Usage: `GET /api/feedback?key=YOUR_ADMIN_API_KEY`
  - Store securely and never commit to version control
  - If not set, the feedback endpoint returns 401 Unauthorized

## User Preferences

Preferred communication style: Simple, everyday language.

## Testing & Quality Assurance

### Test Coverage

- **Unit Tests** (16 tests): Comprehensive markdown → HTML conversion testing
  - Tests all markdown features (headings, lists, code blocks, tables, links, images)
  - All tests pass in all environments
  
- **Integration Tests** (16 tests): Full API endpoint testing
  - PDF generation tests (10): download/view/share actions, themes, templates, page sizes, orientations
  - Validation tests (6): Input validation, error handling, 404 responses
  - Opt-in skip mechanism for environments where Puppeteer cannot run

### CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push:
1. **Linting**: ESLint code quality checks
2. **Unit Tests**: All 16 markdown conversion tests
3. **Integration Tests**: All 16 API tests with Chrome/Puppeteer fully working
4. **Build**: TypeScript compilation and Vite build
5. **Chrome Setup**: Automatically installs dependencies for PDF generation testing

### Test Execution Options

**1. Full Test Suite (CI default)**
- Runs all 32 tests including PDF generation
- Requires Chrome/Chromium installed
- Command: `npm run test`

**2. Skip PDF Tests (Replit/constrained environments)**
- Runs 22 tests, skips 10 PDF generation tests
- Validation and error handling tests still run
- Command: `SKIP_PDF_TESTS=true npm run test:integration`

**3. Unit Tests Only**
- Runs 16 markdown conversion tests
- No Chrome required
- Command: `npm run test:unit`

## System Architecture

### Frontend Architecture

The frontend is a React 18 application built with TypeScript, utilizing Vite for fast development and optimized builds. Wouter handles client-side routing, while Tailwind CSS provides a custom design system. UI components are built using Radix UI primitives with the shadcn/ui library, following a "new-york" theme. Typography uses Inter for UI and JetBrains Mono for code. The architecture emphasizes a single-page application design with a split-pane workspace for real-time Markdown preview using `markdown-it`.

### Backend Architecture

The backend is built with Node.js and Express.js, primarily responsible for PDF generation via Puppeteer (headless Chrome). It exposes a `/api/convert` endpoint that supports `download`, `view`, and `share` actions, and a `/api/pdf/:id` endpoint for retrieving shared PDFs. Key architectural decisions include:
- **Multi-action Conversion**: Flexible PDF output options.
- **Request Validation**: Zod for type-safe API contracts.
- **Security**: 2MB size limits, filename sanitization, HTML sanitization using DOMPurify, and IP-based rate limiting (10 conversions/minute).
- **Performance**: Singleton Puppeteer browser instance caching.
- **PDF Templates**: Supports "Minimal" and "Professional" templates with print-specific CSS and dynamic placeholders for content, title, date, and page numbers.

### Data Storage Solutions

The application primarily operates as a stateless utility. Generated PDFs for shareable links are stored in an in-memory system (`MemStorage`) with a 1-hour expiration and automatic cleanup. While Drizzle ORM and PostgreSQL (via Neon Database) are configured, they are not actively used in the current stateless MVP but are in place for future features.

### Authentication and Authorization

No authentication or authorization is currently implemented. The application is designed as a public utility tool, prioritizing ease of access. Infrastructure for Express sessions exists but is not utilized.

## External Dependencies

### Third-Party Services

- **Google Fonts**: Used for "Inter" and "JetBrains Mono" font families.
- **Neon Database**: Serverless PostgreSQL provider, configured but not actively used.
- **Plausible Analytics**: Privacy-friendly usage tracking (optional, configurable via environment variables).

### Key Libraries

- **markdown-it**: Markdown parser and renderer.
- **Puppeteer**: Headless Chrome for high-fidelity HTML-to-PDF conversion. Requires specific system dependencies for Chromium.
- **Zod**: Runtime type validation.
- **TanStack React Query**: Server state management and caching.
- **Radix UI / shadcn/ui**: Accessible UI component primitives and pre-styled components.
- **Tailwind CSS**: Utility-first CSS framework.
- **@sparticuz/chromium**: Used for serverless Puppeteer deployments.

### System Dependencies

Puppeteer/Chromium requires several system libraries, including `glib`, `nss`, `gtk3`, `X11 libraries`, `mesa`, and `alsa-lib`.

### Development Tools

- **Vite**: Build tool.
- **tsx**: TypeScript execution.
- **Vitest**: Testing framework.
- **Supertest**: HTTP integration testing.
- **GitHub Actions**: CI/CD pipeline for linting, testing, and build verification.
- **ESLint**: Code linting.
- **Sentry**: Optional error tracking.