import {createClient} from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;
const supabasePubKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseClient = createClient(
    supabaseUrl,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

export default supabaseClient;