import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase client (API routes, admin operations)
// Uses service role key — bypasses RLS, never expose to client
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
