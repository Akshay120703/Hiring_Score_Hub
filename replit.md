# replit.md

## Overview

This is a full-stack hiring assessment application called "EvalPro" built with React/TypeScript frontend and Express.js backend. The application allows HR teams and evaluators to create rubrics, manage candidates, conduct evaluations, and generate reports for hiring assessments.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **File Uploads**: Multer middleware for handling file uploads
- **Session Management**: Express sessions with PostgreSQL store
- **API**: RESTful API design with JSON responses

### Database Schema
- **rubrics**: Stores evaluation rubrics with categories and criteria (JSON fields)
- **candidates**: Stores candidate information (name, email, position)
- **evaluations**: Stores evaluation results linking candidates to rubrics with scores

## Key Components

### Frontend Components
- **Dashboard**: Main overview with statistics and quick actions
- **Candidates**: Candidate management with search and creation
- **Rubrics**: Rubric creation and management interface
- **Reports**: Analytics and data export functionality
- **Evaluation Form**: Interactive form for conducting evaluations
- **Sidebar Navigation**: Main navigation component

### Backend Storage
- **Memory Storage**: In-memory storage implementation for development
- **Database Integration**: Drizzle ORM with PostgreSQL for production
- **File Upload**: Multer configuration for handling attachments

## Data Flow

1. **User Authentication**: Sessions managed through Express middleware
2. **API Requests**: Frontend makes HTTP requests to `/api/*` endpoints
3. **Data Validation**: Zod schemas validate data on both client and server
4. **Database Operations**: Drizzle ORM handles database queries and migrations
5. **Real-time Updates**: TanStack Query manages cache invalidation and updates

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React, React DOM
- **State Management**: @tanstack/react-query
- **Form Handling**: react-hook-form, @hookform/resolvers
- **UI Components**: @radix-ui/* components, lucide-react icons
- **Styling**: tailwindcss, class-variance-authority, clsx
- **Routing**: wouter
- **Validation**: zod, drizzle-zod

### Backend Dependencies
- **Server**: express, tsx for development
- **Database**: drizzle-orm, @neondatabase/serverless
- **Session**: express-session, connect-pg-simple
- **File Upload**: multer
- **Build**: esbuild for production builds

### Development Tools
- **Bundler**: Vite with React plugin
- **Database**: Drizzle Kit for migrations
- **TypeScript**: Full type safety across the stack
- **Replit Integration**: Runtime error overlay and development tools

## Deployment Strategy

### Development
- **Local Development**: `npm run dev` runs both frontend and backend concurrently
- **Hot Reload**: Vite provides instant updates during development
- **Database**: Uses DATABASE_URL environment variable for connection

### Production
- **Build Process**: `npm run build` creates optimized bundles
- **Frontend**: Static files served from `/dist/public`
- **Backend**: Compiled to `/dist/index.js` with esbuild
- **Start Command**: `npm run start` runs the production server
- **Deployment Target**: Replit autoscale deployment on port 5000

### Environment Configuration
- **Database**: PostgreSQL connection via DATABASE_URL
- **Sessions**: Configured for production with secure settings
- **Static Files**: Served by Express in production, Vite in development

## Changelog

```
Changelog:
- June 19, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```