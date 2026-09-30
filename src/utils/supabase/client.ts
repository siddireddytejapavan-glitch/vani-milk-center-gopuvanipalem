import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://saeeiphkhzpbujbmmiux.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_FqHtWjyAP8JN-WNXGRAobA_QGlQBddl';

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
