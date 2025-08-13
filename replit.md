# Overview

This is a car lead management system built as a full-stack web application where Virtual Assistants (VAs) can submit potential car deals. The system automatically calculates profit estimates and VA commissions based on configurable business rules. It features a public lead submission interface and an admin dashboard for managing leads through various workflow stages.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for type safety and modern component development
- **Vite** as the build tool for fast development and optimized production builds
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query** for server state management, caching, and API synchronization
- **React Hook Form** with Zod validation for form handling and client-side validation
- **Tailwind CSS** with shadcn/ui component library for consistent, accessible UI components
- **Radix UI** primitives underlying the shadcn/ui components for accessibility and keyboard navigation

## Backend Architecture
- **Express.js** server with TypeScript for API endpoints and middleware
- **Iron Session** for secure session management using signed cookies (no complex auth system)
- **bcrypt** for password hashing and validation of the single admin password
- **Rate limiting** on public endpoints to prevent abuse
- **Middleware-based architecture** for authentication, validation, and error handling

## Database Layer
- **PostgreSQL** as the primary database (configured for Neon serverless)
- **Drizzle ORM** with schema-first approach for type-safe database operations
- **Database schema** includes:
  - `vas` table for Virtual Assistant records
  - `leads` table for car lead submissions with status workflow
  - `settings` table for business rules and configuration
  - Enum-based status tracking (PENDING → APPROVED → CONTACTED → BOUGHT → SOLD → PAID)

## Business Logic Components
- **Commission calculation engine** with tiered structure:
  - Small deals: flat fee
  - Medium deals: percentage-based
  - Large deals: higher percentage
- **Profit estimation** based on asking price, estimated sale price, and expenses
- **Lead validation** including location restrictions and condition checking
- **Workflow management** for lead status progression with required fields per stage

## Development & Deployment
- **Monorepo structure** with shared schema and types between client/server
- **Development setup** with Vite dev server proxying to Express backend
- **TypeScript configuration** with path aliases for clean imports
- **Build process** that bundles both frontend (Vite) and backend (esbuild) for production

## Key Design Decisions
- **Single admin authentication** instead of complex user roles - uses environment variable for password hash
- **Session-based auth** with iron-session for simplicity over JWT tokens
- **Serverless-ready** database configuration with connection pooling
- **Component composition** pattern with shadcn/ui for consistent UI without heavy frameworks
- **Type sharing** between frontend and backend through shared schema definitions
- **Form validation** handled both client-side (Zod) and server-side for security

# External Dependencies

## Database & ORM
- **Neon PostgreSQL** - Serverless PostgreSQL database provider
- **Drizzle ORM** - Type-safe database toolkit with migration support
- **Drizzle Kit** - CLI tools for schema management and migrations

## Authentication & Security
- **iron-session** - Secure session management with signed/encrypted cookies
- **bcrypt** - Password hashing and verification
- **express-rate-limit** - API rate limiting middleware

## UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Pre-built accessible component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Icon library
- **class-variance-authority** - Type-safe CSS class management

## Forms & Validation
- **React Hook Form** - Form state management and validation
- **Zod** - Schema validation for both client and server
- **@hookform/resolvers** - Integration between React Hook Form and Zod

## Development Tools
- **Vite** - Frontend build tool with HMR
- **esbuild** - Fast JavaScript bundler for backend
- **tsx** - TypeScript execution for development
- **PostCSS** with Autoprefixer for CSS processing

## Runtime Libraries
- **TanStack Query** - Server state management and caching
- **date-fns** - Date manipulation utilities
- **wouter** - Lightweight routing library
- **cmdk** - Command menu component