import { useCallback, useEffect, useState } from "react";
import { APP_VERSION } from "../constants/appVersion";
import { supabase } from "../lib/supabaseClient";

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

function isVersionOlder(current: string, latest: string): boolean {
  const currentParts = current.split(".").map(Number);
  const latestParts = latest.split(".").map(Number);
  const length = Math.max(currentParts.length, latestParts.length);

  for (let i = 0; i < length; i++) {
    const currentPart = currentParts[i] ?? 0;
    const latestPart = latestParts[i] ?? 0;

    if (currentPart < latestPart) return true;
    if (currentPart > latestPart) return false;
  }

  return false;
}

export function useAppVersion() {
  const [latestVersion, setLatestVersion] = useState(APP_VERSION);

  const checkVersion = useCallback(async () => {
    const { data, error } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "current_version")
      .maybeSingle();

    if (!error && data?.value) setLatestVersion(data.value);
  }, []);

  useEffect(() => {
    void checkVersion();
    const intervalId = window.setInterval(() => void checkVersion(), CHECK_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") void checkVersion();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [checkVersion]);

  return {
    currentVersion: APP_VERSION,
    latestVersion,
    updateAvailable: isVersionOlder(APP_VERSION, latestVersion),
    refresh: () => window.location.reload(),
  };
}
