# iOS Deployment Model

The Capacitor iOS app is configured to load the hosted production web app:

`https://wiw.czielerworks.app`

## What requires a Render deploy only

Normal React / TypeScript / CSS / UI / business-logic changes can be deployed to Render. Once Render is live, the iOS shell will load the updated hosted application without a new TestFlight build.

## What still requires a new TestFlight / App Store build

A new native build is still required when changing:

- `capacitor.config.ts`
- Capacitor plugins
- iOS entitlements or permissions
- native icons or splash assets
- native Swift / Objective-C code
- signing / bundle configuration
- other native-shell behavior

## Current migration note

Because the existing TestFlight build was created before the hosted-server setting was added, **one more TestFlight build is required** to ship this new Capacitor configuration. After that build is installed, normal web-app updates can come from Render.
