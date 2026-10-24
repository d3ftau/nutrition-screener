import { createClient } from "@supabase/supabase-js";

// These are the Supabase project URL and *anon* publishable key, not
// secrets -- the anon key is designed to be embedded in a public client
// bundle and is only as safe as the RLS policies behind it (all three
// tables this app reads have anon-scoped, read-only SELECT policies;
// see autopantry's supabase/migrations/20260921030000_screener_public_read.sql).
// This is a different threat model from an AI provider key, which must
// never reach a client.
const SUPABASE_URL = "https://mdelaqxspebiiwcozhir.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_pIT2BtVd6Trq8YE3UJz54A_olblQTEz";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
