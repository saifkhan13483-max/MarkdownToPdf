# Markdown to PDF Converter

## Overview

This is a web-based Markdown to PDF converter application that allows users to write or upload Markdown content and convert it to professionally formatted PDF documents. The application features a split-pane interface with real-time preview, built using modern web technologies with a focus on clean design and user experience.

The application follows a Linear/Notion-inspired productivity design system, emphasizing clarity, efficiency, and minimal visual interference to let users focus on their content.

## Recent Changes

**November 4, 2025:**
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
- **Stateless conversion**: POST `/api/convert` endpoint accepts markdown and returns PDF blob
- **Request validation**: Zod schema validation for type-safe API contracts
- **Size limits**: 10MB request body limit to prevent abuse
- **Browser caching**: Singleton Puppeteer browser instance for performance

**Conversion Pipeline:**
1. Markdown input validated against schema
2. Markdown rendered to HTML using markdown-it
3. HTML wrapped in styled document template
4. Puppeteer generates PDF from HTML
5. PDF returned as downloadable blob

### Data Storage Solutions

**Current Implementation:**
- **In-memory storage**: MemStorage class providing storage interface
- **Stateless operations**: No persistence required for MVP
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