import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://auvcptwoixrpgwqahpcr.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Ok1ZjFucbbzeh0Q38flQog_e6XaNg6M';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

export async function fetchSpecialties() {
  const { data, error } = await supabase
    .from('specialties')
    .select('id,name,slug,description')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

export async function fetchApprovedPsychologists() {
  const { data, error } = await supabase
    .from('psychologists')
    .select('id,professional_title,bio,years_experience,therapy_methods,consultation_types,phone_price,phone_duration')
    .eq('status', 'APPROVED')
    .order('created_at');

  if (error) throw error;
  return data ?? [];
}
