# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spectrum is a web crawling-based platform for automated content analysis and short-form video creation. The project currently has a Next.js frontend foundation with plans to integrate Python Flask backend services for web crawling, document summarization, AI video generation, and quiz creation.

## Development Commands

### Frontend (Next.js)
```bash
# Development with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Package Management
```bash
# Install dependencies
npm install

# Install specific package
npm install <package-name>
```

## Project Structure

```
spectrum/
├── app/                    # Next.js App Router
│   ├── demo/              # Demo pages
│   │   ├── components/    # Component showcase page
│   │   ├── layout.tsx     # Demo layout
│   │   └── page.tsx       # Main admin dashboard demo
│   ├── favicon.ico        # App favicon
│   ├── globals.css        # Global Tailwind CSS styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page component
├── components/            # UI components
│   ├── ui/               # shadcn/ui components
│   ├── common/           # Reusable common components
│   │   ├── forms/        # Form components (DynamicForm, etc.)
│   │   ├── data-display/ # Data display (DataTable, SearchFilter)
│   │   ├── feedback/     # Feedback (LoadingState, EmptyState, ErrorBoundary)
│   │   └── utility/      # Utility (ConfirmDialog, NotificationCenter, etc.)
│   └── demo/             # Demo-specific components
│       ├── layout/       # Admin layout components
│       ├── widgets/      # Dashboard widgets
│       ├── pages/        # Demo pages
│       └── demo-example.tsx # Demo examples
├── lib/                   # Shared utilities
│   └── utils.ts           # Utility functions (cn helper)
├── public/                # Static assets
│   ├── file.svg          # Static SVG icons
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── prompts/               # Project documentation
│   ├── requirements.md   # Detailed project requirements
│   ├── admin-ui-plan.md  # Admin UI implementation plan
│   └── components-checklist.md # UI components checklist
├── components.json        # shadcn/ui configuration
├── eslint.config.mjs     # ESLint configuration
├── next.config.ts        # Next.js configuration
├── next-env.d.ts         # Next.js TypeScript declarations
├── package.json          # Dependencies and scripts
├── postcss.config.mjs    # PostCSS configuration
├── tsconfig.json         # TypeScript configuration
├── CLAUDE.md             # This file
└── README.md             # Basic project setup guide
```

## Architecture Overview

### Current Structure
- **Frontend**: Next.js 15.5.3 with React 19.1.0, using App Router
- **UI Framework**: shadcn/ui components with Tailwind CSS v4
- **TypeScript**: Full TypeScript support with strict configuration
- **Styling**: Tailwind CSS with CSS variables and Geist fonts

### Planned Architecture (from requirements)
- **Backend**: Python Flask with PostgreSQL and Redis
- **AI Services**: OpenAI API, fal.ai API for video generation
- **Crawling**: BeautifulSoup, Scrapy, Selenium
- **Task Queue**: Celery + Redis

### Component Structure
- `app/` - Next.js App Router pages and layouts
- `lib/` - Utility functions and shared logic
- `components/ui/` - shadcn/ui base components
- `components/common/` - Reusable common components
- `components/demo/` - Demo-specific components and layouts
- `prompts/` - Project documentation and requirements

## Key Configuration Files

### Frontend Setup
- `components.json` - shadcn/ui configuration with "new-york" style
- `tsconfig.json` - TypeScript configuration with path aliases (`@/*`)
- `next.config.ts` - Next.js configuration (currently minimal)
- `package.json` - Dependencies and npm scripts with Turbopack enabled

### Path Aliases
- `@/components` - UI components
- `@/lib` - Utility functions
- `@/hooks` - React hooks
- `@/ui` - shadcn/ui components

## Technology Stack

### Current Frontend
- **Framework**: Next.js 15.5.3 with App Router
- **React**: 19.1.0
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: shadcn/ui with Lucide React icons
- **Utilities**: clsx, tailwind-merge for className management
- **Animation**: tw-animate-css

### Development Tools
- **TypeScript**: v5 with strict mode
- **ESLint**: v9 with Next.js config
- **Build**: Turbopack for faster builds

## Project Requirements Context

The project aims to build a comprehensive platform with:

1. **Web Crawling System** - News sites, social media, specialized domains
2. **Document Summarization** - AI-powered multi-level summarization
3. **Video Generation** - fal.ai API integration for short-form videos
4. **Quiz Generation** - Automated quiz creation from summaries
5. **User Management** - Employee ID-based authentication system

## Development Workflow

### UI Implementation Guidelines
- **MANDATORY**: Always use shadcn/ui components as base (`npx shadcn@latest add <component>`)
- **NO EMOJIS**: Do not use emojis in code, comments, or UI text
- Follow the established Tailwind + TypeScript patterns
- Leverage the `cn()` utility in `lib/utils.ts` for conditional classes
- Reference existing demo components in `components/demo/` for UI patterns

### Component Development Best Practices
- Use existing demo components as reference for layout and styling patterns
- Follow the admin dashboard design patterns established in `components/demo/`
- Prioritize consistency with existing component structure
- Always implement responsive design using Tailwind CSS breakpoints

### Available Demo Components Reference
- **Layout**: AdminLayout, Sidebar, Header (in `components/demo/layout/`)
- **Widgets**: StatCard, MetricChart, SystemMonitor (in `components/demo/widgets/`)
- **Common**: DynamicForm, DataTable, SearchFilter, LoadingState, EmptyState, ErrorBoundary, ConfirmDialog, NotificationCenter (in `components/common/`)

### API Integration Planning
- Backend services will be Flask-based with RESTful APIs
- Frontend will consume these APIs for crawling, summarization, and video generation
- Consider API route handlers in Next.js for proxy/middleware functionality

### State Management
- Use NotificationProvider for notifications (already implemented)
- Plan for integration with backend APIs and potential addition of Zustand or Context API

## Demo Pages Access

### Available Demo URLs
- **Main Admin Dashboard**: `http://localhost:3000/demo`
- **Component Showcase**: `http://localhost:3000/demo/components`

### Demo Features
- Complete admin dashboard layout with sidebar navigation
- Real-time system monitoring widgets
- Data visualization charts (Recharts-based)
- Comprehensive component showcase demonstrating all UI patterns
- Responsive design with dark mode support

## Important Notes

- Project uses Turbopack for faster development and builds
- shadcn/ui components use CSS variables for theming
- TypeScript paths are configured for clean imports
- **NO EMOJIS**: Strictly avoid emojis in all code and UI implementations
- **MANDATORY shadcn/ui**: All UI components must use shadcn/ui as foundation
- Reference demo components for consistent UI patterns and layouts
- Current setup is frontend-only; backend integration is planned based on requirements document