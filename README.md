# FreeDevTool.app

[FreeDevTool.App](https://FreeDevTool.App)

**A comprehensive collection of 49+ open source developer tools with offline functionality**

## Overview
FreeDevTool.App is a comprehensive web-based collection of open source developer and productivity utilities. It provides a wide range of tools across sections like Conversions, Formatters, Encoders, Text, Time, Financial, Color, and Hardware tools. Built as a full-stack TypeScript application with a privacy-first design, it offers a modern, responsive UI with dark/light theme support, optimized for desktop, mobile, and TV displays. Key advantages include: Open Source & Community-Driven, Browser-Based Computation for Enhanced Security, Zero Data Transmission, and Offline Functionality. All current tools are free to use since computation happens entirely in your browser, providing both security and performance benefits.

## Tenets

### Privacy First
- **Zero Data Transmission**: All operations happen locally in your browser - no data ever leaves your device
- **Air-Gapped Compatible**: Designed to work in completely isolated environments
- **Enterprise Ready**: Designed to be safe for handling sensitive company data and proprietary information

### Developer Focused
- **By Developers, For Developers**: Built to solve real problems we face daily
- **Keyboard-First UX**: Every tool accessible via keyboard shortcuts for maximum productivity
- **Offline Always**: Works without internet - no external dependencies or CDN calls

### Open & Accessible
- **100% Open Source**: Community-driven development with transparent codebase
- **Free Core Features**: All current tools are free to use since computation happens in your browser
- **Universal Access**: Works on desktop, mobile, and TV displays with responsive design

## User Preferences
Preferred communication style: Simple, everyday language.
Preferred UI behavior: All menu sections collapsed by default, with minimize buttons (< and ^) for maximum screen real estate optimization suitable for TV displays. Sidebar should be collapsed by default.
Preferred terminology: "Camera" instead of "Webcam" for video capture devices.
Monetization: Application includes advertisements. Current features are free since computation happens in user browsers, but future premium features may be introduced.

## Recent Updates (August 14, 2025)
- **Enhanced Mobile UX**: Improved hamburger menu with larger touch targets, better accessibility, and enhanced sidebar layout
- **Centralized Architecture**: Created unified data source for all components (sidebar, homepage, search, demo) to eliminate inconsistencies
- **Navigation Fixes**: Resolved double "/tools" path issues and demo system routing for seamless user experience
- **UI Optimization**: Sidebar defaults to collapsed state for maximum screen real estate, especially for TV displays
- **Keyboard Shortcuts**: Updated Ctrl+J for JSON Formatter, moved JSON↔YAML to Ctrl+Shift+Y
- **Code Quality**: Simplified HTML validation logic, fixed barcode centering, improved TypeScript error handling
- **Documentation**: Renamed replit.md to README.md with comprehensive tenets section

## System Architecture

### Frontend Architecture
The client-side is a React with TypeScript application, built on a component-based architecture. It utilizes shadcn/ui components (based on Radix UI) and Tailwind CSS for styling, supporting light and dark modes via CSS variables.
- **Routing**: Uses wouter for lightweight client-side routing.
- **State Management**: Leverages React's built-in state management with hooks.
- **UI/UX Decisions**: Features collapsible header/sidebar menus with state persistence, responsive sidebar modes, a unified text editor with line numbers, and a searchable tool directory with keyboard shortcut navigation. All 49 tools now use simple React state (no session persistence) for optimal reliability and performance, and UI uniformity is achieved through shared components like `ToolButton` and `ToolTextArea`. Regex Tester uses Ctrl+E shortcut (Ctrl+R reserved for browser refresh). Session management has been completely removed from all tools for enhanced stability.

### Backend Architecture
There is no back-end, this is entirely a stand-alone, and self sufficient front-end application

### Data Storage Solutions
The application currently uses an in-memory storage implementation but is architected for future PostgreSQL integration via Drizzle ORM for type-safe database interactions.

### Authentication and Authorization
Not implemented

### Technical Implementations & Feature Specifications
- **Tool Suite**: Comprehensive conversion tools (URL/CSV to JSON, Number Base, Date, Timezone, Unit), advanced text tools (password generator, UUID v1/v4), and hardware tests (Camera, Microphone, Keyboard) with Web Audio API integration for alerts. Added Metronome with multi-tone functionality. All 48 tools converted to simple React state management for enhanced reliability.
- **Demo System**: Automated tour functionality with customizable speed controls (Slow 8s, Normal 5s, Fast 3s, Very Fast 1.5s), persistent state management, skip/stop controls, and speed preference persistence via localStorage.
- **Offline Functionality**: All external dependencies for tools like QR and Barcode generators have been replaced with local JavaScript libraries to ensure 100% offline functionality.
- **URL Sharing**: Implemented across all major tools, including timing tools, for state persistence and sharing.
- **Monetization**: Includes a 3-ad placement system for revenue generation.
- **Security**: Implemented Content Security Policy and removed external dependencies enforcing a privacy-first, zero-network-dependency architecture suitable for air-gapped environments. Strict validation and sanitization are applied to all URL parameters.

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework.
- **Express.js**: Backend web framework.
- **TypeScript**: Type safety across the stack.
- **Vite**: Build tool and development server.

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework.
- **Radix UI**: Headless UI components.
- **shadcn/ui**: Component library based on Radix UI.
- **Lucide React**: Icon library.

### Database and ORM
- **Drizzle ORM**: Type-safe SQL ORM for PostgreSQL.
- **@neondatabase/serverless**: PostgreSQL driver.
- **Drizzle Kit**: CLI for database migrations.

### Development and Build Tools
- **ESBuild**: Fast JavaScript bundler.
- **Prettier**: Code formatter.
- **wouter**: Lightweight React router alternative.

### Utility Libraries
- **js-yaml**: YAML parsing and stringification.
- **date-fns**: Date manipulation and formatting.
- **clsx/tailwind-merge**: Conditional CSS class composition.
- **nanoid**: Unique ID generation.
- **connect-pg-simple**: PostgreSQL session storage.

## License

Licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for full details.

```
Copyright 2025 FreeDevTool.App

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
