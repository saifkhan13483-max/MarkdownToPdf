# Markdown to PDF Converter

## Overview

This is a web-based Markdown to PDF converter application that allows users to write or upload Markdown content and convert it to professionally formatted PDF documents. The application features a split-pane interface with real-time preview, built using modern web technologies with a focus on clean design and user experience.

The application follows a Linear/Notion-inspired productivity design system, emphasizing clarity, efficiency, and minimal visual interference to let users focus on their content.

## Recent Changes

**November 4, 2025 (Latest - Security Features):**
- Implemented comprehensive rate limiting to prevent API abuse:
  - 10 conversions per IP per minute on `/api/convert` endpoint
  - 100 requests per IP per minute on all `/api/*` endpoints
  - Optional API key bypass for trusted clients
- Reduced file size limits from 10MB to 2MB for security
- Added server-side HTML sanitization using DOMPurify before Puppeteer rendering
- Implemented filename sanitization to prevent directory traversal attacks
- Created middleware/rateLimit.ts for rate limiting logic
- Created middleware/sanitize.ts for HTML sanitization and validation
- Added environment variable support for configurable security limits
- Created comprehensive security documentation in SECURITY.md
- All security features tested and verified working

**November 4, 2025 (Accessibility & Mobile Improvements):**
- Added ARIA labels and enhanced keyboard accessibility throughout
- Implemented skip-to-content link for keyboard navigation
- Made layout fully responsive with mobile-first design
- Added accordion-based options panel for mobile devices
- Improved button layouts with responsive text and wrapping
- Enhanced focus states for all interactive elements
- Improved color contrast and font sizes for readability
- All changes verified to meet WCAG 2.1 AA standards

**November 4, 2025 (Earlier):**
- Implemented three PDF generation flows: Download, Open in New Tab, and Get Shareable Link
- Added in-memory PDF storage system with 1-hour expiration for shareable links
- Created GET `/api/pdf/:id` endpoint to serve stored PDFs
- Updated `/api/convert` endpoint to support action parameter (download, view, share)
- Enhanced UI with three distinct action buttons in the ActionBar
- Implemented clipboard fallback for shareable links when clipboard access is denied
- Added proper cleanup interval management with unref() to prevent process hanging
- Shareable links automatically expire after 1 hour with periodic cleanup

**November 4, 2025 (Earlier):**
- Added progress modal with spinner and cancel functionality for PDF generation
- Implemented AbortController to allow users to cancel ongoing conversions
- Enhanced error handling with clear, user-friendly messages for different scenarios
- Added proper cleanup on component unmount to prevent memory leaks
- Improved toast notification system for success, error, and cancellation states
- Modal prevents accidental dismissal during conversion process
- Convert button properly disabled during active conversions

**November 4, 2025 (Earlier):**
- Added professional PDF templates with print-specific CSS
- Created two template options: Minimal (clean pages with page numbers) and Professional (headers with title/date + footers with page numbers)
- Implemented @page CSS rules for proper page breaks, margins, and headers/footers
- Added code block page-break controls to prevent awkward splitting across pages
- Created styles/print.css with comprehensive print media rules
- Updated schema to include template selection option
- Enhanced OptionsPanel with template selector dropdown
- Configured Puppeteer to support displayHeaderFooter for professional template
- Templates use dynamic placeholders for title, date, content, and styling

**November 4, 2025 (Earlier):**
- Implemented complete PDF conversion pipeline using Puppeteer
- Added browser instance caching for improved performance
- Installed required system dependencies for Chromium in NixOS environment
- Implemented comprehensive error handling with user-friendly toast notifications
- Added 10MB request size limit to prevent abuse
- Configured graceful shutdown handlers for browser cleanup
- Successfully tested end-to-end conversion flow with sample documents
- Application is fully functional and production-ready

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack React Query for server state management

**Design System:**
- Typography: Inter font for UI elements, JetBrains Mono for code/markdown
- Spacing primitives: Tailwind units (2, 4, 6, 8, 12)
- Component library: Custom-styled Radix UI components following the "new-york" shadcn variant
- Theme support: Light/dark mode with CSS variables and local storage persistence
- Border radius system: Custom values (9px, 6px, 3px)

**Key Architectural Decisions:**
- **Single-page application**: No sidebar navigation, focused workflow on one screen
- **Split-pane workspace**: Two-column layout on desktop (editor left, preview right), stacked on mobile
- **Component composition**: Modular React components with clear separation of concerns
- **Type safety**: Full TypeScript coverage with path aliases for clean imports (@/, @shared/)
- **Real-time rendering**: Live markdown preview using markdown-it library

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for HTTP server
- **PDF Generation**: Puppeteer (headless Chrome) for HTML-to-PDF conversion
- **Development Server**: Vite integration with HMR middleware

**API Design:**
- **Multi-action conversion**: POST `/api/convert` endpoint supports three actions:
  - `download`: Returns PDF as attachment for direct download
  - `view`: Returns PDF as inline content for viewing in new tab via blob URL
  - `share`: Stores PDF in-memory and returns shareable URL (1-hour expiration)
