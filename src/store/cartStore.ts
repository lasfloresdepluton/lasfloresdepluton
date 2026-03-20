import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SelectedFragrance {
  id: string
  name: string
  quantity: number
}

export interface CartItem {
  id: string                      // unique key for grouping
  product_id: string
  product_name: string
  product_slug?: string
  image_url?: string
  quantity: number                // Amount of units (if single) or amount of PACKS (if grouped)
  unit_price: number              // Price per unit or price per PACK
  is_pack: boolean
  pack_size?: number              // 10, 20, 100, etc.
  selected_fragrances?: SelectedFragrance[]
}

interface CartState {
  items: CartItem[]
  is_wholesale: boolean
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  replaceItem: (oldId: string, item: Omit<CartItem, 'id'>) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setWholesale: (val: boolean) => void
  total: () => number
  itemCount: () => number
}

/**
 * Builds a deterministic ID based on product and assortment.
 * This allows "Twin packs" to be grouped together if they have the EXACT SAME assortment.
 */
function buildCartId(item: Omit<CartItem, 'id'>): string {
  if (item.is_pack && item.selected_fragrances && item.selected_fragrances.length > 0) {
    // Sort by ID to ensure same assortment = same Cart ID
    const assortmentKey = [...item.selected_fragrances]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(f => `${f.id}:${f.quantity}`)
      .join('|')
    return `${item.product_id}::pack::${assortmentKey}`
  }
  // For standard products (single fragrance or no pack choice)
  const variantPart = item.selected_fragrances?.[0]?.id || 'default'
  return `${item.product_id}::${variantPart}`
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

      replaceItem: (oldId, item) => {
        const newId = buildCartId(item)
        set((state) => ({
          items: state.items.map((i) =>
            i.id === oldId ? { ...item, id: newId } : i
          ),
        }))
      },

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),

      setWholesale: (val) => {
        // If switching from retail to wholesale or vice versa, clear cart OR we might need logic.
        // For now, just set.
        set({ is_wholesale: val })
      },

      total: () =>
        get().items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'lfp-cart-v2' } // Versioned name after breaking change in structure
  )
)
