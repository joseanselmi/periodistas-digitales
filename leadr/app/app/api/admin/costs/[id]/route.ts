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

// PATCH — actualizar costo
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await assertAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { service, category, amount, currency, month, notes } = body

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (service !== undefined) updates.service = service
  if (category !== undefined) updates.category = category
  if (amount !== undefined) updates.amount = amount
  if (currency !== undefined) updates.currency = currency
  if (month !== undefined) updates.month = `${month}-01`
  if (notes !== undefined) updates.notes = notes

  const { data, error } = await supabaseAdmin
    .from('costs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE — eliminar costo
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await assertAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const { error } = await supabaseAdmin.from('costs').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
