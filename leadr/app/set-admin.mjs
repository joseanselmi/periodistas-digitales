// Pega tu service_role key como argumento:
// node set-admin.mjs <SERVICE_ROLE_KEY>

const serviceKey = process.argv[2]
if (!serviceKey) {
  console.error('Uso: node set-admin.mjs <SERVICE_ROLE_KEY>')
  console.error('Encontrá la key en: Supabase Dashboard → Settings → API → service_role')
  process.exit(1)
}

const SUPABASE_URL = 'https://wbwfzsdhtbhkjlfuebrd.supabase.co'
const EMAIL = 'joseanselmi27@gmail.com'

const res = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(EMAIL)}`, {
  method: 'PATCH',
  headers: {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  },
  body: JSON.stringify({ is_admin: true, plan: 'pro' }),
})

const data = await res.json()

if (!res.ok) {
  console.error('Error:', data)
  process.exit(1)
}

if (data.length === 0) {
  console.error('No se encontró el usuario. Verificá que hayas iniciado sesión al menos una vez.')
  process.exit(1)
}

console.log('✓ Usuario actualizado:')
console.log(`  email:    ${data[0].email}`)
console.log(`  plan:     ${data[0].plan}`)
console.log(`  is_admin: ${data[0].is_admin}`)
console.log('\nRecargá el dashboard en el browser.')
