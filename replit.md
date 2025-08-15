# replit.md

## Overview
freedevtool.app is a web-based collection of 49+ open-source, free, and completely offline developer tools. It offers a wide range of utilities including converters, formatters, encoders, text tools, timing utilities, financial calculators, hardware tests, and generators. Designed with privacy in mind, all processing occurs locally without network dependencies, making it suitable for sensitive business environments and air-gapped systems.

## User Preferences
Preferred communication style: Simple, everyday language.
Theme preferences: Smooth theme transitions with local storage persistence, respecting browser/OS theme selection by default, falling back to light mode when system preference unavailable.
Timezone behavior: All time-related tools should default to the user's local timezone instead of UTC for better user experience.

## System Architecture

### Frontend Architecture
The client-side application is built with React and TypeScript, leveraging a modern component-based architecture. It uses shadcn/ui components (based on Radix UI) for consistent design and Tailwind CSS for styling. It supports both light and dark themes with system preference detection.

**Key Frontend Decisions:**
- **Routing**: `wouter` for lightweight client-side routing.
- **State Management**: React's built-in hooks (`useState`, `useEffect`).
- **UI Components**: Radix UI primitives with shadcn/ui.
- **Styling**: Tailwind CSS with custom CSS variables for theming, 0.3s transitions, and local storage persistence.
- **Code Editor**: Custom CodeEditor component with syntax highlighting and copy functionality. Enhanced textarea components are standardized across all 42+ tools, providing line numbers, character count, cursor position display, and disabled word wrapping.
- **Navigation**: Hamburger menu in top right, no desktop sidebar, non-modal design. Blue FD logo toggles sidebar, text logo links to homepage.

### Backend Architecture
The server-side is a minimal Node.js Express application with TypeScript, providing a basic REST API foundation for future development. It is intentionally lightweight as the application primarily focuses on client-side processing.

**Key Backend Decisions:**
- **Framework**: Express.js for simplicity.
- **Development**: Vite integration for HMR.
- **Error Handling**: Basic middleware for logging and structured responses.

### Data Storage Solutions
Currently uses in-memory storage, but is architecturally prepared for PostgreSQL integration via Drizzle ORM for type-safe database operations.

**Storage Architecture:**
- **Current**: In-memory storage with Map-based implementation.
- **Future-Ready**: Drizzle ORM configured for PostgreSQL.
- **Type Safety**: Full TypeScript integration with Zod schema validation.

### Authentication and Authorization
A basic user schema and session management foundation is prepared but not yet implemented. The application currently operates without authentication as all tools function offline.

### Key Technical Implementations

**Offline-First Design:**
- All external dependencies replaced with local JavaScript libraries.
- Content Security Policy prevents external resource loading.
- System fonts used exclusively.

**Tool Architecture:**
- Unified tool layout with consistent error handling and validation.
- URL sharing for state persistence.
- Demo system with automated tours, pause/resume, and 4 speed options (Slow, Normal, Fast, Very Fast).
- Comprehensive time tools: Universal keyboard shortcuts (Enter, Space, Escape), auto-start with engaging defaults, contextual quick-access buttons, and maximum precision.
- Date converter redesigned with 20 practical, internationally recognized formats categorized for enhanced UX, including auto-detection of input formats.
- Enhanced RichTextarea component: Word wrap enabled by default with toggle, copy functionality, line numbers (no-wrap mode only), adjustable sizing, and integrated controls bar.

**Performance Optimizations:**
- Debounced input handling.
- Lazy loading of tool components.
- Minimal JavaScript bundle with tree shaking.
- Browser caching (`Cache-Control: public, max-age=86400, must-revalidate`) for HTML routes.

**Testing Strategy:**
- End-to-end tests with Playwright.
- CI/CD pipeline includes comprehensive testing.

**Security Features:**
- Content Security Policy enforcing local-only resources.
- Input validation and sanitization.
- No telemetry or tracking.

## CI/CD and Release Management

**GitHub Actions Workflows:**
- **CI Pipeline**: Automated testing, type checking, and build validation on every PR and main branch push.
- **Release Workflow**: Automated building, packaging, and GitHub release creation with changelog generation from merged PRs.

**Release Process:**
- Manual release preparation with `scripts/prepare-release.sh`
- Automated changelog generation from PR merge commits
- Cross-platform distribution packages (tar.gz, zip)
- Semantic versioning with git tag automation

## External Dependencies

### Core Framework Dependencies
- **React 18+**: UI component library.
- **TypeScript**: Type safety.
- **Vite**: Build tool and development server.
- **Express.js**: Backend API foundation.
- **Tailwind CSS**: Styling framework.

### UI Component Libraries
- **Radix UI**: Accessible primitive components.
- **shadcn/ui**: Component library based on Radix UI.
- **Lucide React**: Icon library.
- **cmdk**: Command palette functionality.

### Development and Build Tools
- **ESLint**: Code linting.
- **PostCSS**: CSS processing.
- **tsx**: TypeScript execution.
- **esbuild**: JavaScript bundler.

### Database and ORM (Prepared)
- **Drizzle ORM**: Type-safe database operations.
- **@neondatabase/serverless**: PostgreSQL adapter.
- **Drizzle Kit**: Database migration and schema management.

### Utility Libraries
- **wouter**: Lightweight client-side routing.
- **js-yaml**: YAML parsing/serialization.
- **clsx + tailwind-merge**: Conditional CSS class composition.
- **react-hook-form**: Form handling.
- **@tanstack/react-query**: Server state management (prepared).