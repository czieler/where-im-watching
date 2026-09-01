import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!authorization || !supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "Server configuration error" }, 500);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return json({ error: "Not authenticated" }, 401);

  const { name: rawName } = (await request.json()) as { name?: string };
  const name = rawName?.trim().replace(/\s+/g, " ");
  if (!name || name.length > 100) return json({ error: "Invalid service name" }, 400);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const normalizedName = normalize(name);

  const { data: existing, error: existingError } = await admin
    .from("streaming_services")
    .select("id, name, normalized_name, moderation_status, submitted_by_user_id, submission_count")
    .eq("normalized_name", normalizedName)
    .maybeSingle();
  if (existingError) return json({ error: "Unable to check service" }, 500);

  let service = existing;
  let created = false;

  if (!service) {
    const { data, error } = await admin
      .from("streaming_services")
      .insert({
        name,
        normalized_name: normalizedName,
        moderation_status: "pending",
        submitted_by_user_id: user.id,
        submission_count: 1,
      })
      .select("id, name, normalized_name, moderation_status, submitted_by_user_id, submission_count")
      .single();
    if (error) return json({ error: "Unable to add service" }, 500);
    service = data;
    created = true;
  } else if (service.moderation_status !== "verified") {
    const nextStatus = service.moderation_status === "rejected" ? "pending" : service.moderation_status;
    const { data: updatedService, error: updateError } = await admin
      .from("streaming_services")
      .update({
        moderation_status: nextStatus,
        submission_count: service.submission_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", service.id)
      .select("id, name, normalized_name, moderation_status, submitted_by_user_id, submission_count")
      .single();
    if (updateError) return json({ error: "Unable to update service submission" }, 500);
    service = updatedService;
    created = service.moderation_status === "pending" && existing.moderation_status === "rejected";
  }

  const { error: mappingError } = await admin
    .from("user_streaming_services")
    .upsert({ user_id: user.id, service_id: service.id }, { onConflict: "user_id,service_id" });
  if (mappingError) return json({ error: "Unable to save service preference" }, 500);

  if (created) {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supportEmail = Deno.env.get("SUPPORT_EMAIL");
    if (resendApiKey && supportEmail) {
      const mailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Where I'm Watching <support@czielerworks.app>",
          to: [supportEmail],
          subject: `[Where I'm Watching] New streaming service: ${name}`,
          text: `A user submitted a new streaming service for review.\n\nService: ${name}\n\nOpen the Admin > Pending Services screen to approve, merge, or keep it private.`,
        }),
      });
      if (!mailResponse.ok) console.error("Unable to send service-review email:", await mailResponse.text());
    }
  }

  return json({
    service: {
      id: service.id,
      name: service.name,
      normalizedName: service.normalized_name,
      moderationStatus: service.moderation_status,
      submittedByUserId: service.submitted_by_user_id,
      submissionCount: service.submission_count,
    },
  });
});
