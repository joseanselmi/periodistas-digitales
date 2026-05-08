import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function assertAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabaseAdmin.from('users').select('is_admin').eq('id', user.id).single()
  return data?.is_admin ? user : null
}

// GET — listar todos los tokens
export async function GET() {
  const admin = await assertAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { data } = await supabaseAdmin
    .from('activation_tokens')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}

// POST — generar N tokens
export async function POST(req: Request) {
  const admin = await assertAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { count = 1, pro_days = 30 } = await req.json()
  const n = Math.min(Math.max(1, count), 500)

  const tokens = Array.from({ length: n }, () => ({
    token: randomBytes(16).toString('hex'),
    pro_days,
  }))

  const { data, error } = await supabaseAdmin
    .from('activation_tokens')
    .insert(tokens)
    .select('token')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, tokens: data?.map(t => t.token) ?? [] })
}

// DELETE — borrar token no usado
export async function DELETE(req: Request) {
  const admin = await assertAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { token } = await req.json()
  await supabaseAdmin
    .from('activation_tokens')
    .delete()
    .eq('token', token)
    .is('used_at', null)

  return NextResponse.json({ ok: true })
}
