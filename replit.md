# Phoenix Cloud Hosting Platform

## Overview

Phoenix Cloud is a modern cloud hosting platform that provides VPS, dedicated servers, and other hosting services. The application is a full-stack web platform built with React on the frontend and Express on the backend, featuring a public-facing website for customers and an administrative dashboard for content management.

The platform allows administrators to manage hosting plans organized by categories and subcategories, customize site content including hero sections and features, manage FAQs, team members, and control various settings. Customers can browse plans with dual-currency support (USD/INR), filter by categories, and toggle between light/dark themes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query for server state management and caching

**UI Component System**
- Shadcn/ui component library (New York style variant) with Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Support for light/dark theme switching via context provider
- Custom color system using HSL variables for consistent theming

**State Management Strategy**
- React Context API for global state (theme, currency, authentication)
- TanStack Query for server state with infinite stale time (manual refetching)
- Local storage for persistence of user preferences (theme, currency, auth token)

**Design System**
- Typography: Inter for UI, JetBrains Mono for code/technical content
- Spacing based on Tailwind's 8px grid system
- Responsive breakpoints: mobile-first with md (768px) and lg (1024px) breakpoints
- Custom animations for page transitions and card hover effects

### Backend Architecture

**Server Framework**
- Express.js as the HTTP server
- Node.js HTTP server for potential WebSocket support
- RESTful API design pattern

**Data Layer**
- MySQL as the primary database (configurable via environment variables)
- Connection pooling via mysql2/promise
- Database abstraction through IStorage interface pattern
- Support for both local MySQL and serverless MySQL (for Netlify deployment)

**Authentication & Security**
- Simple admin authentication using scrypt password hashing
- Session-based auth stored in localStorage (client-side)
- Fixed salt for password hashing: "phoenix-salt"
- No user-facing authentication (public catalog browsing)

**Data Models**
- Categories: Top-level organization (e.g., "VPS Hosting", "Dedicated Servers")
- Subcategories: Second-level organization within categories
- Plans: Individual hosting offerings with pricing, features, and popularity flags
- Settings: Global configuration (currency, links, hero content, feature descriptions)
- FAQs: Question/answer pairs for support page
- Team Members: Staff profiles for About page
- About Page Content: Customizable about page sections
- Admin Users: Administrative access credentials

### Build & Deployment

**Development Mode**
- Vite dev server with HMR
- Express backend runs on separate process
- Replit-specific plugins for development tooling

**Production Build**
- Client: Vite builds to `dist/public`
- Server: esbuild bundles to `dist/index.cjs` as CommonJS
- Selected dependencies bundled to reduce cold start times
- Static file serving from built client directory

**Deployment Targets**
- Primary: Netlify Functions (serverless architecture)
- Alternative: Traditional Node.js hosting
- Database: MySQL (compatible with various providers)

### API Structure

All API routes are prefixed with `/api`:

**Admin Authentication**
- `POST /api/admin/login` - Authenticate admin user
- `GET /api/admin/users` - List admin users
- `POST /api/admin/users` - Create admin user
- `PATCH /api/admin/users/:id` - Update admin password
- `DELETE /api/admin/users/:id` - Delete admin user

**Content Management**
- Categories: `GET|POST /api/categories`, `PATCH|DELETE /api/categories/:id`
- Subcategories: `GET|POST /api/subcategories`, `PATCH|DELETE /api/subcategories/:id`
- Plans: `GET|POST /api/plans`, `PATCH|DELETE /api/plans/:id`
- FAQs: `GET|POST /api/faqs`, `PATCH|DELETE /api/faqs/:id`
- Team Members: `GET|POST /api/team-members`, `PATCH|DELETE /api/team-members/:id`

**Settings & Content**
- `GET|PATCH /api/settings` - Global settings
- `GET|PATCH /api/about` - About page content

## External Dependencies

### Database
- **MySQL** - Relational database for all persistent data
  - Environment variables: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
  - Alternative: `DATABASE_URL` connection string (Drizzle config suggests Postgres support planned)
  - Uses connection pooling for performance

### UI Libraries
- **Radix UI** - Headless UI primitives (20+ components including Dialog, Dropdown, Accordion, etc.)
- **Shadcn/ui** - Pre-styled component library built on Radix
- **React Quill** - Rich text editor for admin content editing
- **Lucide React** - Icon library
- **React Icons** - Additional icons (Discord, Instagram, YouTube, etc.)

### Fonts (CDN)
- **Google Fonts** - Inter (UI font) and JetBrains Mono (monospace font)
- Loaded via CDN in `client/index.html`

### Deployment Platform
- **Netlify** - Serverless functions for API routes
  - Uses `@netlify/functions` package
  - Serverless MySQL adapter for database connections
  - CORS handling for cross-origin requests

### Development Tools
- **Vite** - Build tool and dev server
- **TypeScript** - Type checking
- **ESBuild** - Server bundling for production
- **Drizzle Kit** - Database migration tool (configured but not actively used)
- **Replit Plugins** - Development tooling for Replit environment

### Third-Party Services (Configurable)
- **Discord** - Support/community link (stored in settings)
- **Instagram** - Social media link (optional)
- **YouTube** - Social media link (optional)
- **Custom redirect link** - For "Order Now" buttons on plans