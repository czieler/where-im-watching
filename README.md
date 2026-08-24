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

The application currently uses sample show data while the UI and application structure are being developed.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- SCSS
- CSS custom properties
- Lucide React icons

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

- Search for TV shows and movies using an external media API
- Retrieve show metadata and artwork
- Cache show information locally to reduce unnecessary API requests
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

## UI & Theming

The application uses CSS custom properties to keep theme styling separate from component logic.

Components use semantic CSS classes while each theme defines its own colors for backgrounds, surfaces, text, borders, accents, and interactive states.

The selected theme is currently stored in `localStorage`, allowing the preference to persist between browser sessions.

## Development

Install dependencies:

```bash
npm install
```
