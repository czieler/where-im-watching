import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type FeedbackBody = {
  type?: "bug" | "feature" | "feedback";
  fields?: Record<string, string>;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supportEmail = Deno.env.get("SUPPORT_EMAIL");
    if (!resendApiKey || !supportEmail) throw new Error("Feedback email configuration is missing.");

    const { type, fields } = (await req.json()) as FeedbackBody;
    if (!type || !fields) return new Response("Invalid request", { status: 400, headers: corsHeaders });

    const labels = { bug: "Bug Report", feature: "Feature Request", feedback: "General Feedback" } as const;
    const lines = Object.entries(fields).map(([key, value]) => `${key}: ${String(value)}`);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Where I'm Watching <support@czielerworks.app>",
        to: [supportEmail],
        subject: `[Where I'm Watching] ${labels[type]}`,
        text: `${labels[type]}\n\n${lines.join("\n\n")}`,
      }),
    });

    if (!response.ok) {
      console.error("Resend feedback send failed:", await response.text());
      return new Response("Unable to send feedback", { status: 502, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("submit-feedback failed:", error);
    return new Response("Unable to send feedback", { status: 500, headers: corsHeaders });
  }
});
