import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

const hookSecret = Deno.env.get('SEND_SMS_HOOK_SECRET')?.replace('v1,whsec_', '')
const kavenegarApiKey = Deno.env.get('KAVENEGAR_API_KEY')
const kavenegarTemplate = Deno.env.get('KAVENEGAR_VERIFY_TEMPLATE') || 'registerverify'

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function toKavenegarReceptor(phone: string) {
  const value = phone.trim()
  if (value.startsWith('+98')) return `0${value.slice(3)}`
  if (value.startsWith('98')) return `0${value.slice(2)}`
  if (value.startsWith('0098')) return `0${value.slice(4)}`
  return value
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  if (!hookSecret || !kavenegarApiKey) {
    console.error('Missing SEND_SMS_HOOK_SECRET or KAVENEGAR_API_KEY')
    return jsonResponse({ error: 'SMS provider is not configured' }, 500)
  }

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    const wh = new Webhook(hookSecret)
    const { user, sms } = wh.verify(payload, headers) as {
      user?: { phone?: string }
      sms?: { otp?: string }
    }

    const phone = user?.phone
    const otp = sms?.otp
    if (!phone || !otp || !/^\d{6}$/.test(otp)) {
      return jsonResponse({ error: 'Invalid SMS hook payload' }, 400)
    }

    const receptor = toKavenegarReceptor(phone)
    const params = new URLSearchParams({
      receptor,
      token: otp,
      template: kavenegarTemplate,
      type: 'sms',
    })

    const providerResponse = await fetch(
      `https://api.kavenegar.com/v1/${encodeURIComponent(kavenegarApiKey)}/verify/lookup.json`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      },
    )

    const providerText = await providerResponse.text()
    let providerData: any
    try {
      providerData = JSON.parse(providerText)
    } catch {
      providerData = null
    }

    if (!providerResponse.ok || providerData?.return?.status !== 200) {
      console.error('Kavenegar request failed', providerResponse.status, providerData?.return?.status)
      return jsonResponse({ error: 'SMS provider rejected the message' }, 502)
    }

    return jsonResponse({})
  } catch (error) {
    console.error('Send SMS hook failed', error instanceof Error ? error.message : 'unknown error')
    return jsonResponse({ error: 'Unable to send SMS' }, 500)
  }
})
