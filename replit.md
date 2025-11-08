# Sora Prompt Builder

## Overview

Sora Prompt Builder is an AI-powered web application that helps users craft and enhance video prompts for Sora (OpenAI's video generation model). The application provides a visual interface where users can start with a basic prompt and progressively enhance it by selecting from categorized cinematic options including camera angles, lighting, motion, styles, and more. An AI intelligently merges these enhancements while preserving the user's creative vision.

The application features a clean, utility-focused design inspired by Linear and Notion, with subtle cinematic elements that reflect its video creation purpose. Users can build prompts through an intuitive two-column layout (desktop) with real-time prompt editing, undo/redo capabilities, and AI-powered suggestions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Libraries:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and API caching

**UI Component System:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library with custom "new-york" style preset
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management

**State Management:**
- Local component state for prompt editing and history
- History tracking with undo/redo functionality using array-based state
- Set-based tracking for applied enhancements
- TanStack Query for server state (API responses, caching)

**Design System:**
- Custom CSS variables for theming (light/dark mode support)
- Typography: Inter for UI, JetBrains Mono for monospace prompt display
- Consistent spacing units (2, 4, 6, 8, 16, 24) via Tailwind
- Elevation system using subtle shadows and opacity layers
- Responsive breakpoint at 768px for mobile/desktop layouts

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- HTTP server for API endpoints and static file serving
- Development: Vite middleware integration for HMR
- Production: Compiled with esbuild, serves pre-built static assets

**API Structure:**
- `/api/enhance-prompt` - POST endpoint for AI-powered prompt enhancement
- `/api/generate-suggestions` - POST endpoint for generating category-specific suggestions
- Request/response validation using Zod schemas from shared package

**Code Organization:**
- `server/routes.ts` - API route definitions and handlers
- `server/lib/openrouter.ts` - External AI service integration
- `shared/schema.ts` - Shared TypeScript types and Zod validation schemas
- Monorepo-style structure with shared code between client/server

### Data Architecture

**Database Configuration:**
- Drizzle ORM configured for PostgreSQL
- Schema definition in `shared/schema.ts`
- Migration files in `/migrations` directory
- Currently minimal database usage (storage interface exists but not actively used)

**Data Flow:**
- User creates/edits base prompt in frontend
- Selections from enhancement categories trigger API calls
- AI processes enhancement requests and returns refined prompts
- Frontend maintains prompt history for undo/redo
- Applied enhancements tracked client-side via Set data structure

### External Dependencies

**AI Services:**
- OpenRouter API for AI-powered prompt enhancement and suggestion generation
- Primary model: Anthropic Claude 3.5 Sonnet
- API key required via `OPENROUTER_API_KEY` environment variable
- Temperature set to 0.7 for creative but controlled responses

**Database:**
- PostgreSQL via Neon serverless driver (`@neondatabase/serverless`)
- Connection string required via `DATABASE_URL` environment variable
- Drizzle ORM for type-safe database operations
- Session storage capability via `connect-pg-simple` (configured but not actively used)

**Third-Party UI Libraries:**
- Radix UI component primitives (20+ components including dialogs, dropdowns, tooltips)
- Embla Carousel for potential image/video carousels
- React Hook Form with Zod resolver for form validation
- date-fns for date formatting utilities

**Development Tools:**
- Replit-specific plugins for development environment integration
- Vite plugins for error overlays and dev banners in Replit environment
- Google Fonts (Inter, JetBrains Mono) loaded from CDN

**Build & Deployment:**
- TypeScript compilation with strict mode enabled
- ESM module format throughout
- Path aliases configured for clean imports (`@/`, `@shared/`)
- Separate build processes for client (Vite) and server (esbuild)