# Sora Prompt Builder Design Guidelines

## Design Approach
**Utility-Focused with Cinematic Polish**: Inspired by Linear's clarity and Notion's organization, enhanced with subtle cinematic elements reflecting the video creation purpose. Clean, efficient interface prioritizing workflow over decoration.

## Core Design Principles
1. **Workflow Efficiency**: Minimize clicks, maximize clarity
2. **Progressive Enhancement**: Visual feedback as prompts build
3. **Cinematic Touches**: Subtle film-inspired elements without overwhelming functionality
4. **Instant Clarity**: Users understand functionality at a glance

## Typography
- **Primary Font**: Inter or DM Sans (Google Fonts) - clean, modern readability
- **Monospace Font**: JetBrains Mono - for displaying prompts
- **Hierarchy**:
  - Hero/Headlines: text-2xl to text-3xl, font-semibold
  - Section Headers: text-lg, font-semibold
  - Body/Options: text-sm to text-base, font-normal
  - Prompt Display: text-sm, monospace
  - Helper Text: text-xs, reduced opacity

## Layout System
- **Spacing Units**: Tailwind units of 2, 4, 6, 8, 16, 24 for consistent rhythm
- **Container**: max-w-7xl mx-auto with px-4 md:px-8
- **Grid Pattern**: Two-column layout on desktop (prompt on left, options on right), single column on mobile
- **Component Spacing**: Sections separated by py-8 to py-12

## Component Library

### Hero Section
- **Layout**: Centered, compact header (not full-height)
- **Content**: 
  - App title with tagline
  - Brief description of AI-powered prompt enhancement
  - Quick-start CTA or example prompt button
- **Height**: Natural flow, ~30-40vh maximum
- **Background**: Subtle gradient or pattern suggesting film/frames

### Main Workspace (Two-Column Desktop)
**Left Column (40% width)**:
- Prompt Input: Large textarea (min-height: 200px) with monospace font
- Action Bar: Undo/Redo buttons (icon-only), Copy button (prominent)
- Character count and prompt quality indicator
- Starter prompts dropdown/selector

**Right Column (60% width)**:
- Category Tabs: Horizontal scrollable tabs for each enhancement category
- Suggestion Cards Grid: 2-3 columns of enhancement options
- Refresh button for each category section
- Active enhancements tracker showing current applied modifications

### Enhancement Cards
- **Size**: Compact, scannable cards in grid layout
- **Content**: 
  - Enhancement title (text-sm, font-medium)
  - Brief example text (text-xs, muted)
  - Visual indicator if already applied
- **Interaction**: Click to apply, subtle scale on hover
- **States**: Default, hover, applied (with checkmark or indicator)

### Prompt History Panel
- Collapsible timeline showing previous versions
- Undo/redo visual breadcrumbs
- Each version clickable to restore

### Action Buttons
- **Primary CTA** (Copy Prompt): Prominent, fixed position or sticky
- **Secondary Actions**: Undo/Redo as icon buttons
- **Tertiary**: Refresh suggestions, clear prompt
- All buttons use consistent height (h-10 or h-12)

### Category Navigation
- Horizontal tabs with active state indicator
- Smooth scroll for mobile
- Fixed/sticky on scroll for easy access
- Categories: Camera Angles, Camera Motion, Lighting, Style, Depth of Field, Motion/Timing, Color Palette

### Tooltips & Guidance
- Subtle info icons (i) next to complex options
- Hover reveals best practices from Sora 2 guide
- Non-intrusive, appears on hover/focus

## Animations
**Minimal but Purposeful**:
- Prompt text fade-in when enhanced (duration-200)
- Card scale on hover (scale-105, duration-150)
- Copy button success state (checkmark animation)
- Undo/redo visual transition (subtle highlight)
- Avoid scroll-triggered or background animations

## Images
**No hero image needed** - this is a tool-focused interface. Use:
- **Icons**: Heroicons for all UI elements (camera, lightbulb, palette, etc.)
- **Visual Accents**: SVG film strip pattern or camera lens graphic as subtle background element in header
- **Category Icons**: Distinct icon for each enhancement category

## Responsive Behavior
- **Desktop (lg:)**: Two-column layout, grid-cols-3 for suggestion cards
- **Tablet (md:)**: Stacked layout, grid-cols-2 for cards
- **Mobile**: Single column, grid-cols-1 for cards, sticky category tabs

## Interactive States
- **Input Focus**: Subtle border highlight, no dramatic effects
- **Card Selection**: Gentle background shift, checkmark appears
- **Copy Success**: Button transforms to show checkmark, brief success message
- **Undo/Redo**: Disabled state when history empty, active when available

## Functional Elements
- **Live Preview**: Prompt updates in real-time as enhancements stack
- **Visual Diff**: Highlight newly added text in preview (subtle background)
- **Category Badges**: Small badges showing count of active enhancements per category
- **Progress Indicator**: Visual representation of prompt complexity/completeness

## Key UX Patterns
1. Click enhancement → AI merges → Prompt updates → Preview shows result
2. Undo available immediately after each change
3. Copy button always visible and accessible
4. Category switching maintains scroll position
5. Applied enhancements visually marked to prevent re-application

This design prioritizes speed and clarity for creative professionals building video prompts, with just enough visual polish to match the cinematic output they're creating.