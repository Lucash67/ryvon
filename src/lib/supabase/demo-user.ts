import type { User } from "@supabase/supabase-js";

export const DEMO_USER: User = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "lucas@fitness-os.local",
  app_metadata: {},
  user_metadata: { name: "Lucas" },
  aud: "authenticated",
  created_at: new Date(0).toISOString(),
  role: "authenticated",
  updated_at: new Date(0).toISOString(),
};
