const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
supabase.storage
  .listBuckets()
  .then((data) => console.log(JSON.stringify(data.data)))
  .catch(console.error);
