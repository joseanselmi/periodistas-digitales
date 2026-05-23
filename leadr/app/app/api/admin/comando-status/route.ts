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

export async function GET() {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const hoy = new Date().toISOString().split('T')[0]

  const [noticiasHoy, noticiasPendientes, clasesRes, usuariosRes, proRes] = await Promise.all([
    supabaseAdmin.from('news').select('id', { count: 'exact', head: true }).gte('created_at', hoy + 'T00:00:00Z'),
    supabaseAdmin.from('news').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabaseAdmin.from('classes').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).not('plan', 'is', null),
  ])

  return NextResponse.json({
    clara: {
      corrio_hoy: (noticiasHoy.count ?? 0) > 0,
      noticias_hoy: noticiasHoy.count ?? 0,
      aprobaciones_pendientes: noticiasPendientes.count ?? 0,
    },
    leadr: {
      clases: clasesRes.count ?? 0,
      usuarios: usuariosRes.count ?? 0,
      pro: proRes.count ?? 0,
    },
    email: {
      l1: true,
      l2: true,
      l3: true,
      l4: false,
      total_contactos: 243,
    },
  })
}
