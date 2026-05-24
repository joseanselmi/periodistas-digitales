import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: profile } = await admin
    .from('users')
    .select('plan, plan_annual_started_at, email')
    .eq('id', user.id)
    .single()

  if (profile?.plan !== 'pro_annual' || !profile.plan_annual_started_at) {
    return NextResponse.json({ error: 'Solo disponible para miembros anuales' }, { status: 403 })
  }

  // Verificar que pasó 1 año completo
  const started = new Date(profile.plan_annual_started_at)
  const oneYearLater = new Date(started)
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)

  if (new Date() < oneYearLater) {
    const daysLeft = Math.ceil((oneYearLater.getTime() - Date.now()) / 86400000)
    return NextResponse.json(
      { error: `Faltan ${daysLeft} días para completar el año` },
      { status: 400 }
    )
  }

  // Si ya tiene certificado, devolver el existente
  const { data: existing } = await admin
    .from('certificates')
    .select('certificate_number')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ ok: true, certificate_number: existing.certificate_number })
  }

  // Generar número secuencial: contar existentes + 1
  const { count } = await admin
    .from('certificates')
    .select('*', { count: 'exact', head: true })

  const year = new Date().getFullYear()
  const seq = String((count ?? 0) + 1).padStart(3, '0')
  const certificateNumber = `LEADR-${year}-${seq}`

  const { error } = await admin.from('certificates').insert({
    certificate_number: certificateNumber,
    user_id: user.id,
    user_email: profile.email,
    plan_started_at: profile.plan_annual_started_at,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, certificate_number: certificateNumber })
}
