import { supabase } from "../lib/supabaseClient";
import type { StreamingService } from "../types/streamingService";

export const GUEST_SERVICES_KEY = "guestStreamingServices";
export const LAST_SERVICE_KEY = "lastStreamingService";

export const FALLBACK_SERVICES = [
  "Netflix",
  "Hulu",
  "Max",
  "Apple TV+",
  "Paramount+",
  "Peacock",
  "Prime Video",
  "Disney+",
];

type ServiceRow = {
  id: string;
  name: string;
  normalized_name: string;
  moderation_status: "verified" | "pending" | "rejected";
  submitted_by_user_id: string | null;
  submission_count: number;
};

export type GuestServicePreferences = {
  version?: number;
  // `configured` means the guest intentionally changed at least one service
  // checkbox. `excludedServices` stores only explicit opt-outs so newly
  // verified services can automatically appear for guests.
  configured: boolean;
  // Legacy v1.1 selected-list storage. Kept only so older localStorage can be
  // migrated safely; version 4 no longer uses it as the source of truth.
  services: string[];
  customServices: string[];
  excludedServices: string[];
};

export function normalizeServiceName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function readGuestServicePreferences(): GuestServicePreferences {
  try {
    const raw = localStorage.getItem(GUEST_SERVICES_KEY);
    if (!raw) return { version: 4, configured: false, services: [], customServices: [], excludedServices: [] };

    const parsed = JSON.parse(raw) as Partial<GuestServicePreferences>;
    return {
      version: typeof parsed.version === "number" ? parsed.version : undefined,
      configured: parsed.configured === true,
      services: Array.isArray(parsed.services)
        ? parsed.services.filter((value): value is string => typeof value === "string")
        : [],
      customServices: Array.isArray(parsed.customServices)
        ? parsed.customServices.filter((value): value is string => typeof value === "string")
        : [],
      excludedServices: Array.isArray(parsed.excludedServices)
        ? parsed.excludedServices.filter((value): value is string => typeof value === "string")
        : [],
    };
  } catch {
    return { version: 4, configured: false, services: [], customServices: [], excludedServices: [] };
  }
}

export function writeGuestServicePreferences(preferences: GuestServicePreferences) {
  localStorage.setItem(
    GUEST_SERVICES_KEY,
    JSON.stringify({ ...preferences, version: 4 }),
  );
}

export async function fetchVisibleStreamingServices(): Promise<StreamingService[]> {
  const { data, error } = await supabase
    .from("streaming_services")
    .select(
      "id, name, normalized_name, moderation_status, submitted_by_user_id, submission_count",
    )
    .order("name", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as ServiceRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    normalizedName: row.normalized_name,
    moderationStatus: row.moderation_status,
    submittedByUserId: row.submitted_by_user_id,
    submissionCount: row.submission_count,
  }));
}

export async function fetchUserServiceIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_streaming_services")
    .select("service_id")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).map((row) => row.service_id as string);
}

export async function fetchServiceSettingsConfigured(userId: string) {
  const { data, error } = await supabase
    .from("user_service_settings")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function markServiceSettingsConfigured(userId: string) {
  const { error } = await supabase
    .from("user_service_settings")
    .upsert({ user_id: userId }, { onConflict: "user_id" });

  if (error) throw error;
}

export async function setUserServiceSelected(
  userId: string,
  serviceId: string,
  selected: boolean,
) {
  await markServiceSettingsConfigured(userId);

  if (selected) {
    const { error } = await supabase
      .from("user_streaming_services")
      .upsert(
        { user_id: userId, service_id: serviceId },
        { onConflict: "user_id,service_id" },
      );
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("user_streaming_services")
    .delete()
    .eq("user_id", userId)
    .eq("service_id", serviceId);
  if (error) throw error;
}

export async function submitCustomStreamingService(name: string) {
  const { data, error } = await supabase.functions.invoke("submit-service", {
    body: { name },
  });

  if (error) throw error;
  if (!data?.service) throw new Error("Service submission did not return a service.");

  return data.service as StreamingService;
}
