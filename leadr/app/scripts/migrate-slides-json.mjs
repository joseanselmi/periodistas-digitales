/**
 * Migra slides_json del proyecto viejo al nuevo
 */
import { createClient } from '@supabase/supabase-js'

const OLD = createClient(
  'https://wbwfzsdhtbhkjlfuebrd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indid2Z6c2RodGJoa2psZnVlYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ4MDU3MiwiZXhwIjoyMDkxMDU2NTcyfQ.gpOpuTVgAam3bOcVwku0y4o31RaMZ3GHIir7bsmH_hY'
)

const NEW = createClient(
  'https://ovwlsnnhiuoxoazyrhvt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92d2xzbm5oaXVveG9henlyaHZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3OTI3MSwiZXhwIjoyMDkzMjU1MjcxfQ.bDYDu97rrARa4JToZVvflJbXPsUYuSBBcsEeekTTrKo'
)

const { data: classes } = await OLD.from('classes').select('id, slides_json').not('slides_json', 'is', null)

console.log(`Migrando slides_json de ${classes.length} clases...`)

for (const cls of classes) {
  const { error } = await NEW.from('classes').update({ slides_json: cls.slides_json }).eq('id', cls.id)
  console.log(error ? `❌ [${cls.id}] ${error.message}` : `✅ [${cls.id}]`)
}

console.log('Listo.')
