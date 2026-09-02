import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { supabase } from "../lib/supabaseClient";

async function handleAuthCallback(url: string) {
  const callbackUrl = new URL(url);
  const hash = callbackUrl.hash.startsWith("#")
    ? callbackUrl.hash.slice(1)
    : callbackUrl.hash;
  const params = new URLSearchParams(hash || callbackUrl.search);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return;
  }

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    console.error("Unable to complete the email sign-in link.", error);
    return;
  }

  if (params.get("type") === "recovery") {
    window.dispatchEvent(new Event("wiw:native-password-recovery"));
  }
}

export async function initializeNativeApp(): Promise<() => void> {
  if (!Capacitor.isNativePlatform()) {
    return () => undefined;
  }

  await StatusBar.setOverlaysWebView({ overlay: false });
  await StatusBar.setStyle({ style: Style.Default });

  const listeners: PluginListenerHandle[] = [];
  listeners.push(
    await CapacitorApp.addListener("appUrlOpen", ({ url }) => {
      if (url.startsWith("com.czielerworks.whereimwatching://auth/callback")) {
        void handleAuthCallback(url);
      }
    }),
  );

  const launchUrl = await CapacitorApp.getLaunchUrl();
  if (launchUrl?.url) {
    await handleAuthCallback(launchUrl.url);
  }

  return () => {
    listeners.forEach((listener) => void listener.remove());
  };
}
