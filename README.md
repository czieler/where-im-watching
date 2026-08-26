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

The responsive application shell and core watchlist interactions are in place. The project currently uses sample watchlist data while persistent storage and authentication are being developed.

Current functionality includes:

- Responsive desktop and mobile layouts
- Collapsible watch-status sections
- Search by show title
- Filtering by watch status
- Data-driven filtering by streaming service
- Empty states when no shows match the current search or filters
- Clear search and reset-all-filter controls
- Light, Dark, and Blues themes
- Persistent theme preference using `localStorage`
- Collapsible desktop navigation
- Mobile settings menu
- Floating mobile Add Show action
- TV show search using the TVmaze API
- Debounced API searching to avoid unnecessary requests
- Search results with artwork, title, premiere year, and network/streaming information
- Add shows directly from TVmaze search results
- Edit a show's watch status and streaming service
- Move shows between watch-status sections
- Remove shows with confirmation before deletion
- Show artwork thumbnails with fallback placeholders
- Known streaming-service suggestions with support for custom service names
- Streaming-service filters automatically derived from services currently used in the watchlist
- Reusable confirmation modal for destructive actions
- Reusable styled form controls and comboboxes

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

Common controls and interaction patterns are extracted into reusable components rather than duplicating markup and behavior throughout the application. Examples include show lists, styled selects, service selection, Add/Edit Show workflows, and a configurable confirmation modal.

### Theming

The application uses CSS custom properties to keep theme styling separate from component logic.

Components use semantic CSS classes while each theme defines its own colors for backgrounds, surfaces, text, borders, accents, and interactive states.

The selected theme is stored in `localStorage`, allowing the preference to persist between browser sessions.

### TV Show Search

TV show search is powered by the TVmaze API.

Search requests are debounced so the application does not make an API request for every individual keystroke. Search results include available show artwork and basic metadata.

Selecting a result provides the metadata needed to add the show to the user's list, while artwork fallbacks handle titles for which an image is unavailable.

As persistent storage is added, shared show metadata can be cached by the application rather than repeatedly requesting information that changes infrequently.

### Streaming Services

Streaming services are treated as metadata associated with a watchlist entry rather than as a separately managed part of the application.

The Add/Edit workflow suggests a base set of known streaming services while allowing users to enter a custom service when needed.

The service filter is derived from the user's current watchlist, so only services actually associated with tracked titles appear as filtering options.

This avoids requiring users to separately maintain a list of streaming-service subscriptions.

### Headless UI

Headless UI is used for interactive controls such as the TV show search and streaming-service comboboxes.

Rather than manually recreating behaviors such as keyboard navigation, focus management, selection, and accessible combobox interactions, Headless UI provides those interaction primitives while allowing the application to retain complete control over its visual design.

This keeps the UI consistent with the application's custom theme system without introducing a heavily styled component library.

### State Updates

Watchlist changes use immutable React state updates rather than directly modifying existing arrays or objects.

Editing a show's status removes it from its previous status collection and adds the updated entry to the appropriate collection, allowing the UI to respond directly to the updated application state.

## Planned Features

### Authentication & Guest Mode

Authentication UX has been designed and is planned for an upcoming development phase.

Planned functionality includes:

- User sign up and sign in
- Forgot-password workflow
- Continue as guest without requiring an account
- Local persistence for guest watchlists
- Clear messaging that guest data is stored in the browser and may be lost if browser/site data is cleared
- Ability for a guest to create an account later without losing their existing watchlist
- Cross-device syncing for signed-in users
- Loading, validation, and authentication error states

The authentication screens shown in the project image are **design concepts and have not yet been implemented**.

### Persistent Data

- Supabase integration for authentication and persistent storage
- Persistent user watchlists
- Store user preferences
- Save theme preferences to the user's profile
- Database-backed watchlist data
- Shared show metadata and artwork references
- Cache show information to reduce unnecessary API requests
- Periodically refresh cached metadata when appropriate

### Show Tracking

- Update watching progress
- Track seasons and episodes
- Additional movie-specific metadata and workflows

### Streaming Services

- Expand the default list of commonly used streaming services
- Remember custom service names for future selection
- Continue deriving filtering options from services actually used in the watchlist

### Future Ideas

- New-season notifications for tracked shows
- Optional paid notifications without requiring a subscription
- Family or group shared watchlists
- Insights into which streaming services are actively being used based on current watch activity

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```
