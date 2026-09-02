import { Capacitor } from "@capacitor/core";

export const NATIVE_AUTH_CALLBACK =
  "com.czielerworks.whereimwatching://auth/callback";

export function getAuthRedirectUrl() {
  return Capacitor.isNativePlatform()
    ? NATIVE_AUTH_CALLBACK
    : window.location.origin;
}
