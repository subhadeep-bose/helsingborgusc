import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

const Registration = () => {
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    placeOfBirth: "",
    experience: "",
    referralSource: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.email) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!consent) {
      toast.error("Please agree to the privacy policy before registering.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("members").insert({
      first_name: form.firstName,
      last_name: form.lastName || null,
      email: form.email,
      phone: form.phone || null,
      date_of_birth: form.dob || null,
      place_of_birth: form.placeOfBirth || null,
      experience_level: form.experience || null,
      referral_source: form.referralSource || null,
      message: form.message || null,
    });
    setLoading(false);

    if (error) {
      toast.error("Registration failed. Please try again.");
      return;
    }

    toast.success("Registration submitted! Your application is pending admin approval.");
    setForm({ firstName: "", lastName: "", email: "", phone: "", dob: "", placeOfBirth: "", experience: "", referralSource: "", message: "" });
    setConsent(false);
  };

  return (
    <div>
      <PageHeader title="Join Us" subtitle="Register to become a member of Helsingborg United SC" />
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" name="dob" type="date" value={form.dob} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="placeOfBirth">Place of Birth</Label>
            <Input id="placeOfBirth" name="placeOfBirth" placeholder="e.g. Malmö, Sweden" value={form.placeOfBirth} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience">Cricket Experience</Label>
            <select
              id="experience"
              name="experience"
              value={form.experience}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body"
            >
              <option value="">Select level</option>
              <option value="beginner">Beginner — never played</option>
              <option value="casual">Casual — played a few times</option>
              <option value="intermediate">Intermediate — regular player</option>
              <option value="advanced">Advanced — competitive experience</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="referralSource">How did you hear about us?</Label>
            <select
              id="referralSource"
              name="referralSource"
              value={form.referralSource}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-body"
            >
              <option value="">Select an option</option>
              <option value="friend">Friend or family</option>
              <option value="social_media">Social media</option>
              <option value="search_engine">Google / search engine</option>
              <option value="event">Saw us at an event</option>
              <option value="flyer">Flyer or poster</option>
              <option value="news">News article</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Anything else we should know?</Label>
            <Textarea id="message" name="message" value={form.message} onChange={handleChange} rows={3} />
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              I agree to the{" "}
              <Link to="/privacy" className="text-primary hover:underline" target="_blank">
                Privacy Policy
              </Link>{" "}
              and consent to my data being processed as described. *
            </Label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-display tracking-wider uppercase py-3 rounded hover:brightness-110 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Registration"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;
