import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import {
  FALLBACK_SERVICES,
  fetchServiceSettingsConfigured,
  fetchUserServiceIds,
  fetchVisibleStreamingServices,
  normalizeServiceName,
  readGuestServicePreferences,
  setUserServiceSelected,
  submitCustomStreamingService,
  writeGuestServicePreferences,
} from "../services/streamingServices";
import type { StreamingService } from "../types/streamingService";

export type StreamingServiceMode = "guest" | "account";

type UseStreamingServicesArgs = {
  mode: StreamingServiceMode;
  user: User | null;
  watchlistServices: string[];
};

export function useStreamingServices({
  mode,
  user,
  watchlistServices,
}: UseStreamingServicesArgs) {
  const [services, setServices] = useState<StreamingService[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(
    new Set(),
  );
  const [, setGuestServices] = useState<string[]>(
    () => readGuestServicePreferences().services,
  );
  const [guestCustomServices, setGuestCustomServices] = useState<string[]>(
    () => readGuestServicePreferences().customServices,
  );
  const [guestExcludedServices, setGuestExcludedServices] = useState<string[]>(
    () => readGuestServicePreferences().excludedServices,
  );
  const [isConfigured, setIsConfigured] = useState(
    () => readGuestServicePreferences().configured,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingAdminCount, setPendingAdminCount] = useState(0);

  const load = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      if (mode === "guest") {
        const guestPreferences = readGuestServicePreferences();
        setGuestServices(guestPreferences.services);
        setGuestCustomServices(guestPreferences.customServices);
        setGuestExcludedServices(guestPreferences.excludedServices);
        setIsConfigured(guestPreferences.configured);

        try {
          const visible = await fetchVisibleStreamingServices();
          const verified = visible.filter(
            (service) => service.moderationStatus === "verified",
          );
          setServices(verified);

          // Version 4 stores explicit guest opt-outs instead of a frozen
          // snapshot of selected services. That means a service approved by an
          // admin becomes available to guests automatically, while services a
          // guest deliberately unchecked stay hidden.
          if (guestPreferences.version !== 4) {
            const verifiedNames = new Set(
              verified.map((service) => service.normalizedName),
            );
            const customServices = Array.from(
              new Map(
                guestPreferences.customServices
                  .concat(
                    guestPreferences.services.filter(
                      (name) => !verifiedNames.has(normalizeServiceName(name)),
                    ),
                  )
                  .map((name) => [normalizeServiceName(name), name]),
              ).values(),
            ).sort();

            // Older builds stored the entire selected catalog. We can safely
            // preserve explicit opt-outs for the original built-in services,
            // while allowing newly approved catalog entries to appear.
            const selectedLegacy = new Set(
              guestPreferences.services.map(normalizeServiceName),
            );
            const excludedServices = guestPreferences.configured
              ? FALLBACK_SERVICES.filter((name) =>
                  verifiedNames.has(normalizeServiceName(name)),
                )
                  .filter(
                    (name) => !selectedLegacy.has(normalizeServiceName(name)),
                  )
                  .map(normalizeServiceName)
              : [];

            const migrated = {
              version: 4,
              configured: excludedServices.length > 0,
              services: [],
              customServices,
              excludedServices,
            };
            writeGuestServicePreferences(migrated);
            setGuestServices([]);
            setGuestCustomServices(customServices);
            setGuestExcludedServices(excludedServices);
            setIsConfigured(excludedServices.length > 0);
          }
        } catch (guestCatalogError) {
          console.error(
            "Unable to load guest streaming-service catalog; using built-in fallback:",
            guestCatalogError,
          );
          setError(
            "Unable to refresh the streaming-service catalog right now.",
          );
          setServices(
            FALLBACK_SERVICES.map((name) => ({
              id: `fallback-${normalizeServiceName(name)}`,
              name,
              normalizedName: normalizeServiceName(name),
              moderationStatus: "verified" as const,
            })),
          );
        }

        setSelectedServiceIds(new Set());
        setIsAdmin(false);
        setPendingAdminCount(0);
        return;
      }

      if (!user) return;

      const [visible, selectedIds, configuredResult, adminResult] =
        await Promise.all([
          fetchVisibleStreamingServices(),
          fetchUserServiceIds(user.id),
          fetchServiceSettingsConfigured(user.id),
          supabase
            .from("app_admins")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle(),
        ]);

      setServices(visible);
      setSelectedServiceIds(new Set(selectedIds));

      // user_service_settings now means one thing only: the user intentionally
      // changed a checkbox on My Services. Adding/submitting a custom service
      // does not create this marker.
      setIsConfigured(configuredResult);

      const admin = Boolean(adminResult.data) && !adminResult.error;
      setIsAdmin(admin);
      if (admin) {
        const { count } = await supabase
          .from("streaming_services")
          .select("id", { count: "exact", head: true })
          .eq("moderation_status", "pending");
        setPendingAdminCount(count ?? 0);
      } else {
        setPendingAdminCount(0);
      }
    } catch (loadError) {
      console.error("Unable to load streaming services:", loadError);
      setError("Unable to load streaming services right now.");
      setServices(
        FALLBACK_SERVICES.map((name) => ({
          id: `fallback-${normalizeServiceName(name)}`,
          name,
          normalizedName: normalizeServiceName(name),
          moderationStatus: "verified" as const,
        })),
      );
    } finally {
      setIsLoading(false);
    }
  }, [mode, user]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const refreshWhenActive = () => {
      if (document.visibilityState === "visible") void load();
    };

    window.addEventListener("focus", refreshWhenActive);
    document.addEventListener("visibilitychange", refreshWhenActive);
    return () => {
      window.removeEventListener("focus", refreshWhenActive);
      document.removeEventListener("visibilitychange", refreshWhenActive);
    };
  }, [load]);

  const verifiedServices = useMemo(
    () => services.filter((service) => service.moderationStatus === "verified"),
    [services],
  );

  const selectedAccountServices = useMemo(
    () => services.filter((service) => selectedServiceIds.has(service.id)),
    [services, selectedServiceIds],
  );

  const personalServices = useMemo(() => {
    if (mode === "guest") {
      const excluded = new Set(guestExcludedServices.map(normalizeServiceName));
      const merged = new Map(
        verifiedServices
          .filter((service) => !excluded.has(service.normalizedName))
          .map((service) => [service.normalizedName, service.name]),
      );
      guestCustomServices.forEach((name) => {
        const normalized = normalizeServiceName(name);
        if (!excluded.has(normalized)) merged.set(normalized, name);
      });
      return Array.from(merged.values()).sort((a, b) => a.localeCompare(b));
    }
    return selectedAccountServices.map((service) => service.name);
  }, [
    guestCustomServices,
    guestExcludedServices,
    mode,
    selectedAccountServices,
    verifiedServices,
  ]);

  const manageableServices = useMemo(() => {
    const byName = new Map(
      services.map((service) => [service.normalizedName, service]),
    );
    if (mode === "guest") {
      const guestVisibleNames = guestCustomServices;
      guestVisibleNames.forEach((name) => {
        const normalizedName = normalizeServiceName(name);
        if (!byName.has(normalizedName)) {
          byName.set(normalizedName, {
            id: `guest-${normalizedName}`,
            name,
            normalizedName,
            moderationStatus: "rejected" as const,
          });
        }
      });
    }
    return Array.from(byName.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [guestCustomServices, mode, services]);

  const effectiveServices = useMemo(() => {
    // Guests always start with the full verified catalog plus any private
    // custom services they added. Only an explicit checkbox change on My
    // Services narrows that list.
    if (mode === "guest") return personalServices;
    if (isConfigured) return personalServices;

    const merged = new Map(
      verifiedServices.map((service) => [service.normalizedName, service.name]),
    );
    watchlistServices
      .filter(Boolean)
      .forEach((name) => merged.set(normalizeServiceName(name), name));
    // A custom/pending service selected by this account must remain usable even
    // before the user explicitly customizes the standard service checklist.
    selectedAccountServices.forEach((service) =>
      merged.set(service.normalizedName, service.name),
    );
    return Array.from(merged.values()).sort((a, b) => a.localeCompare(b));
  }, [
    isConfigured,
    mode,
    personalServices,
    selectedAccountServices,
    verifiedServices,
    watchlistServices,
  ]);

  const toggleService = useCallback(
    async (service: StreamingService, selected: boolean) => {
      setError("");

      try {
        if (mode === "guest") {
          const current = readGuestServicePreferences();
          const excluded = new Set(
            current.excludedServices.map(normalizeServiceName),
          );

          if (selected) excluded.delete(service.normalizedName);
          else excluded.add(service.normalizedName);

          const nextExcluded = Array.from(excluded).sort();
          writeGuestServicePreferences({
            configured: nextExcluded.length > 0,
            services: [],
            customServices: current.customServices,
            excludedServices: nextExcluded,
          });
          setGuestServices([]);
          setGuestExcludedServices(nextExcluded);
          setIsConfigured(nextExcluded.length > 0);
          return;
        }

        if (!user) throw new Error("Sign in to manage services.");
        await setUserServiceSelected(user.id, service.id, selected);
        setSelectedServiceIds((current) => {
          const next = new Set(current);
          if (selected) next.add(service.id);
          else next.delete(service.id);
          return next;
        });
        setIsConfigured(true);
      } catch (toggleError) {
        console.error("Unable to update streaming service:", toggleError);
        setError("Unable to update your streaming services.");
        throw toggleError;
      }
    },
    [mode, user, verifiedServices],
  );

  const addCustomService = useCallback(
    async (rawName: string) => {
      const name = rawName.trim().replace(/\s+/g, " ");
      if (!name) return;

      const existing = services.find(
        (service) => service.normalizedName === normalizeServiceName(name),
      );

      if (existing) {
        await toggleService(existing, true);
        return;
      }

      if (mode === "guest") {
        const current = readGuestServicePreferences();
        const customByNormalized = new Map(
          current.customServices.map((value) => [
            normalizeServiceName(value),
            value,
          ]),
        );
        customByNormalized.set(normalizeServiceName(name), name);
        const customServices = Array.from(customByNormalized.values()).sort();

        const excluded = current.excludedServices.filter(
          (value) => normalizeServiceName(value) !== normalizeServiceName(name),
        );

        writeGuestServicePreferences({
          configured: excluded.length > 0,
          services: [],
          customServices,
          excludedServices: excluded,
        });
        setGuestCustomServices(customServices);
        setGuestExcludedServices(excluded);
        setIsConfigured(excluded.length > 0);
        return;
      }

      if (!user) throw new Error("Sign in to submit a streaming service.");
      const submitted = await submitCustomStreamingService(name);
      setServices((current) => {
        const withoutDuplicate = current.filter(
          (service) => service.id !== submitted.id,
        );
        return [...withoutDuplicate, submitted].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
      });
      setSelectedServiceIds((current) => new Set(current).add(submitted.id));
      // Adding a custom service is not the same as intentionally narrowing My
      // Services. Keep the existing configured state unchanged. The custom
      // service is included in effectiveServices via selectedAccountServices.
    },
    [mode, services, toggleService, user, verifiedServices],
  );

  const ensureService = useCallback(
    async (name: string) => {
      const normalized = normalizeServiceName(name);
      const service = services.find(
        (item) => item.normalizedName === normalized,
      );

      if (service) {
        if (mode === "account" && selectedServiceIds.has(service.id)) return;
        if (mode === "guest") {
          const current = readGuestServicePreferences();
          const excluded = new Set(
            current.excludedServices.map(normalizeServiceName),
          );
          const available = [
            ...verifiedServices.map((item) => item.name),
            ...current.customServices,
          ].filter((item) => !excluded.has(normalizeServiceName(item)));
          if (
            available.some((item) => normalizeServiceName(item) === normalized)
          )
            return;
        }
        await toggleService(service, true);
        return;
      }

      await addCustomService(name);
    },
    [
      addCustomService,
      mode,
      selectedServiceIds,
      services,
      toggleService,
      verifiedServices,
    ],
  );

  return {
    services,
    manageableServices,
    verifiedServices,
    personalServices,
    effectiveServices,
    isConfigured,
    isLoading,
    isAdmin,
    pendingAdminCount,
    error,
    toggleService,
    addCustomService,
    ensureService,
    refresh: load,
  };
}
