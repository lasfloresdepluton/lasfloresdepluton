'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, CreditCard, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/utils/helpers'

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart, is_wholesale } = useCartStore()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl shadow-inner">🛒</div>
        <h1 className="text-3xl font-black text-gray-900">Tu carrito está vacío</h1>
        <p className="text-gray-500 max-w-xs">¡Parece que aún no has elegido nada! Te invitamos a ver nuestros productos.</p>
        <Link 
          href="/productos" 
          className="bg-gray-900 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-teal-600 transition-all active:scale-95"
        >
          Ver Productos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        
        {/* ITEMS LIST */}
        <div className="flex-1 space-y-8">
          <div className="flex justify-between items-end pb-4 border-b border-gray-100">
            <div>
              <h1 className="text-4xl font-black text-gray-900">Carrito</h1>
              <p className="text-xs font-black uppercase tracking-widest text-teal-600 mt-1">
                {is_wholesale ? 'Pedido Mayorista' : 'Pedido Minorista'}
              </p>
            </div>
            <button 
              onClick={clearCart}
              className="text-[10px] font-black uppercase text-gray-400 hover:text-red-500 transition-colors"
            >
              Vaciar Carrito
            </button>
          </div>

          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col sm:flex-row gap-6 group hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-gray-50 flex-shrink-0">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-black text-gray-900 leading-tight">{item.product_name}</h3>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Breakdown for Packs */}
                    {item.is_pack && item.selected_fragrances && (
                      <div className="mt-2 text-[10px] font-bold text-gray-400 flex flex-wrap gap-x-2 gap-y-1">
                        {item.selected_fragrances.map((f, idx) => (
                          <span key={idx} className="bg-gray-50 px-2 py-0.5 rounded">
                            {f.name} x{f.quantity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-6">
                    {/* Qty Controls */}
                    <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-gray-400 hover:text-gray-900 hover:shadow-sm"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-sm font-black text-gray-900 w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-gray-400 hover:text-gray-900 hover:shadow-sm"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total item</p>
                      <p className="text-xl font-black text-teal-600">{formatPrice(item.unit_price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link href="/productos" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-teal-600 transition-colors">
            <ArrowLeft size={14} /> Seguir Comprando
          </Link>
        </div>

        {/* SUMMARY */}
        <div className="w-full md:w-80 lg:w-96 space-y-6">
          <div className="bg-gray-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-8">
              <h2 className="text-2xl font-black">Resumen</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-gray-400 text-sm">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">{formatPrice(total())}</span>
                </div>
                <div className="flex justify-between items-center text-gray-400 text-sm">
                  <span>Envío</span>
                  <span className="text-[10px] font-black uppercase text-teal-400">Calculado en el check</span>
                </div>
                <div className="h-px bg-white/10 w-full" />
                <div className="flex justify-between items-end pt-2">
                  <span className="font-black uppercase text-xs tracking-widest">Total Final</span>
                  <span className="text-4xl font-black text-white">{formatPrice(total())}</span>
                </div>
              </div>

              <button className="w-full bg-white text-gray-900 py-6 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-teal-400 transition-all active:scale-95">
                <CreditCard size={20} /> Iniciar Pago
              </button>
            </div>
            
            {/* Decal background */}
            <div className="absolute -bottom-10 -right-10 text-white/5 rotate-12 pointer-events-none">
              <ShoppingCart size={200} />
            </div>
          </div>

          <div className="bg-teal-50 p-6 rounded-3xl border border-teal-100 flex items-center gap-4">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">🛡️</div>
             <div>
                <p className="text-xs font-black text-teal-900 uppercase">Compra Segura</p>
                <p className="text-[10px] text-teal-600 font-bold">Tus datos están protegidos y procesados de forma cifrada.</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