- **PDF retrieval**: GET `/api/pdf/:id` serves stored PDFs by ID
- **Request validation**: Zod schema validation for type-safe API contracts
- **Size limits**: 2MB request body, file, and content limits for security
- **Browser caching**: Singleton Puppeteer browser instance for performance
- **Rate limiting**: IP-based rate limiting with configurable thresholds
- **HTML sanitization**: Server-side XSS prevention using DOMPurify
- **Security middleware**: Dedicated middleware for rate limiting and sanitization

**PDF Templates:**
- **Minimal Template**: Clean pages with centered page numbers at the bottom
- **Professional Template**: Headers with document title and date, footers with page numbers ("Page X of Y")
- **Print CSS**: Dedicated stylesheet (styles/print.css) with @page rules, page-break controls, and code block handling
- **Template System**: HTML templates with dynamic placeholders for content, styling, and metadata

**Conversion Pipeline:**
1. Request passes through rate limiting middleware (10 req/min per IP)
2. Markdown input validated against schema (including template selection)
3. Content size validation (2MB max)
4. Filename sanitization to prevent directory traversal
5. Markdown rendered to HTML using markdown-it
6. **HTML sanitization** to remove scripts, iframes, and malicious content
7. Template loaded (minimal.html or professional.html) from templates folder
8. Print CSS and theme styles injected into template
9. Placeholders replaced with actual content, title, date, margins, and page settings
10. Puppeteer generates PDF with displayHeaderFooter for professional template
11. PDF returned as downloadable blob with proper page numbers and formatting

### Data Storage Solutions

**Current Implementation:**
- **In-memory PDF storage**: MemStorage class stores generated PDFs for shareable links
  - 1-hour expiration policy for all stored PDFs
  - Automatic cleanup every 5 minutes to remove expired entries
  - Random ID generation for security (format: `pdf_{timestamp}_{random}`)
  - Interval timer properly unref'd to prevent process hanging
- **Stateless conversion**: Direct download and view actions remain stateless
- **Session management**: Infrastructure in place (connect-pg-simple) but not actively used

**Database Configuration:**
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema location**: `shared/schema.ts`
- **Migrations**: Generated to `./migrations` directory
- **Future-ready**: Database URL environment variable expected but not currently utilized

**Rationale**: The application is designed as a stateless utility tool. Conversions happen in real-time without storing user data. The database infrastructure exists for potential future features like conversion history, user accounts, or template storage.

### Authentication and Authorization

**Current State**: No authentication implemented. The application is a public utility tool.

**Infrastructure Present**:
- Express session middleware configuration ready
- Session storage backend (connect-pg-simple) available
- No user management or protected routes in current implementation

**Design Decision**: Authentication deliberately omitted for MVP to reduce friction. Users can immediately use the tool without signup. Future versions could add optional accounts for features like saved templates or conversion history.

### External Dependencies

**Third-Party Services:**
- **Google Fonts**: Inter and JetBrains Mono font families loaded from Google Fonts CDN
- **Neon Database**: PostgreSQL serverless database provider (@neondatabase/serverless)
  - Currently configured but not actively used in stateless MVP
  - Connection via DATABASE_URL environment variable

**Key Libraries:**
- **markdown-it**: Markdown parser and renderer with HTML support, auto-linking, and typography enhancements
- **Puppeteer**: Headless Chrome automation for PDF generation
  - Launched with sandbox disabled for containerized environments
  - Browser instance cached and reused for performance
  - Additional flags: --disable-dev-shm-usage, --disable-gpu for stability
  - Requires system dependencies: glib, nss, gtk3, X11 libraries, mesa, alsa-lib
- **Zod**: Runtime type validation and schema definition
- **TanStack React Query**: Server state management and caching
- **Radix UI**: Unstyled, accessible component primitives (20+ components)
- **shadcn/ui**: Pre-styled component patterns built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework with custom configuration

**System Dependencies:**
The application requires the following NixOS packages for Puppeteer/Chromium:
- glib, nss, nspr, atk, at-spi2-atk
- cups, dbus, libdrm, gtk3, pango, cairo
- xorg.libX11, xorg.libXcomposite, xorg.libXdamage, xorg.libXext, xorg.libXfixes, xorg.libXrandr, xorg.libxcb
- libxkbcommon, expat, mesa, alsa-lib

**Development Tools:**
- **Replit-specific plugins**: Runtime error overlay, cartographer, dev banner
- **esbuild**: Server-side bundling for production
- **tsx**: TypeScript execution for development server

**Design Rationale**:
- Puppeteer chosen over lighter PDF libraries to ensure high-fidelity rendering of complex markdown with styling
- markdown-it selected for its extensibility and active maintenance
- Radix UI provides accessibility out-of-box while maintaining full styling control
- Serverless PostgreSQL (Neon) ready for future features without infrastructure management