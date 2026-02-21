import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Turnstile } from "react-turnstile";
import { Mail, Send, MapPin, Instagram } from "lucide-react";
import SEO from "@/components/SEO";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    if (TURNSTILE_SITE_KEY && !captchaToken) {
      toast.error("Please complete the CAPTCHA verification.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: result.data.name,
      email: result.data.email,
      subject: result.data.subject,
      message: result.data.message,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Failed to send your message. Please try again.");
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div>
        <SEO
          title="Contact Us"
          description="Get in touch with Helsingborg United Sports Club."
          path="/contact"
        />
        <PageHeader
          title="Contact Us"
          subtitle="We'd love to hear from you"
        />
        <div className="container mx-auto px-4 py-20 max-w-lg text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Send size={28} className="text-primary" />
          </div>
          <h2 className="font-display text-2xl text-foreground mb-3">
            Message Sent!
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Thank you for reaching out. We'll get back to you as soon as
            possible.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({ name: "", email: "", subject: "", message: "" });
              setCaptchaToken(null);
            }}
            className="mt-8 inline-flex items-center gap-2 bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase px-6 py-3 rounded hover:brightness-110 transition"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SEO
        title="Contact Us"
        description="Get in touch with Helsingborg United Sports Club. Send us a message about membership, events, or anything cricket-related."
        path="/contact"
      />
      <PageHeader
        title="Contact Us"
        subtitle="Have a question? Send us a message"
      />
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* ── Left: Contact Info Card ──────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-2xl p-8 space-y-8 sticky top-24">
              <div>
                <h2 className="font-display text-xl text-foreground tracking-wide mb-1">
                  Get in Touch
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Have questions about membership, training, or anything
                  cricket-related? We'd love to hear from you.
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-sm text-foreground mb-0.5">Email</p>
                    <a
                      href="mailto:helsingborgunitedsc@gmail.com"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors break-all"
                    >
                      helsingborgunitedsc@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-sm text-foreground mb-0.5">Location</p>
                    <p className="text-sm text-muted-foreground">
                      Helsingborg, Sweden
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Instagram size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-display text-sm text-foreground mb-0.5">Instagram</p>
                    <a
                      href="https://www.instagram.com/helsingborgunitedsc/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      @helsingborgunitedsc
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fill out the form and we'll reply to your email within 48 hours. For urgent matters, email us directly.
                </p>
              </div>
            </div>
          </div>

          {/* ── Right: Contact Form ──────────────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl p-8">
              <h2 className="font-display text-xl text-foreground tracking-wide mb-6">
                Send a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="e.g. Membership enquiry"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Tell us what's on your mind…"
                    required
                  />
                </div>

                {TURNSTILE_SITE_KEY && (
                  <div className="flex justify-center">
                    <Turnstile
                      sitekey={TURNSTILE_SITE_KEY}
                      onVerify={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken(null)}
                      theme="dark"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase py-3 rounded-lg hover:brightness-110 transition disabled:opacity-50"
                >
                  <Send size={16} />
                  {submitting ? "Sending…" : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
