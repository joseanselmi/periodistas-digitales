import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

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

// GET — lista costos de un mes (query param: month=2026-05)
export async function GET(req: Request) {
  const admin = await assertAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') // e.g. "2026-05"

  let query = supabaseAdmin.from('costs').select('*').order('category').order('service')

  if (month) {
    const start = `${month}-01`
    const [y, m] = month.split('-').map(Number)
    const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`
    query = query.gte('month', start).lt('month', nextMonth)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST — crear nuevo costo
export async function POST(req: Request) {
  const admin = await assertAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const body = await req.json()
  const { service, category, amount, currency = 'USD', month, notes } = body

  if (!service || !category || amount == null || !month) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('costs')
    .insert({ service, category, amount, currency, month: `${month}-01`, notes })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
