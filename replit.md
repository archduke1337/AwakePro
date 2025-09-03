# Overview

This is a full-stack TypeScript application that combines a React frontend with an Express.js backend to create an AI chat interface with automation features. The application allows users to send messages to various AI models (GPT, Claude, Llama) through OpenRouter API and automatically detects keywords to trigger simulated automation actions like sending emails, creating Jira tasks, or posting Slack messages.

The project uses modern web technologies including React Query for state management, shadcn/ui for the component library, Tailwind CSS for styling, and Drizzle ORM for database operations with PostgreSQL.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**React SPA with TypeScript**: The client is built as a single-page application using React 18 with TypeScript for type safety. The application uses Vite as the build tool and development server.

**Component System**: Utilizes shadcn/ui component library built on Radix UI primitives, providing a comprehensive set of accessible UI components. Components follow the "new-york" style variant with neutral base colors and CSS variables for theming.

**State Management**: Implements TanStack React Query for server state management, API caching, and data synchronization. The query client is configured with custom request functions and error handling.

**Routing**: Uses Wouter for lightweight client-side routing, currently supporting a home page and 404 fallback.

**Styling**: Tailwind CSS provides utility-first styling with a custom configuration that extends the default theme with CSS variables for consistent theming across components.

## Backend Architecture

**Express.js Server**: RESTful API server built with Express.js and TypeScript, providing endpoints for chat functionality and health checks.

**AI Integration**: OpenRouter service handles communication with multiple AI model providers (OpenAI GPT-4, Anthropic Claude, Meta Llama) through a unified API interface. Supports automatic model selection and manual model specification.

**Automation Detection**: Server-side keyword detection automatically identifies mentions of "email", "task", or "slack" in user messages and generates corresponding automation actions with simulated responses.

**Development Setup**: Vite middleware integration for hot module replacement in development, with static file serving for production builds.

## Data Storage Solutions

**Database Schema**: Drizzle ORM with PostgreSQL support defines a simple user schema with UUID primary keys, unique usernames, and password fields.

**In-Memory Storage**: Currently implements a memory-based storage layer for development/testing, with interfaces designed for easy migration to actual database connections.

**Migration Support**: Drizzle configuration supports database migrations with schemas defined in shared directory for consistency between client and server.

## Authentication and Authorization

**Basic User Schema**: Database schema includes user authentication fields (username/password) but authentication middleware is not yet implemented in the current routes.

**Session Storage**: Package dependencies include `connect-pg-simple` for PostgreSQL-based session storage, indicating planned session-based authentication.

## External Dependencies

**AI Services**: OpenRouter API integration provides access to multiple AI model providers through a single interface. Requires OPENROUTER_API_KEY environment variable for authentication.

**Database**: PostgreSQL database connection configured through DATABASE_URL environment variable, with Neon Database serverless driver for connection pooling.

**Development Tools**: Replit-specific integrations including error overlay, cartographer for code mapping, and development banner for external access.

**UI Framework**: Comprehensive Radix UI component collection provides accessible, unstyled primitives that are styled with Tailwind CSS through the shadcn/ui system.

**Build System**: Vite for frontend bundling with React plugin, esbuild for server-side TypeScript compilation, and PostCSS for CSS processing.