# Where I'm Watching

A responsive React + TypeScript application for keeping track of TV shows across streaming services — including where you're watching them, which streaming profile you're using, and where you left off.

![Where I'm Watching application screenshots](src/assets/readme-screens.png)

## Why I Built It

Where I'm Watching started with a simple problem: **Where was I watching that show again?**

Streaming libraries are spread across services, household members may use different profiles on the same account, and it is easy to forget where a show lives or which episode you reached. Where I'm Watching provides one place to keep that information together.

The project is also a hands-on exploration of modern React and TypeScript development, reusable component design, authentication, cloud-backed persistence, third-party APIs, transactional email, and production-minded account/privacy flows.

## Current Features

- Responsive desktop and mobile layouts
- Watching, Want to Watch, Completed, and On Hold lists
- Search and filtering by title and streaming service
- TV show lookup and metadata through the TVmaze API
- Debounced API search with artwork and metadata results
- Add, edit, move, and remove watchlist entries
- Season and episode progress tracking
- Streaming service and optional streaming-profile tracking
- Expandable per-show notes
- Light, Dark, and Blues themes with persisted preferences
- Guest Mode with local browser persistence
- Supabase account creation, sign in, sign out, and persistent sessions
- Cloud-backed watchlist storage for authenticated users
- Guest-to-account watchlist migration with duplicate handling
- Email confirmation and password-recovery flows
- Branded authentication email delivery through Resend
- Change-password support
- Download My Data JSON export
- Secure account deletion through a Supabase Edge Function
- Help & FAQ
- Bug reports, feature requests, and general feedback delivered through a Supabase Edge Function and Resend
- Consistent required-field and error-state styling
- Reusable account layouts, feedback forms, success states, dialogs, form controls, and data tables

## Tech Stack

- **React** + **TypeScript**
- **Vite**
- **Supabase** — authentication, PostgreSQL persistence, Edge Functions
- **Resend** — transactional authentication and support email
- **TVmaze API** — TV search and metadata
- **Tailwind CSS** + **SCSS** + CSS custom properties
- **Headless UI** — accessible combobox interactions
- **Lucide React** — icons

## Architecture & Technical Highlights

### Reusable Component Design

The application favors reusable components over page-specific duplication. Shared pieces include form controls, data tables, confirmation dialogs, account-page layouts, feedback forms, illustrated message states, and feedback success states.

A separate `component-library` project is maintained alongside Where I'm Watching. Reusable controls from that project are integrated here while application-specific components remain focused on product behavior.

### Guest and Account Modes

Guest users can use the core watchlist without registering; their data is stored in `localStorage`. Authenticated users persist their watchlist in Supabase so it can be accessed independently of a particular browser.

When a guest later signs in or creates an account, the application can migrate the local watchlist into the authenticated account while handling duplicates.

### Authentication & Account Lifecycle

Supabase Auth provides account creation, email confirmation, sign in/out, persistent sessions, and password recovery. Resend is configured as the custom SMTP provider for branded authentication emails.

The project also implements production-oriented account lifecycle features: password changes, downloadable account data, and secure account deletion. Account deletion is performed server-side by a Supabase Edge Function rather than exposing administrative credentials to the browser.

### Feedback & Support

Bug reports, feature requests, and general feedback share reusable React form/success components. Submissions are sent to a Supabase Edge Function, which uses a restricted Resend API key stored as a server-side secret to deliver messages to the application's support address.

### Data Tables & Watchlist State

A reusable table component provides collapsible status sections, column headers, expandable rows, and optional detail content. Where I'm Watching uses row expansion for notes so additional information remains available without permanently crowding the primary list.

Watchlist changes use immutable React state updates. Changing a show's status moves the updated entry between status collections while keeping the UI synchronized with the active persistence mode.

### Theming

CSS custom properties define semantic colors for backgrounds, surfaces, borders, text, accents, and interactive states. The selected theme persists in `localStorage`, and theme-aware assets can switch with the application's selected theme.

### TV Show Search

TVmaze powers show search and metadata. Requests are debounced to avoid sending an API call for every keystroke. Search results provide artwork and useful metadata while fallback states handle missing images.

### Streaming Profiles

In addition to recording a streaming service, a show can optionally record the profile used within a shared account. This addresses cases where multiple people share one Netflix/Hulu/etc. subscription but maintain separate viewing profiles.

## Project Structure

```text
src/
  components/
    account/             Account, privacy, help, and feedback UI
    component-library/   Reusable form and data-display controls
    layout/              Sidebar and mobile navigation
    watchlist/           Watchlist-specific controls
  hooks/                 Reusable React hooks
  lib/                   Supabase client configuration
  services/              External API integrations
  types/                 Shared TypeScript types
  utils/                 Shared utilities
supabase/
  functions/
    delete-account/      Secure account/data deletion
    submit-feedback/     Server-side support email delivery
```

## Development

Create a local `.env.local` containing the public Supabase values required by the Vite application. Secrets such as service-role credentials and Resend API keys belong in Supabase/Resend configuration and are **not** stored in the client repository.

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Next Steps

The current focus is launch readiness rather than expanding the feature set. Planned work includes:

- Automated unit/component testing
- Additional accessibility and cross-browser testing
- Production hosting and domain configuration
- Privacy/support web pages for store listings
- Capacitor packaging for mobile distribution
- iOS release first via cloud iOS builds, TestFlight, and the Apple App Store
- Android/Google Play release using the same React/Capacitor codebase

Longer-term ideas include movie tracking, returning-season notifications, recommendation sharing, family/shared watchlists, and streaming-service usage insights.

## Project Goals

Where I'm Watching is intended to be both a useful product and a portfolio-quality demonstration of modern front-end engineering: responsive UI, reusable component architecture, API integration, authentication, persistent application state, serverless functions, account/privacy workflows, and incremental refactoring as a product grows.
