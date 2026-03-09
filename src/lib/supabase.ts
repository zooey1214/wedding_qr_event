import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vcwuwkzynzgmpkexshsh.supabase.co';
const supabaseKey = 'sb_publishable_ShaIrHCE_wbWlBsvCmFBeQ_NLGhYhil';

export const supabase = createClient(supabaseUrl, supabaseKey);
