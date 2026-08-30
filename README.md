# Where I'm Watching

A responsive React application for keeping track of TV shows across streaming services.

![Where I'm Watching application screenshots](src/assets/readme-screens.png)

## About

Where I'm Watching is designed to answer a surprisingly annoying question:

> Where was I watching that show again?

The app provides one place to track what you're watching, what you want to watch, what you've completed, where you're streaming it, and how far you've gotten.

It supports both guest and authenticated use. Guests can maintain a watchlist locally without creating an account, while signed-in users can save and sync their watchlist using Supabase.

This is also a personal learning project I'm using to expand my front-end experience with React, TypeScript, and other modern web development tools.

## Current Status

🚧 **Work in progress**

The core watchlist experience, responsive UI, authentication, and data persistence are in place. Development is continuing with additional account features, testing, and launch preparation.

Current functionality includes:

- Responsive desktop and mobile layouts
- Collapsible watch-status sections
- Table-based watchlists with section titles and column headers
- Expandable show details and notes
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
- Edit existing watchlist entries
- Track season and episode progress
- Move shows between Watching, Want to Watch, Completed, and On Hold
- Track the streaming service used for each show
- Optionally record which profile within a shared streaming account is being used
- Add optional notes to individual shows
- Expand or collapse notes directly from the watchlist
- Remove shows with confirmation before deletion
- Show artwork thumbnails with fallback placeholders
- Known streaming-service suggestions with support for custom service names
- Streaming-service filters automatically derived from services currently used in the watchlist
- Reusable confirmation modal for destructive actions
- Reusable form controls, tables, selects, text inputs, textareas, and interaction patterns
- Supabase authentication and persistent watchlist storage
- User sign up and sign in
- Email confirmation for new accounts
- Forgot-password workflow
- Guest mode without requiring an account
- Local guest watchlist persistence using `localStorage`
- Guest watchlist migration when signing into an account
- Cross-device watchlist storage for authenticated users
- Sign out and returning-user sign in
- Account navigation with Profile, Help & Feedback, and Privacy & Data
- Guest-mode messaging explaining local-only storage and account benefits
- Theme-aware Coming Soon experiences for features still in development

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

The application is built around reusable React components rather than duplicating markup and behavior throughout individual features.

Common form and data-display patterns have been extracted into reusable components, including text inputs, selects, textareas, tables, confirmation dialogs, navigation elements, and other interaction patterns.

A separate component-library project is also being developed alongside Where I'm Watching. Components from that library are used within the application so reusable UI behavior can be developed independently of application-specific features and styling.

Application-specific components remain responsible for Where I'm Watching behavior, while lower-level reusable components handle common presentation and interaction concerns.

### Data Tables

Watchlist sections use a reusable table component that supports both section headers and column headers.

Each watch status — Currently Watching, Want to Watch, Completed, and On Hold — is represented as a collapsible section while retaining consistent column-based presentation for show information.

Individual rows can also be expanded independently. Where I'm Watching uses this behavior to display optional show notes without requiring notes to occupy permanent space in the primary table layout.

### Theming

The application uses CSS custom properties to keep theme styling separate from component logic.

Components use semantic CSS classes while each theme defines its own colors for backgrounds, surfaces, text, borders, accents, and interactive states.

The selected theme is stored in `localStorage`, allowing the preference to persist between browser sessions.

Theme-aware assets can also adapt to the selected application theme rather than relying solely on the operating system's color preference.

### TV Show Search

TV show search is powered by the TVmaze API.

Search requests are debounced so the application does not make an API request for every individual keystroke. Search results include available show artwork and basic metadata.

Selecting a result provides the metadata needed to add the show to the user's list, while artwork fallbacks handle titles for which an image is unavailable.

### Streaming Services and Profiles

Streaming services are treated as metadata associated with an individual watchlist entry rather than as a separately managed part of the application.

The Add/Edit workflow suggests a base set of known streaming services while allowing users to enter a custom service when needed.

The service filter is derived from the user's current watchlist, so only services actually associated with tracked titles appear as filtering options.

A watchlist entry can also optionally record which profile within a shared streaming account is being used. For example, two people sharing a Netflix account may watch shows under separate profiles. Recording the profile with the show makes it easier to return to the correct watch history later.

This avoids requiring users to separately maintain streaming subscriptions or household accounts while still capturing the information needed to find a show again.

### Show Progress and Notes

Individual watchlist entries can store season and episode progress so users can remember where they stopped watching.

Shows can also include optional free-form notes. Notes remain out of the primary table layout until a row is expanded, keeping the watchlist compact while allowing additional information to be stored when useful.

If an expanded show has no notes, the interface provides a muted empty state rather than leaving the expanded area blank.

### Headless UI

Headless UI is used for interactive controls such as TV show search and streaming-service selection.

Rather than manually recreating behaviors such as keyboard navigation, focus management, selection, and accessible combobox interactions, Headless UI provides those interaction primitives while allowing the application to retain control over its visual design.

This keeps the UI consistent with the application's custom theme system without introducing a heavily styled third-party component library.

### State Updates

Watchlist changes use immutable React state updates rather than directly modifying existing arrays or objects.

Editing a show's status removes it from its previous status collection and adds the updated entry to the appropriate collection, allowing the UI to respond directly to updated application state.

### Guest and Account Modes

The application supports both guest and authenticated usage without maintaining separate versions of the watchlist interface.

Guest users can begin using the application immediately without creating an account. Their watchlist is persisted locally in the browser using `localStorage`.

Authenticated users store their watchlist in Supabase, allowing their data to persist independently of a specific browser and be accessed across devices.

When a guest later signs in or creates an account, the application can offer to bring the existing local watchlist into the authenticated account. Migration includes duplicate handling so existing account data is not unnecessarily duplicated.

Authentication state and data persistence are kept separate from the main watchlist UI so the same application components can support either storage mode.

### Authentication

Authentication is implemented using Supabase Auth.

The application supports:

- Account creation
- Email confirmation
- Sign in
- Sign out
- Password recovery
- Persistent authenticated sessions

Guest mode remains separate from Supabase authentication, allowing users to evaluate and use the application before deciding whether they want an account.

## Planned Features

### Account & Privacy

- Download or export account data
- Secure account deletion
- Additional authentication validation and error handling
- Customized authentication email branding using a transactional email provider
- Store additional user preferences in the account profile

### Streaming Services

- Expand the default list of commonly used streaming services
- Remember custom service names for future selection
- Continue deriving filtering options from services actually used in the watchlist

### Testing & Application Quality

- Add automated unit and component testing
- Expand validation and error handling
- Continue accessibility review
- Additional responsive and cross-browser testing

### Possible Future Features

- Movie tracking in addition to TV shows
- New-season and returning-show notifications
- Optional notification-based premium features
- Share show recommendations with friends or family
- Family or shared watchlists
- Additional support for profiles within shared streaming accounts
- Insights into which streaming services are actively being used
- Additional show metadata caching and periodic refresh

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

## Project Goals

Where I'm Watching is being developed as both a useful application and an ongoing React/TypeScript learning project.

The project emphasizes:

- Building reusable components rather than one-off UI
- Separating application behavior from reusable presentation components
- Responsive design across desktop and mobile layouts
- Accessible interaction patterns
- Practical API integration
- Guest and authenticated data flows
- Persistent cloud-backed application state
- Incremental development and refactoring as the application grows
