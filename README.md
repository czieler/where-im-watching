# Where I'm Watching

A responsive web app for keeping track of TV shows and movies across streaming services.

![Where I'm Watching application screenshots](src/assets/readme-screens.png)

## About

Where I'm Watching is designed to answer a surprisingly annoying question:

> Where was I watching that show again?

The app provides one place to track what you're watching, what you want to watch, what you've completed, and which streaming service you're using for each title.

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
- Persistent theme preference using `localStorage`
- Collapsible desktop navigation
- Mobile navigation and settings menu
- TV show search using the TVmaze API
- Debounced API searching to avoid unnecessary requests
- Search results with artwork, title, premiere year, and network/streaming information
- Add shows directly from TVmaze search results
- Show artwork thumbnails with fallback placeholders
- Remove shows with confirmation before deletion
- Reusable confirmation modal for destructive actions

The application currently uses sample watchlist data while the UI and application structure are being developed. Persistent storage and user accounts are planned.

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

Common controls and interaction patterns are extracted into reusable components rather than duplicating markup and behavior throughout the application. Examples include styled selects, show lists, the Add Show workflow, and a configurable confirmation modal.

### Theming

The application uses CSS custom properties to keep theme styling separate from component logic.

Components use semantic CSS classes while each theme defines its own colors for backgrounds, surfaces, text, borders, accents, and interactive states.

The selected theme is stored in `localStorage`, allowing the preference to persist between browser sessions.

### TV Show Search

TV show search is powered by the TVmaze API.

Search requests are debounced so the application does not make an API request for every individual keystroke. Search results include available show artwork and basic metadata.

Selecting a result provides the metadata needed to add the show to the user's list, while artwork fallbacks handle titles for which an image is unavailable.

As persistent storage is added, shared show metadata can be cached by the application rather than repeatedly requesting information that changes infrequently.

### Headless UI

Headless UI is used for complex interactive controls such as the TV show search combobox.

Rather than manually recreating behaviors such as keyboard navigation, focus management, selection, and accessible combobox interactions, Headless UI provides those interaction primitives while allowing the application to retain complete control over its visual design.

This keeps the UI consistent with the application's custom theme system without introducing a heavily styled component library.

### State Updates

Watchlist changes use immutable React state updates rather than directly modifying existing arrays or objects.

This keeps state changes predictable and aligns the application's UI patterns with modern React development practices.

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
- Track seasons and episodes
- Notify users when new seasons become available

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
- Supabase integration for authentication and persistent storage

### Streaming Services

- Provide a default list of common streaming services
- Allow users to add custom streaming services
- Manage the services a user subscribes to
- Filter watchlists by service
- Help identify services that may no longer be needed based on current watch activity

### Future Ideas

- New-season notifications for tracked shows
- Optional paid notifications without requiring a subscription
- Family or group shared watchlists

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```
