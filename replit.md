# replit.md

## Overview
 is a web-based collection of 49+ open-source, free, and completely offline developer tools. It offers a wide range of utilities including converters, formatters, encoders, text tools, timing utilities, financial calculators, hardware tests, and generators. Designed with privacy in mind, all processing occurs locally without network dependencies, making it suitable for sensitive business environments and air-gapped systems.

## User Preferences
Preferred communication style: Simple, everyday language.
Theme preferences: Smooth theme transitions with local storage persistence, respecting browser/OS theme selection by default, falling back to light mode when system preference unavailable.
Timezone behavior: All time-related tools should default to the user's local timezone instead of UTC for better user experience.
Build system preferences: Use make targets instead of npm commands for all development, testing, and release operations (e.g., `make deps` instead of `npm install`, `make start` instead of `npm run dev`).

## System Architecture

### Frontend Architecture
The client-side application is built with React and TypeScript, leveraging a modern component-based architecture. It uses shadcn/ui components (based on Radix UI) for consistent design and Tailwind CSS for styling. It supports both light and dark themes with system preference detection.

**Key Frontend Decisions:**
- **Routing**: `wouter` for lightweight client-side routing.
- **State Management**: React's built-in hooks (`useState`, `useEffect`).
- **UI Components**: Radix UI primitives with shadcn/ui.
- **Styling**: Tailwind CSS with custom CSS variables for theming, 0.3s transitions, and local storage persistence.
- **Code Editor**: Simple CodeEditor component with copy functionality. Standardized textarea components across all tools provide character count and disabled word wrapping for consistent user experience.
- **Navigation**: Hamburger menu in top right, no desktop sidebar, non-modal design. Blue FD logo toggles sidebar, text logo links to homepage.

### Backend Architecture
The server-side is a minimal Node.js Express application with TypeScript, providing a basic REST API foundation for future development. It is intentionally lightweight as the application primarily focuses on client-side processing.

**Key Backend Decisions:**
- **Framework**: Express.js for simplicity.
- **Development**: Vite integration for HMR.
- **Error Handling**: Basic middleware for logging and structured responses.

### Data Storage Solutions
The application operates entirely client-side without persistent data storage, focusing on real-time tool computations and browser-based processing.

**Storage Architecture:**
- **Client-Side Only**: All data processing occurs in the browser with no server persistence.
- **Privacy-First**: No data transmitted to servers, ensuring complete privacy and security.
- **Offline Capability**: Full functionality without network dependencies.

### Authentication and Authorization
The application operates without authentication requirements as all tools function offline and require no user accounts or data persistence.

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
- Optimized JavaScript bundle (1.3MB, 352KB gzipped) with tree shaking and unused dependency removal.
- Browser caching (`Cache-Control: public, max-age=86400, must-revalidate`) for HTML routes.
- Removed 16+ unused UI libraries including CodeMirror, carousel, input-otp, drawer components for smaller bundle size.

**Testing Strategy:**
- Individual end-to-end test files for each of the 45+ tools in the application (`tests/e2e/tools/`).
- Each tool has dedicated test coverage verifying page loads without JavaScript/CSS errors.
- Isolated test failures allow precise identification of broken tools during development.
- Theme toggle functionality validation with proper state persistence across navigation.
- Demo functionality testing to ensure interactive tours work properly across tools.
- Search and navigation testing to verify tool discovery and routing functionality.
- Robust e2e tests using proper wait conditions instead of fixed timeouts to prevent flaky tests.
- Tests use `page.waitForFunction()` to wait for actual DOM changes rather than arbitrary delays.
- Automated test generation script for creating new tool tests (`scripts/generate-tool-tests.js`).
- CI/CD pipeline includes comprehensive testing with 146 unit tests and full e2e validation.

**Security Features:**
- Content Security Policy enforcing local-only resources.
- Input validation and sanitization.
- No telemetry or tracking.

## CI/CD and Release Management

**GitHub Actions Workflows:**
- **CI Pipeline**: Automated testing, type checking, and build validation on every PR and main branch push.
- **Release Workflow**: Automated building, packaging, and GitHub release creation with changelog generation from merged PRs.
- **CI Dependency**: Release workflow requires CI to pass before allowing releases, ensuring quality control.
- **GitHub Pages Deployment**: Each release deploys the same gzip package to GitHub Pages as a standalone web application.

**Release Process:**
- **Automatic**: Push git tags (e.g., `v1.0.0`) trigger releases after CI validation
- **Manual**: GitHub Actions workflow dispatch with CI status verification
- **Emergency Bypass**: Manual releases can bypass CI requirement if needed (creates prerelease with warning)
- **Unified Build & Deploy**: Single workflow builds application and deploys identical files to both GitHub Releases and GitHub Pages
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



### Utility Libraries
- **wouter**: Lightweight client-side routing.
- **js-yaml**: YAML parsing/serialization.
- **clsx + tailwind-merge**: Conditional CSS class composition.
- **react-hook-form**: Form handling.
- **@tanstack/react-query**: Server state management (prepared).
