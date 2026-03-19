'use server'

import { createClient } from '@/lib/supabase/server'

export interface UserOrder {
  id: string
  created_at: string
  status: string
  total_amount: number
  type: string
  order_items: {
    quantity: number
    unit_price: number
    products: { name: string } | null
  }[]
}

export async function getUserOrders(userId: string): Promise<UserOrder[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('*, order_items ( quantity, unit_price, products ( name ) )')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return (data ?? []) as any[]
}
