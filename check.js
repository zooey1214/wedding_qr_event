const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vcwuwkzynzgmpkexshsh.supabase.co', 'sb_publishable_ShaIrHCE_wbWlBsvCmFBeQ_NLGhYhil');
supabase.storage.listBuckets().then(data => console.log(JSON.stringify(data.data))).catch(console.error);
