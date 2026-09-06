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

export async function fetchAvailableSlots() {
  const { data, error } = await supabase
    .from('appointment_slots')
    .select(`
      id,
      psychologist_id,
      starts_at,
      ends_at,
      duration_minutes,
      price,
      psychologists!inner (
        professional_title,
        years_experience,
        status
      )
    `)
    .eq('status', 'AVAILABLE')
    .eq('psychologists.status', 'APPROVED')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at')
    .limit(50);

  if (error) throw error;
  return data ?? [];
}

export async function startAppointment(slotId) {
  if (!slotId) throw new Error('slot_id_required');

  const { data, error } = await supabase.functions.invoke('payment-start', {
    body: { slot_id: slotId },
  });

  if (error) throw error;
  if (!data?.ok || !data?.appointment_id) {
    throw new Error(data?.error || 'booking_failed');
  }

  return data;
}

export async function startAppointmentPayment(appointmentId, gateway) {
  if (!appointmentId) throw new Error('appointment_id_required');

  const body = { appointment_id: appointmentId };
  if (gateway) body.gateway = gateway;

  const { data, error } = await supabase.functions.invoke('payment-start-v4', {
    body,
  });

  if (error) throw error;
  if (!data?.ok || !data?.payment_url) {
    throw new Error(data?.error || 'payment_start_failed');
  }

  return data;
}

export async function sendLoginLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function subscribeToAuth(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session));
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
