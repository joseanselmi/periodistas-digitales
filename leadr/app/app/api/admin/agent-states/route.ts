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

  const [agentStatesRes, noticiasHoy, noticiasDraft, clasesRes, usuariosRes, proRes] =
    await Promise.all([
      supabaseAdmin.from('agent_states').select('*'),
      supabaseAdmin.from('news').select('id', { count: 'exact', head: true }).gte('created_at', hoy + 'T00:00:00Z'),
      supabaseAdmin.from('news').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
      supabaseAdmin.from('classes').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).not('plan', 'is', null),
    ])

  const agentes: Record<string, unknown> = {}
  for (const s of (agentStatesRes.data ?? [])) {
    agentes[s.agent_id] = s
  }

  // Clara: override con datos live de la tabla news
  const claraCorrio = (noticiasHoy.count ?? 0) > 0
  agentes['clara'] = {
    ...(agentes['clara'] as object ?? {}),
    estado: claraCorrio ? 'ok' : 'pendiente',
    proxima_accion: claraCorrio
      ? 'Automática mañana a las 8am ARG'
      : 'Ejecutar Clara — genera las noticias de hoy',
    datos: {
      corrio_hoy: claraCorrio,
      noticias_hoy: noticiasHoy.count ?? 0,
      aprobaciones_pendientes: noticiasDraft.count ?? 0,
    },
  }

  // Miguel: próxima acción desde Supabase o default
  if (!agentes['miguel']) {
    agentes['miguel'] = {
      agent_id: 'miguel',
      estado: 'pendiente',
      ultima_accion: null,
      proxima_accion: 'Contactar pakoandrade@gmail.com por WhatsApp — usuario activo con 3 clases vistas.',
      datos: {},
    }
  }

  // Sofía: enriquecer datos con conteos live
  const activados = proRes.count ?? 0
  const totalCompradores = 243
  agentes['sofia'] = {
    ...(agentes['sofia'] as object ?? {}),
    datos: {
      ...((agentes['sofia'] as { datos?: object })?.datos ?? {}),
      total: totalCompradores,
      activados,
      pendientes: totalCompradores - activados,
    },
  }

  return NextResponse.json({
    leadr: {
      clases: clasesRes.count ?? 0,
      usuarios: usuariosRes.count ?? 0,
      pro: activados,
    },
    agentes,
  })
}

// PATCH — actualizar estado de un agente (usado por scripts externos)
export async function PATCH(req: Request) {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const { agent_id, ...fields } = body
  if (!agent_id) return NextResponse.json({ error: 'agent_id requerido' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('agent_states')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('agent_id', agent_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
