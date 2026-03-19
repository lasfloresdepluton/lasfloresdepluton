import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartFragranceSelection {
  fragrance_id: string
  fragrance_name: string
}

export interface CartItem {
  id: string                      // unique key: product_id + variant_id or product_id + sorted(fragrance_ids)
  product_id: string
  product_name: string
  variant_id?: string             // for single-fragrance items
  fragrance_name?: string         // for single-fragrance items
  image_url?: string
  quantity: number
  unit_price: number              // retail or wholesale
  is_pack: boolean
  selected_fragrances?: CartFragranceSelection[] // for packs
}

interface CartState {
  items: CartItem[]
  is_wholesale: boolean
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setWholesale: (val: boolean) => void
  total: () => number
  itemCount: () => number
}

function buildCartId(item: Omit<CartItem, 'id'>): string {
  if (item.is_pack && item.selected_fragrances) {
    const fragIds = item.selected_fragrances.map((f) => f.fragrance_id).sort().join(',')
    return `${item.product_id}::pack::${fragIds}`
  }
  return `${item.product_id}::${item.variant_id ?? 'no-variant'}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      is_wholesale: false,

      addItem: (item) => {
        const id = buildCartId(item)
        set((state) => {
          const existing = state.items.find((i) => i.id === id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            }
          }
          return { items: [...state.items, { ...item, id }] }
        })
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),

      setWholesale: (val) => set({ is_wholesale: val }),

      total: () =>
        get().items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'lfp-cart' }
  )
)
