# Sora Prompt Builder

## Overview

Sora Prompt Builder is an AI-powered web application that helps users craft and enhance video prompts for Sora (OpenAI's video generation model). The application features a dual-mode interface: **Simple Mode** for quick preset-based prompt creation, and **Advanced Mode** for granular control across 12 enhancement categories organized into logical groups.

Users can start with a basic prompt and progressively enhance it through:
- **Quick Presets**: One-click cinematic styles (Cinematic Drama, Dreamy Atmosphere, Action & Energy, Documentary Realism)
- **Enhancement Categories**: 12 categories across Camera, Visuals, Atmosphere, and Polish
- **AI-Powered Suggestions**: Contextually relevant suggestions that adapt to your prompt
- **Stacking Enhancements**: Build complex prompts layer by layer with intelligent AI merging

The application features a clean, utility-focused design inspired by Linear and Notion, with subtle cinematic elements that reflect its video creation purpose. Users can build prompts through an intuitive two-column layout (desktop) with real-time prompt editing, undo/redo capabilities, and mode switching.

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
- Mode state ("simple" | "advanced") for UI switching
- Local component state for prompt editing and history
- History tracking with undo/redo functionality using array-based state
- Set-based tracking for applied enhancements (includes preset enhancements)
- Per-category refresh state tracking for loading indicators
- Custom AI-generated suggestions cached per category
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
- **Simple Mode**: Quick presets apply multiple enhancements sequentially; core category tabs show 4 main categories
- **Advanced Mode**: Accordion groups organize all 12 categories; each category has independent refresh
- Selections from enhancement categories trigger API calls to Claude via OpenRouter
- AI processes enhancement requests with full prompt context and returns refined prompts
- Contextual suggestion generation analyzes current prompt to provide relevant options
- Frontend maintains prompt history for undo/redo with state preserved across mode switches
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

## Features & Components

### Dual-Mode System
**Simple Mode (Default)**:
- Quick Presets card with 4 preset options
- 4 Core category tabs (Camera Angles, Lighting, Style, Motion)
- Focused experience for rapid prompt creation

**Advanced Mode**:
- Organized accordion with 4 groups:
  - 📹 Camera (Angles, Motion)
  - 💡 Visuals (Lighting, Color, Depth of Field)
  - 🎨 Atmosphere (Weather, Time of Day, Mood)
  - ✨ Polish (Style, Motion/Timing, Composition, Texture)
- Independent refresh per category
- Access to all 12 enhancement categories

### Enhancement Categories (12 Total)
1. **Camera Angles**: Wide shots, close-ups, Dutch angles, bird's eye, low angle, OTS
2. **Camera Motion**: Dolly, tracking, handheld, crane, pan, tilt, steadicam, static
3. **Lighting**: Golden hour, hard side light, soft diffused, backlighting, volumetric rays, neon, candlelit, blue hour
4. **Color Palette**: Warm earth, cool blue-teal, orange-teal, monochromatic, pastel, neon synthwave, desaturated, jewel tones
5. **Depth of Field**: Shallow focus, deep focus, rack focus, selective focus, tilt-shift, hyperfocal
6. **Weather & Atmosphere**: Morning mist, gentle rain, falling snow, dust particles, heavy storm, clear air
7. **Time of Day**: Golden hour, blue hour, harsh midday, twilight, deep night, early dawn
8. **Mood & Emotion**: Serene, tense, mysterious, nostalgic, uplifting, melancholic
9. **Style**: Cinematic anamorphic, 1970s film, IMAX doc, B&W noir, Wes Anderson, Blade Runner, 16mm doc, music video
10. **Motion/Timing**: Slow motion, time-lapse, beat-perfect, held moment, gradual reveal, quick cut
11. **Composition**: Rule of thirds, symmetrical balance, leading lines, negative space, framing device, diagonal dynamics
12. **Texture & Surface**: Film grain, smooth surfaces, rough weathered, glossy reflective, matte finish, organic natural

### Quick Presets
1. **Cinematic Drama**: Low angle + hard side light + anamorphic + shallow focus
2. **Dreamy Atmosphere**: Soft diffused light + golden hour + slow dolly + pastel palette
3. **Action & Energy**: Handheld + high contrast + quick timing + wide establishing
4. **Documentary Realism**: Natural lighting + medium shot + 16mm style + deep focus

### AI Integration
- **Contextual Suggestions**: Refresh button generates new suggestions based on current prompt
- **Smart Merging**: AI preserves creative intent while stacking enhancements
- **Response Time**: 2-15 seconds for AI operations with loading indicators
- **Model**: Anthropic Claude 3.5 Sonnet via OpenRouter

### Recent Changes (November 2025)
- Implemented dual-mode system (simple/advanced)
- Added 5 new enhancement categories (Weather, Time of Day, Composition, Mood, Texture)
- Created preset system with 4 predefined combinations
- Reorganized categories into 4 logical groups
- Added per-category refresh state tracking
- Improved contextual awareness for AI-generated suggestions