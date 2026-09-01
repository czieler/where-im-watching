import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!authorization || !supabaseUrl || !anonKey || !serviceRoleKey) return json({ error: "Server configuration error" }, 500);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return json({ error: "Not authenticated" }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: adminRow } = await admin.from("app_admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adminRow) return json({ error: "Not authorized" }, 403);

  const requestBody = await request.json() as {
    serviceId?: string;
    action?: "list" | "approve" | "reject" | "merge";
    mergeIntoId?: string;
  };

  if (requestBody.action === "list") {
    const { data, error } = await admin
      .from("streaming_services")
      .select("id, name, normalized_name, moderation_status, submitted_by_user_id, submission_count, created_at")
      .eq("moderation_status", "pending")
      .order("created_at", { ascending: true });
    if (error) return json({ error: "Unable to load services" }, 500);
    return json({ services: (data ?? []).map((service) => ({
      id: service.id,
      name: service.name,
      normalizedName: service.normalized_name,
      moderationStatus: service.moderation_status,
      submittedByUserId: service.submitted_by_user_id,
      submissionCount: service.submission_count,
      createdAt: service.created_at,
    })) });
  }

  const { serviceId, action, mergeIntoId } = requestBody;
  if (!serviceId || !action) return json({ error: "Invalid request" }, 400);

  const { data: source, error: sourceError } = await admin
    .from("streaming_services")
    .select("id, name")
    .eq("id", serviceId)
    .single();
  if (sourceError) return json({ error: "Service not found" }, 404);

  if (action === "approve") {
    const { error } = await admin
      .from("streaming_services")
      .update({ moderation_status: "verified", submitted_by_user_id: null, updated_at: new Date().toISOString() })
      .eq("id", serviceId);
    if (error) return json({ error: "Unable to approve service" }, 500);
    return json({ ok: true });
  }

  if (action === "reject") {
    const { error } = await admin
      .from("streaming_services")
      .update({ moderation_status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", serviceId);
    if (error) return json({ error: "Unable to keep service private" }, 500);
    return json({ ok: true });
  }

  if (!mergeIntoId || mergeIntoId === serviceId) return json({ error: "Invalid merge target" }, 400);
  const { data: target, error: targetError } = await admin
    .from("streaming_services")
    .select("id, name, moderation_status")
    .eq("id", mergeIntoId)
    .single();
  if (targetError || target.moderation_status !== "verified") return json({ error: "Merge target must be verified" }, 400);

  const { data: mappings, error: mappingsError } = await admin
    .from("user_streaming_services")
    .select("user_id")
    .eq("service_id", serviceId);
  if (mappingsError) return json({ error: "Unable to merge service" }, 500);

  if ((mappings ?? []).length > 0) {
    const { error: insertError } = await admin
      .from("user_streaming_services")
      .upsert((mappings ?? []).map((row) => ({ user_id: row.user_id, service_id: mergeIntoId })), { onConflict: "user_id,service_id" });
    if (insertError) return json({ error: "Unable to merge service" }, 500);
  }

  await admin.from("user_shows").update({ service: target.name }).ilike("service", source.name);
  const { error: deleteError } = await admin.from("streaming_services").delete().eq("id", serviceId);
  if (deleteError) return json({ error: "Unable to finish merge" }, 500);

  return json({ ok: true });
});
