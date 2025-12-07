# PHEONIX Cloud Hosting - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from modern hosting/SaaS platforms like Vercel, Netlify, and Digital Ocean that balance professionalism with approachability. PHEONIX Cloud should project reliability and technical expertise while remaining accessible.

**Key Principle**: Clean, performance-focused design that mirrors the product promise—fast, reliable hosting.

## Typography

**Font System**: 
- Primary: Inter or DM Sans (via Google Fonts CDN) - clean, technical aesthetic
- Headings: 700 weight for impact, 600 for subheadings
- Body: 400 weight, 500 for emphasis
- Code/Technical: JetBrains Mono for technical specifications, pricing details

**Scale**:
- Hero headline: text-5xl md:text-6xl lg:text-7xl
- Section headers: text-3xl md:text-4xl
- Card titles: text-xl md:text-2xl
- Body: text-base md:text-lg
- Small text: text-sm

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistency
- Section padding: py-16 md:py-24 lg:py-32
- Component spacing: gap-8 md:gap-12
- Card padding: p-6 md:p-8
- Container max-width: max-w-7xl for content sections

**Grid Structure**: 
- Plans page: 3-column grid on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Feature sections: 2-column split for content/image pairs
- Admin dashboard: Sidebar + main content (w-64 sidebar, flex-1 main)

## Component Library

### Navigation
**Main Header**: Fixed top navigation with logo left, menu center, theme switcher + CTA right. Include subtle backdrop blur when scrolling. Responsive hamburger menu on mobile.

**Theme Switcher**: Toggle button with sun/moon icons (Heroicons), positioned in header. Smooth transition between themes (transition-colors duration-200).

### Home Page Structure

**Hero Section** (80vh min-height):
- Large hero image showing abstract cloud infrastructure/data center aesthetics with gradient overlay
- Headline + supporting text stacked left-aligned or centered
- Primary CTA "View Plans" + Secondary "Learn More" buttons with backdrop-blur-md bg-opacity treatment over image
- Floating stats bar (uptime %, customers, servers) positioned at bottom of hero

**Features Section**: 
- 3-column grid showcasing key features (Performance, Security, Support)
- Icon (Heroicons) + title + description card pattern
- Elevated cards with subtle shadow and border

**Pricing Teaser**: 
- Horizontal scroll of 3 featured plans on mobile, grid on desktop
- "See All Plans" CTA linking to Plans page

**Trust Section**:
- Customer logos grid (2x4 layout)
- Large testimonial card with customer photo, quote, attribution

**Final CTA**: 
- Full-width section with compelling headline
- Discord redirect button (large, prominent)

### Plans Page

**Category Navigation**: 
- Horizontal tabs or segmented control for categories
- Nested dropdown for subcategories within active category
- Sticky navigation as user scrolls

**Plan Cards**:
- Pricing prominently displayed (large text-4xl)
- Feature list with checkmark icons
- "Order Now" button (Discord redirect)
- "Most Popular" badge treatment for featured plans
- Comparison table view toggle option

### Admin Panel

**Dashboard Layout**:
- Sidebar navigation (Categories, Subcategories, Plans, Settings)
- Breadcrumb navigation in header
- Data tables with search, filter, sort capabilities
- Modal forms for add/edit operations
- Success/error toast notifications

**Forms**:
- Clean, spacious input fields (h-12 inputs)
- Label above input pattern
- Inline validation feedback
- Primary/secondary button patterns

### Support Page

**Hero**: Large heading "How Can We Help?" with search bar
- FAQ accordion sections (expandable panels)
- Contact cards grid (Email, Discord, Documentation)
- Each contact method in elevated card with icon

### Legal Pages (Terms/Privacy)

**Layout**: 
- Single column max-w-4xl centered
- Hierarchical heading structure (h1 → h6)
- Generous line-height (leading-relaxed) for readability
- Table of contents sidebar on desktop (sticky positioned)

## Animations

**Minimal Approach**:
- Theme transition: transition-colors duration-200
- Card hovers: subtle lift (hover:-translate-y-1) + shadow increase
- Button interactions: scale and opacity only
- Page transitions: fade-in on load (optional)
- NO scroll-triggered animations or parallax effects

## Images

**Hero Image**: Full-width abstract visualization of cloud infrastructure—server racks, data streams, or abstract geometric patterns representing connectivity. Use gradient overlay (orange-tinted) for text legibility.

**Feature Sections**: Iconography only, no additional images to maintain fast loading

**Support Page**: Consider icon-based illustrations for contact methods rather than photos

## Accessibility & Theme Implementation

- Maintain WCAG AA contrast ratios in both themes
- All interactive elements keyboard navigable
- Focus visible states on all inputs and buttons
- Theme preference stored in localStorage
- Semantic HTML throughout (nav, main, section, article)
- ARIA labels for theme switcher and mobile menu

## Mobile Optimization

- Touch targets minimum 44px height
- Simplified navigation (hamburger menu)
- Stacked layouts for all multi-column sections
- Larger text sizes for readability
- Plan cards: horizontal scroll on mobile, grid on tablet+

This design balances technical credibility with modern web aesthetics, ensuring PHEONIX Cloud appears professional, fast, and trustworthy—qualities essential for a hosting provider.