import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const HOTMART_TOKEN = process.env.HOTMART_WEBHOOK_TOKEN?.trim()
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Eventos de Hotmart que activan acceso Pro
const PURCHASE_EVENTS = ['PURCHASE_COMPLETE', 'PURCHASE_APPROVED', 'SUBSCRIPTION_REACTIVATED']
const CANCEL_EVENTS = ['PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'SUBSCRIPTION_CANCELLATION']

// Producto del curso "Sistema de Ingresos Diarios" → da 30 días de Pro (no renovable)
const CURSO_PRODUCT_ID = '5475737'

async function sendPurchaseToMeta(email: string, value: number, currency: string) {
  try {
    const hashedEmail = crypto.createHash('sha256').update(email).digest('hex')
    await fetch(`https://graph.facebook.com/v19.0/${process.env.META_PIXEL_ID}/events?access_token=${process.env.META_CAPI_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: 'https://sistemadeingresosdiariosia.com',
          action_source: 'website',
          user_data: { em: hashedEmail },
          custom_data: { value, currency },
        }],
      }),
    })
  } catch {}
}

export async function POST(req: Request) {
  // 1. Verificar firma de Hotmart
  const token = req.headers.get('x-hotmart-hottok')?.trim()
  if (!HOTMART_TOKEN || token !== HOTMART_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const event = body?.event ?? body?.data?.purchase?.status

  if (!event) {
    return NextResponse.json({ error: 'No event' }, { status: 400 })
  }

  // Email del comprador — Hotmart puede mandarlo en distintos lugares según la versión
  const email = (
    body?.data?.buyer?.email ??
    body?.buyer?.email ??
    body?.data?.purchase?.buyer?.email
  )?.toLowerCase()?.trim()

  if (!email) {
    return NextResponse.json({ error: 'No email in payload' }, { status: 400 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // 2. Cancelación → bajar a basic
  if (CANCEL_EVENTS.includes(event)) {
    await supabase
      .from('users')
      .update({ plan: 'basic', plan_expires_at: null })
      .eq('email', email)

    return NextResponse.json({ ok: true, action: 'downgraded', email })
  }

  // 3. Compra/renovación → subir a pro
  if (PURCHASE_EVENTS.includes(event)) {
    // Enviar Purchase a Meta CAPI
    const purchaseValue = body?.data?.purchase?.price?.value ?? body?.purchase?.price?.value ?? 17
    const purchaseCurrency = body?.data?.purchase?.price?.currency_value ?? 'USD'
    await sendPurchaseToMeta(email, purchaseValue, purchaseCurrency)

    // Detectar si es el curso (30 días fijos) o la suscripción a Leadr (30 días renovables)
    const productId = String(
      body?.data?.product?.id ??
      body?.product?.id ??
      body?.data?.purchase?.product?.id ??
      ''
    )
    const isCurso = productId === CURSO_PRODUCT_ID
    const isRenewal = event === 'SUBSCRIPTION_REACTIVATED'

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, plan_expires_at')
      .eq('email', email)
      .single()

    // Calcular nueva fecha de vencimiento:
    // - Renovación con plan vigente → sumar 30 días desde el vencimiento actual
    // - Primera compra o plan expirado → sumar 30 días desde hoy
    const expiresAt = new Date()
    if (isRenewal && existingUser?.plan_expires_at) {
      const currentExpiry = new Date(existingUser.plan_expires_at)
      if (currentExpiry > new Date()) {
        expiresAt.setTime(currentExpiry.getTime())
      }
    }
    expiresAt.setDate(expiresAt.getDate() + 30)

    if (existingUser) {
      // Cuenta existente → upgrade directo
      await supabase
        .from('users')
        .update({ plan: 'pro', plan_expires_at: expiresAt.toISOString() })
        .eq('email', email)

      return NextResponse.json({
        ok: true,
        action: 'upgraded',
        email,
        source: isCurso ? 'curso' : 'subscription',
      })
    }

    // No tiene cuenta → crear en Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    })

    if (authError || !authUser?.user) {
      console.error('Error creando usuario:', authError)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Insertar en tabla users con plan pro
    await supabase.from('users').upsert({
      id: authUser.user.id,
      email,
      plan: 'pro',
      plan_expires_at: expiresAt.toISOString(),
    })

    // Mandar email con link para crear contraseña (igual para curso y suscripción)
    await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leadr.cloud'}/reset-password`,
      },
    })

    return NextResponse.json({
      ok: true,
      action: 'created_and_upgraded',
      email,
      source: isCurso ? 'curso' : 'subscription',
    })
  }

  // Evento no relevante — responder 200 para que Hotmart no reintente
  return NextResponse.json({ ok: true, action: 'ignored', event })
}
