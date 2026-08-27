# Where I'm Watching

A responsive web app for keeping track of TV shows across streaming services.

![Where I'm Watching application screenshots](src/assets/readme-screens.png)

## About

Where I'm Watching is designed to answer a surprisingly annoying question:

> Where was I watching that show again?

The app provides one place to track what you're watching, what you want to watch, what you've completed, and which streaming service you're using for each title.

This is also a personal learning project I'm using to expand my front-end experience with React, TypeScript, and other modern web development tools.

## Current Status

🚧 **Work in progress**

The responsive application shell, core watchlist interactions, and authentication flow are in place. The project currently uses sample watchlist data while guest and account-based persistence are being developed.

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
- Supabase authentication
- User sign up and sign in
- Email confirmation for new accounts
- Forgot-password workflow
- Guest mode without requiring an account
- Sign out and returning-user sign in
- Account navigation with Profile, Help & Feedback, and Privacy & Data
- Guest-mode messaging explaining local-only storage and account benefits
- Theme-aware Coming Soon experience for features still in development

## Tech Stack

- React
- TypeScript
- Vite
- Supabase
- Tailwind CSS
- SCSS
- CSS custom properties
- Lucide React icons
- Headless UI
- TVmaze API

## Technical Decisions

### Component-Based UI

Reusable React components are used for application UI and repeated interaction patterns.

Common controls and interaction patterns are extracted into reusable components rather than duplicating markup and behavior throughout the application. Examples include show lists, styled selects, service selection, Add/Edit Show workflows, account navigation, confirmation dialogs, and a configurable Coming Soon experience.

### Theming

The application uses CSS custom properties to keep theme styling separate from component logic.

Components use semantic CSS classes while each theme defines its own colors for backgrounds, surfaces, text, borders, accents, and interactive states.

The selected theme is stored in `localStorage`, allowing the preference to persist between browser sessions.

Theme-aware assets can also adapt to the selected application theme rather than relying on the operating system's color preference.

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

### Guest and Account Modes

The application supports both guest and authenticated usage.

Guest users can explore the application without creating an account. Guest watchlist data will be persisted locally in the browser, while authenticated users will use Supabase-backed storage for cross-device access.

Authentication state is kept separate from watchlist behavior so the same application UI can support both modes without maintaining separate guest and signed-in versions of the application.

Account-related navigation is isolated into reusable components and only receives the account-specific state and navigation information it requires.

### Authentication

Authentication is implemented using Supabase Auth.

The application supports account creation, email confirmation, sign in, sign out, password recovery, and persistent authenticated sessions.

Guest mode is maintained separately from Supabase authentication so users can use the application without creating an account and later choose to sign in or create one.

## Planned Features

### Guest & Account Data Persistence

Supabase has been integrated for authentication. Watchlist persistence is the next development phase.

Planned functionality includes:

- Local persistence for guest watchlists using `localStorage`
- Supabase-backed watchlists for signed-in users
- Migration of an existing guest watchlist when creating an account
- Cross-device watchlist syncing for authenticated users
- Store user preferences
- Save theme preferences to the user's profile
- Shared show metadata and artwork references
- Cache show information to reduce unnecessary API requests
- Periodically refresh cached metadata when appropriate

### Account & Privacy

- Download or export account data
- Secure account deletion
- Additional authentication validation and error handling
- Customized authentication email branding using a transactional email provider

### Show Tracking

- Update watching progress
- Track seasons and episodes

### Streaming Services

- Expand the default list of commonly used streaming services
- Remember custom service names for future selection
- Continue deriving filtering options from services actually used in the watchlist

### Possible Future Features

- Movie tracking in addition to TV shows
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
