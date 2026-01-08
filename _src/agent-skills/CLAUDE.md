# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Deployment to Blog

This project is deployed to SUT-GC.github.io blog. To deploy updates:

```bash
npm run build
cp -r dist/* /path/to/SUT-GC.github.io/files/powerpoint/agent-skills/
```

For new React slide projects, follow the same pattern:
1. Ensure `vite.config.ts` has `base: "./"` for relative paths
2. Build and copy `dist/` to `files/powerpoint/<project-name>/`
3. Add link in `_posts/2017-09-16-ppt.md`: `{{ site.paths.ppt }}<project-name>/index.html`

## Project Overview

An HTML slide presentation about "Agent Skills" built with React, TypeScript, Vite, and Tailwind CSS v4. The presentation features a cyberpunk/neon aesthetic with animated slide transitions.

## Commands

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # TypeScript compile + Vite production build (outputs to dist/)
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

## Architecture

### Core Slide System

- **`src/lib/slides-data.ts`**: Central slide content definition. Exports `slides` array with typed `SlideData` objects. Each slide has a `type` property determining its layout component.

- **`src/components/SlideDeck.tsx`**: Main presentation component that:
  - Renders slides based on `type`: `title-cover`, `agenda`, `section-divider`, `content`, `closing`
  - Handles keyboard navigation (Arrow keys, Space, Enter)
  - Handles click-to-advance
  - Uses Framer Motion for transitions

### Slide Types

Each type has a dedicated sub-component in `SlideDeck.tsx`:
- `CoverSlide` - Title slide with background image
- `AgendaSlide` - Numbered list with visual indices
- `SectionDividerSlide` - Section break with centered title
- `ContentSlide` - Main content with bullet points and optional side panel
- `ClosingSlide` - Thank you slide with background

### Styling

- **Tailwind CSS v4** with `@tailwindcss/vite` plugin (configured in `vite.config.ts`)
- **Theme**: Defined in `src/index.css` using CSS custom properties:
  - Neon colors: `--neon-blue`, `--neon-purple`, `--neon-cyan`
  - Fonts: Orbitron (headings), Rajdhani (body)
- **Utility classes**: `glass-panel`, `neon-text-blue`, `neon-text-purple`, `neon-border`

### Path Alias

`@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`)

### UI Components

`src/components/ui/` contains Radix-based shadcn/ui components. The `cn()` utility in `src/lib/utils.ts` merges Tailwind classes.

### Custom Babel Plugin

`scripts/babel-plugin-jsx-source-location.cjs` injects `data-source` attributes into JSX elements for AI agent debugging.
