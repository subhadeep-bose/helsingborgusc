import { useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Registration = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    experience: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.email) {
      toast.error("Please fill in all required fields.");
      return;
    }
    toast.success("Registration submitted! We'll be in touch soon.");
    setForm({ firstName: "", lastName: "", email: "", phone: "", dob: "", experience: "", message: "" });
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
            <Label htmlFor="message">Anything else we should know?</Label>
            <Textarea id="message" name="message" value={form.message} onChange={handleChange} rows={3} />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-display tracking-wider uppercase py-3 rounded hover:brightness-110 transition"
          >
            Submit Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;
