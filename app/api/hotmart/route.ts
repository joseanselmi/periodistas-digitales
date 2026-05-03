import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const HOTMART_TOKEN = process.env.HOTMART_WEBHOOK_TOKEN?.trim()
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Eventos de Hotmart que activan acceso Pro
const PURCHASE_EVENTS = ['PURCHASE_COMPLETE', 'PURCHASE_APPROVED', 'SUBSCRIPTION_REACTIVATED']
const CANCEL_EVENTS = ['PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'SUBSCRIPTION_CANCELLATION']

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
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingUser) {
      // Cuenta existente → upgrade directo
      await supabase
        .from('users')
        .update({ plan: 'pro', plan_expires_at: expiresAt.toISOString() })
        .eq('email', email)

      return NextResponse.json({ ok: true, action: 'upgraded', email })
    }

    // No tiene cuenta → crear en Supabase Auth y mandar link de contraseña
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

    // Mandar email de bienvenida con link para crear contraseña
    await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leadr.cloud'}/reset-password`,
      },
    })

    return NextResponse.json({ ok: true, action: 'created_and_upgraded', email })
  }

  // Evento no relevante — responder 200 para que Hotmart no reintente
  return NextResponse.json({ ok: true, action: 'ignored', event })
}
