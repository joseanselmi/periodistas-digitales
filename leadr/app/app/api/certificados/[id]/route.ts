import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!id || typeof id !== 'string' || id.length > 30) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const { data } = await admin
    .from('certificates')
    .select('certificate_number, user_name, plan_started_at, issued_at')
    .eq('certificate_number', id.toUpperCase())
    .single()

  if (!data) return NextResponse.json({ error: 'Certificado no encontrado' }, { status: 404 })

  return NextResponse.json({
    valid: true,
    certificate_number: data.certificate_number,
    user_name: data.user_name,
    plan_started_at: data.plan_started_at,
    issued_at: data.issued_at,
  })
}
