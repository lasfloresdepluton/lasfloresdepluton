
import { createClient } from '@supabase/supabase-js'

async function checkLogo() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('key', 'logo_url')
    .single()
    
  if (error) {
    console.error('Error fetching logo:', error)
  } else {
    console.log('Current logo in DB:', JSON.stringify(data, null, 2))
  }
}

checkLogo()
