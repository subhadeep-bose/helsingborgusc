import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Turnstile } from "react-turnstile";
import { Mail, Send } from "lucide-react";
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
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-start gap-3">
              <Mail size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-display text-sm text-foreground">Email</p>
                <a
                  href="mailto:helsingborgunitedsc@gmail.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  helsingborgunitedsc@gmail.com
                </a>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Or use the form and we'll reply to your email.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="md:col-span-2 space-y-5"
          >
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
                rows={5}
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
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase py-3 rounded hover:brightness-110 transition disabled:opacity-50"
            >
              <Send size={16} />
              {submitting ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
