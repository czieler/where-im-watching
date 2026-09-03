# iOS Deployment Model

The installed Capacitor iOS app is a native shell configured to load the hosted production application:

`https://wiw.czielerworks.app`

## Render deploy only

A new TestFlight/App Store build is **not** needed for normal hosted-app changes such as:

- React / TypeScript code
- SCSS / Tailwind styling
- UI and responsive-layout changes
- ordinary business logic
- Supabase-backed feature behavior that does not add native requirements

Commit and push through SourceTree, then allow Render to deploy the updated hosted app.

## New native build required

Use Codemagic and App Store Connect when changing native-shell behavior such as:

- `capacitor.config.ts`
- Capacitor plugins
- iOS permissions or entitlements
- native Swift / Objective-C code
- app icons or splash assets
- signing, bundle, or other native project configuration

## Version checking

The app reads the deployed version from Supabase `app_config` where `key = 'current_version'`. Version comparison is semantic/numeric rather than raw string inequality, so `1.2` and `1.2.0` are equivalent and a newer running version will not be told to downgrade.
