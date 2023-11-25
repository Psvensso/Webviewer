import { createClient } from "@supabase/supabase-js";
export const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_APP_URL,
  import.meta.env.VITE_SUPABASE_API_ANO_KEY
);
