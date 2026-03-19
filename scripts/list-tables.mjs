
import { createClient } from '@supabase/supabase-js'

async function listTables() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  // Try to query some system info or just a non-existent table to see the error message's schema info
  // Actually, we can use psql-like query through the supabase client if we had a rpc function
  // But we don't. We'll try to guess.
  
  const tables = ['profiles', 'categories', 'products', 'site_settings', 'settings']
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1)
    if (error) {
      console.log(`Table ${table}: ERROR - ${error.message}`)
    } else {
      console.log(`Table ${table}: FOUND`)
    }
  }
}

listTables()
