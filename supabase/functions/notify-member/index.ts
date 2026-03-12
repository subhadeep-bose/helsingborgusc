import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MemberRecord {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  status: string;
  experience_level: string | null;
  registered_at: string;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE";
  table: string;
  record: MemberRecord;
  old_record: MemberRecord | null;
}

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

    const payload: WebhookPayload = await req.json();
    const { type, record, old_record } = payload;

    // New registration → notify admins
    if (type === "INSERT" && record.status === "pending") {
      await notifyAdminsNewRegistration(record, RESEND_API_KEY);
    }

    // Status changed → notify member
    if (type === "UPDATE" && old_record && old_record.status !== record.status) {
      if (record.status === "approved") {
        await notifyMemberApproved(record, RESEND_API_KEY);
      } else if (record.status === "rejected") {
        await notifyMemberRejected(record, RESEND_API_KEY);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-member error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getAdminEmails(): Promise<string[]> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Get admin user_ids from user_roles
  const { data: roles } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");

  if (!roles || roles.length === 0) return [];

  // Get emails from members table for those user_ids
  const adminUserIds = roles.map((r: { user_id: string }) => r.user_id);
  const { data: members } = await supabase
    .from("members")
    .select("email")
    .in("user_id", adminUserIds);

  return members?.map((m: { email: string }) => m.email) ?? [];
}

async function sendEmail(
  to: string[],
  subject: string,
  html: string,
  apiKey: string
) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Helsingborg United SC <onboarding@resend.dev>",
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Resend error:", res.status, body);
    throw new Error(`Resend API error: ${res.status}`);
  }

  return res.json();
}

async function notifyAdminsNewRegistration(
  member: MemberRecord,
  apiKey: string
) {
  const adminEmails = await getAdminEmails();
  if (adminEmails.length === 0) {
    console.log("No admin emails found, skipping notification");
    return;
  }

  const name = `${member.first_name} ${member.last_name ?? ""}`.trim();
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1a3a2a; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #c9a84c; margin: 0; font-size: 20px;">🏏 New Member Registration</h1>
      </div>
      <div style="background: #f9f9f9; padding: 20px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="color: #333; margin: 0 0 16px;">A new member has registered and is awaiting approval:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 120px;">Name:</td><td style="padding: 8px 0; color: #333; font-weight: 600;">${name}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0; color: #333;">${member.email}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Experience:</td><td style="padding: 8px 0; color: #333;">${member.experience_level ?? "Not specified"}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Registered:</td><td style="padding: 8px 0; color: #333;">${new Date(member.registered_at).toLocaleDateString("en-GB")}</td></tr>
        </table>
        <div style="margin-top: 20px; text-align: center;">
          <a href="https://helsingborgusc.lovable.app/admin/members" 
             style="display: inline-block; background: #1a3a2a; color: #c9a84c; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Review in Admin Panel →
          </a>
        </div>
      </div>
    </div>
  `;

  await sendEmail(adminEmails, `New Registration: ${name}`, html, apiKey);
  console.log(`Admin notification sent to ${adminEmails.length} admin(s)`);
}

async function notifyMemberApproved(member: MemberRecord, apiKey: string) {
  const name = member.first_name;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1a3a2a; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #c9a84c; margin: 0; font-size: 20px;">🎉 Welcome to Helsingborg United SC!</h1>
      </div>
      <div style="background: #f9f9f9; padding: 20px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="color: #333; margin: 0 0 12px;">Hi ${name},</p>
        <p style="color: #333; margin: 0 0 12px;">Great news! Your membership application has been <strong style="color: #16a34a;">approved</strong>. You're now officially part of the Helsingborg United family! 🏏</p>
        <p style="color: #333; margin: 0 0 16px;">You can now create an account and log in to access member features.</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://helsingborgusc.lovable.app/auth" 
             style="display: inline-block; background: #1a3a2a; color: #c9a84c; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Create Your Account →
          </a>
        </div>
        <p style="color: #666; font-size: 13px; margin: 16px 0 0;">See you on the pitch! 🏏</p>
      </div>
    </div>
  `;

  await sendEmail([member.email], "Welcome to Helsingborg United SC! ✅", html, apiKey);
  console.log(`Approval notification sent to ${member.email}`);
}

async function notifyMemberRejected(member: MemberRecord, apiKey: string) {
  const name = member.first_name;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1a3a2a; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #c9a84c; margin: 0; font-size: 20px;">Helsingborg United SC — Membership Update</h1>
      </div>
      <div style="background: #f9f9f9; padding: 20px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="color: #333; margin: 0 0 12px;">Hi ${name},</p>
        <p style="color: #333; margin: 0 0 12px;">Thank you for your interest in joining Helsingborg United SC. Unfortunately, your membership application could not be approved at this time.</p>
        <p style="color: #333; margin: 0 0 16px;">If you have any questions, please feel free to reach out to us through our contact page.</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://helsingborgusc.lovable.app/contact" 
             style="display: inline-block; background: #1a3a2a; color: #c9a84c; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  `;

  await sendEmail([member.email], "Helsingborg United SC — Membership Update", html, apiKey);
  console.log(`Rejection notification sent to ${member.email}`);
}
