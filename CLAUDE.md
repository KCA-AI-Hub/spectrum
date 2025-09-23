# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spectrum is a Next.js 15 application built with TypeScript, React 19, and Tailwind CSS. The project follows the App Router pattern and is configured with shadcn/ui components for the UI framework. The application appears to be designed as an admin dashboard system.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for faster builds)
- **Production build**: `npm run build` (uses Turbopack)
- **Start production**: `npm start`
- **Linting**: `npm run lint` (ESLint configuration)

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **UI Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables
- **Type System**: TypeScript with strict mode
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React built-in state (no external state management detected)
- **Data Visualization**: Recharts for charts and metrics
- **Icons**: Lucide React

### Project Structure
```
app/
├── admin/           # Admin dashboard pages
│   ├── content/     # Content management
│   ├── crawling/    # Data crawling features
│   ├── users/       # User management
│   └── system/      # System administration
├── globals.css      # Global styles and Tailwind imports
├── layout.tsx       # Root layout with font configuration
└── page.tsx         # Landing page

lib/
└── utils.ts         # Utility functions (likely contains cn() for class merging)
```

### Component Architecture
The project uses shadcn/ui component system with:
- **Style**: "new-york" variant
- **Base Color**: Slate
- **Path Aliases**: `@/components`, `@/lib`, `@/ui`, `@/hooks`
- **Icon Library**: Lucide React

Admin layout follows a sidebar + header pattern with:
- Sidebar navigation on the left
- Header bar at the top
- Main content area with scroll and padding

### Key Dependencies
- **UI Components**: Extensive Radix UI primitives for accessibility
- **Data Tables**: TanStack React Table for complex data display
- **Date Handling**: date-fns and react-day-picker
- **File Uploads**: react-dropzone
- **Notifications**: Sonner for toast notifications
- **Theming**: next-themes for dark/light mode support

## Development Guidelines

### UI Component Development
**IMPORTANT**: When creating or adding UI components, ALWAYS use the shadcn MCP tools available in Claude Code:
- Use `mcp__shadcn__search_items_in_registries` to find components
- Use `mcp__shadcn__view_items_in_registries` to view component details
- Use `mcp__shadcn__get_add_command_for_items` to get installation commands
- Use `mcp__shadcn__get_item_examples_from_registries` for usage examples

Never manually create shadcn/ui components - always use the MCP tools to ensure proper installation and configuration.

### Code Style
- **NO EMOJIS**: Never use emojis in code, comments, or any file content
- Follow existing code conventions and patterns
- Use TypeScript strict mode consistently

### Path Resolution
Uses `@/` prefix for imports pointing to project root. All component imports should use absolute paths via the configured aliases.

### Form Handling
Forms should use React Hook Form with Zod validation schemas. The project includes @hookform/resolvers for seamless integration.

### Styling Approach
- Uses Tailwind CSS with CSS variables for theming
- Components follow shadcn/ui patterns with class-variance-authority for variant handling
- Global styles in `app/globals.css`

### Component Organization
Based on the deleted files in git status, the project previously had a comprehensive component structure:
- `components/ui/` - Base UI components (shadcn/ui)
- `components/admin/` - Admin-specific components
- `components/common/` - Shared utility components
- `components/demo/` - Demo/example components

When creating new components, follow the established patterns and use the shadcn CLI for adding new UI components.