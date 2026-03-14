import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { alt, uploaderName } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get admin emails
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      console.log("No admins found, skipping notification");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminUserIds = roles.map((r: { user_id: string }) => r.user_id);
    const { data: members } = await supabase
      .from("members")
      .select("email")
      .in("user_id", adminUserIds);

    const adminEmails = members?.map((m: { email: string }) => m.email) ?? [];
    if (adminEmails.length === 0) {
      console.log("No admin emails found");
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1a3a2a; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #c9a84c; margin: 0; font-size: 20px;">📷 New Gallery Photo Submitted</h1>
        </div>
        <div style="background: #f9f9f9; padding: 20px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #333; margin: 0 0 16px;">A member has submitted a new photo for gallery review:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666; width: 120px;">Submitted by:</td><td style="padding: 8px 0; color: #333; font-weight: 600;">${uploaderName || "A member"}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Description:</td><td style="padding: 8px 0; color: #333;">${alt || "No description"}</td></tr>
          </table>
          <div style="margin-top: 20px; text-align: center;">
            <a href="https://helsingborgusc.lovable.app/admin/gallery" 
               style="display: inline-block; background: #1a3a2a; color: #c9a84c; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
              Review in Admin Panel →
            </a>
          </div>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Helsingborg United SC <onboarding@resend.dev>",
        to: adminEmails,
        subject: `📷 New Gallery Photo for Review`,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend error:", res.status, body);
      throw new Error(`Resend API error: ${res.status}`);
    }

    console.log(`Gallery notification sent to ${adminEmails.length} admin(s)`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-gallery error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
