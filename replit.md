# Phoenix Cloud Hosting - Project Overview

## Overview

Phoenix Cloud is a modern cloud hosting platform featuring a public-facing website with pricing plans and an admin dashboard for content management. The application provides a clean, professional interface for showcasing hosting services organized by categories and subcategories, with support for multiple currencies (USD/INR) and light/dark themes.

**Core Purpose**: A marketing and sales platform for cloud hosting services that allows administrators to manage hosting plans, categories, and settings through a dedicated admin panel, while customers browse plans and contact support via Discord.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool
- Single-page application with client-side routing via Wouter
- Component-based architecture following shadcn/ui design system
- Tailwind CSS for styling with custom theme configuration supporting light/dark modes

**State Management**:
- React Context API for global state (Theme, Currency, Authentication)
- TanStack Query for server state management and caching
- Local storage for persistence of user preferences (theme, currency, auth status)

**Rationale**: This approach provides a modern development experience with excellent performance. shadcn/ui components are chosen for their flexibility and accessibility, while Tailwind enables rapid UI development matching the design guidelines inspired by platforms like Vercel and Netlify.

### Backend Architecture

**Server Framework**: Express.js with TypeScript
- RESTful API architecture serving JSON responses
- Monolithic server handling both API routes and static file serving
- Development mode includes Vite middleware for HMR

**Data Flow**:
- Frontend makes API calls to `/api/*` endpoints
- Server processes requests and interfaces with storage layer
- Responses formatted as JSON for client consumption

**Rationale**: Express provides a minimal, flexible foundation. The monolithic approach simplifies deployment while keeping code organized through clear separation between routes, storage, and static serving.

### Data Storage

**Primary Storage**: MySQL Database (External)
- Connected to external MySQL server at panel.sriyannodes.cloud
- Stores categories, subcategories, plans, settings, admin users, about page content, and team members
- Custom `MySQLStorage` class implementing `IStorage` interface
- Database tables created automatically on initialization

**Database Tables**:
- `categories` - Hosting plan categories
- `subcategories` - Sub-categories within each category
- `plans` - Individual hosting plans with pricing
- `settings` - Site-wide configuration (links, hero content, features)
- `admin_users` - Admin panel user accounts
- `faqs` - Frequently asked questions
- `about_page_content` - About page text content and settings
- `team_members` - Team member profiles for About page

**Schema Configuration**:
- Drizzle Zod schemas in `shared/schema.ts` for validation
- Type definitions for all data models

**Database Configuration**:
- Connection uses environment variables when available
- Fallback to configured MySQL credentials for external database
- Connection pooling with automatic reconnection

**Rationale**: MySQL database provides reliable persistent storage for the application data. The external database hosting allows for independent database management and scaling.

### Authentication & Authorization

**Admin Authentication**:
- Simple username/password authentication for admin panel
- Passwords hashed using Node.js crypto.scryptSync with salt
- Session state stored in localStorage (client-side)
- No session management on server (stateless design)

**Security Approach**:
- Admin routes protected via `AuthContext` and `ProtectedRoute` wrapper
- Password verification using timing-safe comparison
- No JWT or session tokens (basic security for admin-only features)

**Limitations**: Current auth is basic and not suitable for production multi-user scenarios. Suitable for single-admin or trusted-admin environments.

**Rationale**: Minimal authentication sufficient for the admin dashboard use case. For a production environment with multiple admins or customer logins, this should be replaced with proper session management or JWT-based authentication.

### External Dependencies

**UI Component Library**:
- shadcn/ui (Radix UI primitives) for accessible, customizable components
- Component configuration in `components.json` with New York style variant

**Styling**:
- Tailwind CSS with custom color system supporting theme switching
- Google Fonts: Inter (primary), JetBrains Mono (technical/code text)

**Third-Party Services**:
- Discord for customer support and sales (redirect links configured in settings)
- No payment processing integrated (handled externally via Discord)

**Asset Management**:
- Static assets stored in `attached_assets/` directory
- Vite alias `@assets` for importing assets in components
- Legal documents (ToS, Privacy Policy) stored as text files and rendered in React components

**Build & Development Tools**:
- Vite for frontend bundling and development server
- esbuild for server-side bundling in production
- TypeScript across the entire stack
- Custom build script (`script/build.ts`) for production builds

**Hosting Considerations**:
- Application designed for platforms like Replit (includes Replit-specific Vite plugins)
- Environment variable `DATABASE_URL` required if switching to PostgreSQL
- Production build outputs to `dist/` with separate public and server bundles

**Rationale**: Modern tooling choices prioritize developer experience and performance. Vite provides fast HMR, while the component library ensures consistency and accessibility. External service integration via Discord aligns with the target audience (tech-savvy hosting customers).

## Recent Changes

### About Us Page (November 2025)
- Added new About Us page accessible via /about route
- Page includes hero section, company info, story section, vision/mission, team members display, and statistics
- All content is fully manageable through the Admin Dashboard
- Admin panel includes "About Management" tab for editing:
  - Hero section (title, subtitle, background image)
  - Company information (name, description, address, email)
  - Story section with years of experience
  - Vision and mission statements
  - Team section titles
  - Four statistics with customizable values and labels
  - Team member management (add, edit, delete with name, role, image, order)
- Navigation updated to include About Us link between Plans and Support