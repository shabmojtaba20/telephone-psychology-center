import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn('Supabase environment variables are not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
}

export const supabase = createClient(
  supabaseUrl || 'https://auvcptwoixrpgwqahpcr.supabase.co',
  supabasePublishableKey || '',
);

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
