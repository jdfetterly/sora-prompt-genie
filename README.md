# Sora Prompt Builder

> AI-powered web application for crafting and enhancing video prompts for Sora (OpenAI's video generation model)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4-green)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

Sora Prompt Builder helps you create cinematic video prompts through an intuitive dual-mode interface. Start with a basic idea and progressively enhance it with AI-powered suggestions across 12 enhancement categories, or use quick presets for instant cinematic styles.

## Features

### Dual-Mode Interface
- **Simple Mode**: Quick presets and 4 core categories for rapid prompt creation
- **Advanced Mode**: Full access to all 12 enhancement categories organized into logical groups

### Enhancement Categories (12 Total)
1. **Camera Angles** - Wide shots, close-ups, Dutch angles, bird's eye, low angle, OTS
2. **Camera Motion** - Dolly, tracking, handheld, crane, pan, tilt, steadicam, static
3. **Lighting** - Golden hour, hard side light, soft diffused, backlighting, volumetric rays, neon, candlelit, blue hour
4. **Color Palette** - Warm earth, cool blue-teal, orange-teal, monochromatic, pastel, neon synthwave, desaturated, jewel tones
5. **Depth of Field** - Shallow focus, deep focus, rack focus, selective focus, tilt-shift, hyperfocal
6. **Weather & Atmosphere** - Morning mist, gentle rain, falling snow, dust particles, heavy storm, clear air
7. **Time of Day** - Golden hour, blue hour, harsh midday, twilight, deep night, early dawn
8. **Mood & Emotion** - Serene, tense, mysterious, nostalgic, uplifting, melancholic
9. **Style** - Cinematic anamorphic, 1970s film, IMAX doc, B&W noir, Wes Anderson, Blade Runner, 16mm doc, music video
10. **Motion/Timing** - Slow motion, time-lapse, beat-perfect, held moment, gradual reveal, quick cut
11. **Composition** - Rule of thirds, symmetrical balance, leading lines, negative space, framing device, diagonal dynamics
12. **Texture & Surface** - Film grain, smooth surfaces, rough weathered, glossy reflective, matte finish, organic natural

### Quick Presets
- **Cinematic Drama** - Low angle + hard side light + anamorphic + shallow focus
- **Dreamy Atmosphere** - Soft diffused light + golden hour + slow dolly + pastel palette
- **Action & Energy** - Handheld + high contrast + quick timing + wide establishing
- **Documentary Realism** - Natural lighting + medium shot + 16mm style + deep focus

### AI-Powered Features
- **Auto-Generate**: Expand basic prompts (3+ words) into detailed cinematic descriptions
- **Contextual Suggestions**: AI-generated suggestions that adapt to your current prompt
- **Smart Merging**: Intelligent enhancement stacking that preserves creative intent
- **Real-time Editing**: Live prompt preview with undo/redo history

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Neon serverless)
- OpenRouter API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd SoraPromptGenie
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```env
OPENROUTER_API_KEY=your_openrouter_api_key
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=development
```

4. **Set up the database**
```bash
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000` (or your configured port).

### Build for Production

```bash
npm run build
npm start
```

### Deployment Process

1. Make sure your changes are committed and pushed (Vercel will deploy whatever is in the repo when the deploy command runs).  
2. Run the scripted release flow:
   ```bash
   npm run deploy:prod
   ```
   This command runs `predeploy` (typecheck, lint, tests), builds production artifacts with `vercel build --prod --yes`, then promotes the artifact via `vercel deploy --prebuilt --prod --yes`. It exits immediately if any step fails so partial deployments never ship.
3. When the script finishes, follow the prompts it prints (load the SPA, exercise the key API flows, review Vercel logs, notify the team). The reminders ensure every deploy includes the same manual verification.

> If you leave Git auto-deploys enabled in Vercel, they’ll still trigger on every push using the repo’s configuration (now including `installCommand: npm install --include=dev`). For the safest results, prefer the scripted flow above or disable auto-deploys so production only updates when `npm run deploy:prod` succeeds.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool and dev server
- **Wouter** - Lightweight client-side routing
- **TanStack Query** - Server state management and API caching
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Component library with "new-york" style preset
- **Tailwind CSS** - Utility-first styling

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** - Type-safe database operations
- **Zod** - Schema validation
- **OpenRouter API** - AI service integration (Claude 3.5 Sonnet)

### Database
- **PostgreSQL** via Neon serverless driver

## Project Structure

```
SoraPromptGenie/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   └── index.html
├── server/                 # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   └── lib/
│       └── openrouter.ts  # AI service integration
├── shared/                 # Shared code between client/server
│   └── schema.ts          # TypeScript types and Zod schemas
└── dist/                  # Production build output
```

## Usage

### Simple Mode (Default)
1. Enter a basic prompt (minimum 3 words) or use **Auto-Generate**
2. Choose a **Quick Preset** for instant cinematic styling
3. Browse **4 core categories** (Camera Angles, Lighting, Style, Motion)
4. Click enhancement cards to apply them to your prompt
5. Use undo/redo to navigate through prompt history

### Advanced Mode
1. Switch to Advanced Mode using the toggle
2. Explore **12 enhancement categories** organized into 4 groups:
   - **Camera** (Angles, Motion) - Video icon
   - **Visuals** (Lighting, Color, Depth of Field) - Lightbulb icon
   - **Atmosphere** (Weather, Time of Day, Mood) - Palette icon
   - **Polish** (Style, Motion/Timing, Composition, Texture) - Sparkles icon
3. Use the refresh button on each category for new AI-generated suggestions
4. Stack multiple enhancements to build complex prompts

## Development

### Available Scripts

- `npm run dev` - Start development server with hot module reloading
- `npm run build` - Build both client and server for production
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

### Code Organization

- **Components**: Reusable UI components in `client/src/components/`
- **Pages**: Route-level components in `client/src/pages/`
- **API Routes**: Express routes in `server/routes.ts`
- **Shared Types**: TypeScript types and Zod schemas in `shared/schema.ts`

## Design System

- **Typography**: Inter for UI, JetBrains Mono for code/prompts
- **Colors**: Custom CSS variables with light/dark mode support
- **Spacing**: Consistent units (2, 4, 6, 8, 16, 24) via Tailwind
- **Elevation**: Subtle shadows and opacity layers
- **Responsive**: Mobile-first design with breakpoint at 768px

## API Endpoints

### `POST /api/enhance-prompt`
Enhance a prompt with selected enhancements.

**Request Body:**
```json
{
  "prompt": "A cat walking in a garden",
  "enhancements": ["low angle", "golden hour lighting"]
}
```

**Response:**
```json
{
  "enhancedPrompt": "A cat walking in a garden, shot from a low angle with golden hour lighting..."
}
```

### `POST /api/generate-suggestions`
Generate contextual suggestions for a specific category.

**Request Body:**
```json
{
  "prompt": "A cat walking in a garden",
  "category": "Camera Angles"
}
```

**Response:**
```json
{
  "suggestions": ["low angle shot", "bird's eye view", "close-up"]
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [OpenRouter](https://openrouter.ai/) and Anthropic Claude 3.5 Sonnet
- Design inspired by Linear and Notion

---

**Note**: This project requires an OpenRouter API key to function. Sign up at [openrouter.ai](https://openrouter.ai/) to get started.
