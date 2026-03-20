import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function check() {
  console.log('--- CATEGORIES ---')
  const { data: cats } = await supabase.from('categories').select('id, name, slug')
  console.log(cats)

  console.log('\n--- RETAIL PRODUCTS ---')
  const { data: prods } = await supabase.from('products').select('id, name, is_active, category_id')
  console.log(prods)
  
  console.log('\n--- PUBLIC RLS TEST ---')
  const { data: publicTest, error } = await supabase.from('products').select('*').limit(1)
  if (error) console.log('RLS Error:', error.message)
  else console.log('Successfully fetched 1 product publicly')
}

check()
