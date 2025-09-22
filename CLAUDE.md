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
│   ├── favicon.ico        # App favicon
│   ├── globals.css        # Global Tailwind CSS styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page component
├── lib/                   # Shared utilities
│   └── utils.ts           # Utility functions (cn helper)
├── public/                # Static assets
│   ├── file.svg          # Static SVG icons
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── prompts/               # Project documentation
│   └── requirements.md   # Detailed project requirements
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
- `components/` - Reusable UI components (shadcn/ui structure)
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

### Component Development
- Use shadcn/ui components as base (`npx shadcn@latest add <component>`)
- Follow the established Tailwind + TypeScript patterns
- Leverage the `cn()` utility in `lib/utils.ts` for conditional classes

### API Integration Planning
- Backend services will be Flask-based with RESTful APIs
- Frontend will consume these APIs for crawling, summarization, and video generation
- Consider API route handlers in Next.js for proxy/middleware functionality

### State Management
- No global state management currently configured
- Plan for integration with backend APIs and potential addition of Zustand or Context API

## Important Notes

- Project uses Turbopack for faster development and builds
- shadcn/ui components use CSS variables for theming
- TypeScript paths are configured for clean imports
- Current setup is frontend-only; backend integration is planned based on requirements document