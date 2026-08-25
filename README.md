# Where I'm Watching

A responsive web app for keeping track of TV shows and movies across streaming services.

## About

Where I'm Watching is designed to answer a surprisingly annoying question:

> Where was I watching that show again?

The app provides one place to track what you're watching, what you want to watch, what you've completed, and which streaming service each title is available on.

This is also a personal learning project I'm using to expand my front-end experience with React, TypeScript, and other modern web development tools.

## Current Status

🚧 **Work in progress**

The responsive application shell is in place and several core UI features are working.

Current functionality includes:

- Responsive desktop and mobile layouts
- Collapsible watch-status sections
- Search by show title
- Filtering by watch status
- Filtering by streaming service
- Empty states when no shows match the current search or filters
- Clear search and reset-all-filter controls
- Light, Dark, and Blues themes
- Persistent theme preference using localStorage
- Collapsible desktop navigation
- Mobile navigation and settings menu
- TV show search using the TVmaze API
- Debounced API searching to avoid unnecessary requests
- Show search results with artwork, title, premiere year, and network/streaming information

The application currently uses sample watchlist data while the UI and application structure are being developed.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- SCSS
- CSS custom properties
- Lucide React icons
- Headless UI
- TVmaze API

## Technical Decisions

### Component-Based UI

Reusable React components are used for application UI and repeated interaction patterns.

For example, the application includes a reusable `PrettyPlaceholderInput` component that encapsulates floating-label input behavior rather than duplicating the required markup and styling throughout the application.

### Theming

The application uses CSS custom properties to keep theme styling separate from component logic.

Components use semantic CSS classes while each theme defines its own colors for backgrounds, surfaces, text, borders, accents, and interactive states.

The selected theme is stored in `localStorage`, allowing the preference to persist between browser sessions.

### TV Show Search

TV show search is powered by the TVmaze API.

Search requests are debounced so the application does not make an API request for every individual keystroke. Search results include available show artwork and basic metadata.

As persistent storage is added, shared show metadata can be cached by the application rather than repeatedly requesting information that changes infrequently.

### Headless UI

Headless UI is used for complex interactive controls such as the TV show search combobox.

Rather than manually recreating behaviors such as keyboard navigation, focus management, selection, and accessible combobox interactions, Headless UI provides those interaction primitives while allowing the application to retain complete control over its visual design.

This keeps the UI consistent with the application's custom theme system without introducing a heavily styled component library.

## Planned Features

### Show Tracking

- Add and edit TV shows and movies
- Track titles by status:
  - Watching
  - Want to Watch
  - Completed
  - On Hold
- Track which streaming service a title is being watched on
- Update watching progress

### Show Search & Metadata

- Select shows from TVmaze-powered search results
- Store shared show metadata and artwork references
- Cache show information to reduce unnecessary API requests
- Periodically refresh cached metadata when appropriate

### Accounts & Data

- User accounts and authentication
- Persistent user watchlists
- Store user preferences
- Save theme preferences to the user's profile
- Database-backed show and service data

### Streaming Services

- Manage the streaming services a user subscribes to
- Filter watchlists by service
- Help identify services that may no longer be needed based on current watch activity

## Development

Install dependencies:

```bash
npm install
```
