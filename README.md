# Where I'm Watching

**A responsive watchlist for remembering what you're watching, where you're watching it, and where you left off.**

[Live app](https://wiw.czielerworks.app) · [Architecture & workflows](ARCHITECTURE.md) · [iOS deployment model](docs/IOS_DEPLOYMENT.md)

![Where I'm Watching desktop and mobile screenshots](src/assets/readme-screens.png)

## Overview

Where I'm Watching started with a simple problem: **Where was I watching that show again?**

Streaming libraries are spread across services, household members may use different profiles, and it is easy to lose track of a show's service or viewing progress. The app brings that information together in one place.

The project is also a portfolio demonstration of modern front-end engineering: React and TypeScript, reusable UI components, responsive design, authentication, cloud persistence, third-party APIs, serverless functions, transactional email, privacy/account workflows, and a Capacitor iOS release.

## Highlights

- Responsive desktop and mobile watchlists with Watching, Want to Watch, Completed, and On Hold sections
- TV show search and metadata through TVmaze with debounced autocomplete
- Season/episode progress, streaming service, streaming profile, and expandable notes
- Search/filtering plus a two-column mobile table optimized for **Show Info + Actions**
- Guest Mode with local persistence and Account Mode with Supabase-backed sync
- Guest-to-account migration with duplicate handling
- My Services preferences, remembered last-used service, and custom service submission
- Admin moderation for submitted services: approve, merge, or reject
- Supabase authentication, branded Resend email, password recovery/change, data export, and secure account deletion
- Help/FAQ plus bug reports, feature requests, and general feedback
- Light, Dark, and Blues themes with persisted preferences
- Reusable form controls, dialogs, account layouts, feedback states, and responsive data tables
- Hosted Capacitor iOS shell tested through TestFlight
- Database-backed deployment version awareness

## Tech Stack

| Area | Technology |
| --- | --- |
| Front end | React 19, TypeScript, Vite |
| UI | Tailwind CSS, SCSS, CSS custom properties, Headless UI, Lucide React |
| Backend | Supabase Auth, PostgreSQL, Row Level Security, Edge Functions |
| External services | TVmaze API, Resend |
| Mobile | Capacitor 8, iOS, TestFlight |
| Delivery | Render for the hosted app, Codemagic for native iOS builds |

## Architecture

The production React application is hosted at `https://wiw.czielerworks.app`. Browser users load it directly, and the Capacitor iOS shell loads the same production URL. That keeps normal web and iPhone releases on the same React application version.

Guest watchlists live in `localStorage`. Authenticated users persist their watchlist and service preferences in Supabase. Supabase Edge Functions handle operations that should not expose privileged credentials to the browser, including account deletion, feedback delivery, and streaming-service moderation workflows.

See [ARCHITECTURE.md](ARCHITECTURE.md) for database, application, moderation, and release diagrams.

## Product & Engineering Details

### Guest and account modes

Users can try the core watchlist without registering. If a guest later creates an account or signs in, the app can migrate the local watchlist into Supabase while respecting the database's duplicate rules.

### Streaming-service catalog

Verified services are shared across users while My Services stores each user's preferences. Missing services can be submitted without immediately exposing unverified values globally. Administrators can approve a submission, merge it into an existing service, or reject it.

### Account lifecycle and privacy

Supabase Auth handles registration, confirmation, sessions, and password recovery. The app also supports password changes, downloadable JSON account data, and secure account deletion through an Edge Function.

### Responsive component design

Reusable components cover forms, comboboxes, dialogs, account-page layouts, feedback states, and data tables. On mobile, the watchlist intentionally collapses to **Show Info** and **Actions**; progress, service, and profile move into Show Info rather than forcing horizontal scrolling.

### Accessibility

The UI uses semantic labels for form controls and icon-only actions, keyboard-visible focus states, ARIA state for expandable content, accessible modal/dialog behavior with focus management, and current-page state in primary navigation.

### Deployment awareness

The frontend has an application version and Supabase stores the deployed version in `app_config`. Version components are compared numerically so `1.2` and `1.2.0` are equivalent and a newer client cannot be prompted to downgrade.

## iOS / Capacitor

The repository includes a Capacitor iOS shell using bundle identifier `com.czielerworks.whereimwatching`. It loads the hosted production application, so normal React/TypeScript/UI releases are delivered through Render without another TestFlight build.

A new Codemagic/TestFlight/App Store build is still required for native-shell changes such as Capacitor configuration or plugins, iOS permissions/entitlements, signing, native code, or native icons/splash assets.

Authentication callbacks use:

```text
com.czielerworks.whereimwatching://auth/callback
```

See [docs/IOS_DEPLOYMENT.md](docs/IOS_DEPLOYMENT.md) for the release workflow.

## Project Structure

```text
src/
  components/
    account/             Account, privacy, help, and feedback UI
    admin/               Streaming-service moderation
    component-library/   Reusable form and data-display controls
    layout/              Sidebar and mobile navigation
    roadmap/             In-app roadmap
    services/            My Services UI
    system/              Application-level system UI
    watchlist/           Watchlist filters and controls
  constants/             Application constants/version
  hooks/                 Reusable React hooks
  lib/                   Supabase client configuration
  services/              API/data-service modules
  types/                 Shared TypeScript types
  utils/                 Shared utilities and native helpers
supabase/
  functions/             Edge Functions
  migrations/            Versioned database changes
docs/
  diagrams/              Maintainable diagram source files
  images/                Rendered architecture diagrams
  IOS_DEPLOYMENT.md      Hosted-web vs native-build release rules
```

## Local Development

Create `.env.local` using `.env.example` as a template:

```text
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Keep service-role credentials, Resend keys, and other secrets in their server-side provider configuration rather than the client repository.

```text
npm install
npm run dev
npm run build
npm run lint
```

## Database / Edge Function Setup

Database changes are versioned under `supabase/migrations/`. Edge Functions include:

- `submit-service` — service submission and moderation notification
- `admin-services` — authenticated admin moderation
- `submit-feedback` — support/feedback email delivery
- `delete-account` — secure account/data deletion

The deployed application version is stored in `public.app_config` where `key = 'current_version'` and the release number is stored in `value`.

## Current Release Status

The hosted web app is live and the hosted-mode iPhone shell is working through TestFlight. Version 1.2 is being polished for App Store submission.

Near-term follow-up work includes targeted automated tests, a deeper accessibility regression pass, privacy-conscious guest usage analytics, new-season notifications, and Android/Google Play packaging.

## Project Goal

Where I'm Watching is intended to be both a useful product and a portfolio-quality example of building and evolving a production-minded front-end application: responsive UX, reusable component architecture, API integration, authentication, persistent state, serverless workflows, account/privacy features, release management, accessibility, and iterative refactoring based on real-device testing.
