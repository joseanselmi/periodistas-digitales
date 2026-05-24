import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: me } = await admin.from('users').select('is_admin').eq('id', user.id).single()
  if (!me?.is_admin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  // Usuarios registrados desde el inicio de la campaña
  const { data: users } = await admin
    .from('users')
    .select('email, plan, plan_expires_at, created_at')
    .gte('created_at', '2026-05-17T00:00:00Z')
    .not('email', 'like', '%leadr.test%')
    .not('email', 'like', '%yopmail%')
    .not('email', 'like', '%example.com%')
    .not('email', 'like', '%postman%')
    .order('created_at', { ascending: true })

  const registered = users ?? []
  const activated = registered.filter(u => u.plan_expires_at !== null)

  const campaigns = [
    {
      id: 'lanzamiento-leadr-mayo-2026',
      nombre: 'Lanzamiento Leadr',
      descripcion: 'Campaña de activación para compradores del Sistema de Ingresos Diarios',
      estado: 'activa',
      inicio: '2026-05-17',
      cierre_token: '2026-05-31',
      token: 'LEADR2026',
      total_contactos: 243,
      emails: [
        { id: 'leadr-l1', asunto: 'Lo que ningún editor te va a decir', enviados: 243, errores: 0, fecha: '2026-05-17' },
        { id: 'leadr-l2', asunto: 'Lo que construimos en Periodistas Digitales', enviados: 243, errores: 0, fecha: '2026-05-18' },
        { id: 'leadr-l3', asunto: 'Tu regalo de Periodistas Digitales', enviados: 243, errores: 0, fecha: '2026-05-21' },
      ],
      segmentos: [
        { nombre: 'Seg A', contactos: 44, l1: '2026-05-17', l2: '2026-05-17', l3: '2026-05-18' },
        { nombre: 'Seg B', contactos: 100, l1: '2026-05-17', l2: '2026-05-18', l3: '2026-05-19' },
        { nombre: 'Seg C', contactos: 99, l1: '2026-05-18', l2: '2026-05-19', l3: '2026-05-21' },
      ],
      registrados: registered.length,
      activados: activated.length,
      usuarios: registered,
    },
  ]

  return NextResponse.json(campaigns)
}
