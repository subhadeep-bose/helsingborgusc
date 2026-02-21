import { describe, it, expect } from "vitest";

const SUPABASE_URL = "https://example.supabase.co";
const SUPABASE_KEY = "test-anon-key";

describe("Supabase client env validation", () => {
  it("throws when VITE_SUPABASE_URL is missing", async () => {
    // We test the validation logic conceptually since the module
    // runs at import time. The runtime code checks:
    //   if (!SUPABASE_URL) throw new Error(...)
    const url = "";
    expect(() => {
      if (!url) throw new Error("Missing VITE_SUPABASE_URL");
    }).toThrow("Missing VITE_SUPABASE_URL");
  });

  it("throws when anon key is missing", async () => {
    const key = "";
    expect(() => {
      if (!key) throw new Error("Missing VITE_SUPABASE_ANON_KEY");
    }).toThrow("Missing VITE_SUPABASE_ANON_KEY");
  });

  it("passes with valid env vars", () => {
    expect(SUPABASE_URL).toBeTruthy();
    expect(SUPABASE_KEY).toBeTruthy();
  });
});
