import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://auvcptwoixrpgwqahpcr.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Ok1ZjFucbbzeh0Q38flQog_e6XaNg6M6';
export const supabase = createClient(supabaseUrl, supabasePublishableKey);

export async function fetchSpecialties() { const { data, error } = await supabase.from('specialties').select('id,name,slug,description').eq('is_active', true).order('name'); if (error) throw error; return data ?? []; }
export async function fetchApprovedPsychologists() { const { data, error } = await supabase.from('psychologists').select('id,professional_title,bio,years_experience,therapy_methods,consultation_types,phone_price,phone_duration').eq('status', 'APPROVED').order('created_at'); if (error) throw error; return data ?? []; }
export async function fetchAvailableSlots() { const { data, error } = await supabase.from('appointment_slots').select(`id,psychologist_id,starts_at,ends_at,duration_minutes,price,psychologists!inner (professional_title,years_experience,status)`).eq('status', 'AVAILABLE').eq('psychologists.status', 'APPROVED').gte('starts_at', new Date().toISOString()).order('starts_at').limit(50); if (error) throw error; return data ?? []; }

export async function requestCashPayment(slotId) {
  if (!slotId) throw new Error('slot_id_required');
  const { data, error } = await supabase.rpc('request_cash_payment', { p_slot_id: slotId });
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.appointment_id) throw new Error('cash_payment_request_failed');
  return result;
}

export async function startAppointment(slotId) {
  if (!slotId) throw new Error('slot_id_required');
  const { data: booking, error: bookingError } = await supabase.functions.invoke('payment-start', { body: { slot_id: slotId } });
  if (bookingError) throw bookingError;
  if (!booking?.ok || !booking?.appointment_id) throw new Error(booking?.error || 'booking_failed');

  try {
    const { data: payment, error: paymentError } = await supabase.functions.invoke('payment-start-v4', { body: { appointment_id: booking.appointment_id } });
    if (paymentError) throw paymentError;
    if (payment?.ok && payment?.payment_url) {
      window.location.assign(payment.payment_url);
      return { ...booking, ...payment };
    }
    const cash = await requestCashPayment(slotId);
    return { ...booking, ...cash, payment_method: 'cash', gateway_configured: false };
  } catch (err) {
    try {
      const cash = await requestCashPayment(slotId);
      return { ...booking, ...cash, payment_method: 'cash', gateway_configured: false, payment_error: err?.context?.body?.error || err?.message || 'payment_start_failed' };
    } catch (cashError) {
      throw cashError;
    }
  }
}

export async function startAppointmentPayment(appointmentId, gateway) { if (!appointmentId) throw new Error('appointment_id_required'); const body = { appointment_id: appointmentId }; if (gateway) body.gateway = gateway; const { data, error } = await supabase.functions.invoke('payment-start-v4', { body }); if (error) throw error; if (!data?.ok || !data?.payment_url) throw new Error(data?.error || 'payment_start_failed'); window.location.assign(data.payment_url); return data; }

export async function fetchMyAppointments() { const { data, error } = await supabase.from('appointments').select('id,slot_id,status,gross_amount,currency,booked_at,confirmed_at,created_at,appointment_slots:slot_id(starts_at,ends_at,duration_minutes),psychologists:psychologist_id(professional_title)').order('created_at', { ascending: false }).limit(50); if (error) throw error; return data ?? []; }
export async function fetchMyPayments(appointmentIds = []) { let query = supabase.from('payments').select('id,appointment_id,amount,currency,status,gateway,reference_number,paid_at,created_at').order('created_at', { ascending: false }).limit(100); if (appointmentIds.length) query = query.in('appointment_id', appointmentIds); const { data, error } = await query; if (error) throw error; return data ?? []; }

// Email login (legacy flow kept available until the phone-OTP UI is switched over).
export async function sendLoginLink(email) { const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } }); if (error) throw error; }

// Phone OTP flow: send a 6-digit SMS code, then verify it to create the session.
export async function sendPhoneOtp(phone) {
  const normalizedPhone = String(phone || '').trim();
  if (!/^\+?[1-9]\d{7,14}$/.test(normalizedPhone)) throw new Error('شماره موبایل معتبر نیست.');
  const { error } = await supabase.auth.signInWithOtp({ phone: normalizedPhone });
  if (error) throw error;
}

export async function verifyPhoneOtp(phone, token) {
  const normalizedPhone = String(phone || '').trim();
  const normalizedToken = String(token || '').trim();
  if (!/^\+?[1-9]\d{7,14}$/.test(normalizedPhone)) throw new Error('شماره موبایل معتبر نیست.');
  if (!/^\d{6}$/.test(normalizedToken)) throw new Error('کد تأیید باید ۶ رقم باشد.');
  const { data, error } = await supabase.auth.verifyOtp({ phone: normalizedPhone, token: normalizedToken, type: 'sms' });
  if (error) throw error;
  return data?.session || null;
}

export async function getCurrentSession() { const { data, error } = await supabase.auth.getSession(); if (error) throw error; return data.session; }
export function subscribeToAuth(callback) { return supabase.auth.onAuthStateChange((_event, session) => callback(session)); }
export async function signOutUser() { const { error } = await supabase.auth.signOut(); if (error) throw error; }
