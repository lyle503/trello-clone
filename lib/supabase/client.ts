// This would be fine if we were using Supabase's built-in authentication
// However, we are using Clerk for this, so we built SupabaseProvider
// This file is no longer used, but keeping for reference

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
