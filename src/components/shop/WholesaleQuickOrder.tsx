'use client';

import { useState, useMemo } from 'react';
import { ShoppingCart, Clock, Info, Wand2, Plus, Minus, X, Check } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { WholesaleProduct, Fragrance } from '@/lib/products/actions';
import Image from 'next/image';

interface Props {
  products: WholesaleProduct[];
  fragrances: Fragrance[];
}

export default function WholesaleQuickOrder({ products, fragrances }: Props) {
  const [quantities, setQuantities] = useState<Record<string, Record<string, number>>>({});
  const [showSurtidoModal, setShowSurtidoModal] = useState<{ productId: string; name: string } | null>(null);
  const [surtidoCount, setSurtidoCount] = useState(5);
  
  const addItem = useCartStore((state) => state.addItem);
  const setWholesale = useCartStore((state) => state.setWholesale);

  // Group by category
  const categories = useMemo(() => {
    const groups: Record<string, WholesaleProduct[]> = {};
    products.forEach((p) => {
      const cat = p.wholesale_category || 'Otros';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [products]);

  const handleUpdateQty = (productId: string, fragranceId: string, delta: number, minQty: number) => {
    setQuantities((prev) => {
      const productQtys = prev[productId] || {};
      const current = productQtys[fragranceId] || 0;
      let next = current + delta;
      
      // Smart Incrementor: 0 -> 10, then 11, 12...
      if (delta > 0 && current === 0) {
        next = minQty;
      } else if (delta < 0 && current === minQty) {
        next = 0;
      } else if (next < 0) {
        next = 0;
      }

      return {
        ...prev,
        [productId]: {
          ...productQtys,
          [fragranceId]: next,
        },
      };
    });
  };

  const calculateProductTotal = (productId: string) => {
    const productQtys = quantities[productId] || {};
    return Object.values(productQtys).reduce((sum, q) => sum + q, 0);
  };

  const handleApplySurtido = () => {
    if (!showSurtidoModal) return;
    const { productId } = showSurtidoModal;
    
    // Pick random fragrances
    const shuffled = [...fragrances].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, surtidoCount);
    
    const baseQty = Math.floor(100 / surtidoCount);
    const remainder = 100 % surtidoCount;
    
    const newQtys: Record<string, number> = {};
    selected.forEach((f, idx) => {
      newQtys[f.id] = baseQty + (idx < remainder ? 1 : 0);
    });

    setQuantities((prev) => ({
      ...prev,
      [productId]: newQtys,
    }));
    setShowSurtidoModal(null);
  };

  const handleAddToCart = (product: WholesaleProduct) => {
    const productQtys = quantities[product.id] || {};
    const totalQty = calculateProductTotal(product.id);
    
    if (totalQty === 0) return;

    setWholesale(true);
    
    Object.entries(productQtys).forEach(([fragId, qty]) => {
      if (qty <= 0) return;
      
      const fragrance = fragrances.find(f => f.id === fragId);
      addItem({
        product_id: product.id,
        product_name: product.name,
        variant_id: fragId,
        fragrance_name: fragrance?.name || 'Fragancia',
        image_url: product.image_url || undefined,
        quantity: qty,
        unit_price: product.wholesale_price / (product.slug.includes('pack-100') ? 100 : 1),
        is_pack: false,
      });
    });

    // Clear
    setQuantities((prev) => {
      const next = { ...prev };
      delete next[product.id];
      return next;
    });
  };

  return (
    <div className="space-y-12">
      {Object.entries(categories).map(([catName, catProducts]) => (
        <section key={catName} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="bg-gray-50 px-8 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-display text-lg font-black text-gray-900 uppercase tracking-tight">{catName}</h2>
          </div>

          <div className="divide-y divide-gray-50">
            {catProducts.map((product) => {
              const totalQty = calculateProductTotal(product.id);
              return (
                <div key={product.id} className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/3">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                          {product.image_url && <Image src={product.image_url} alt={product.name} fill className="object-cover" />}
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-bold text-gray-900 leading-tight">{product.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-xs font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                               ${product.wholesale_price.toLocaleString('es-AR')}
                             </span>
                             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                               Min {product.min_qty_per_variant}u x aroma
                             </span>
                          </div>
                        </div>
                      </div>
                      
                      {product.slug.includes('100') && (
                        <button 
                          onClick={() => setShowSurtidoModal({ productId: product.id, name: product.name })}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100 transition-all font-black text-xs uppercase tracking-widest"
                        >
                          <Wand2 size={16} /> Armar Surtido Automático
                        </button>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {fragrances.map((f) => {
                          const qty = quantities[product.id]?.[f.id] || 0;
                          return (
                            <div 
                              key={f.id}
                              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                qty > 0 ? 'bg-teal-50/50 border-teal-200' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
                              }`}
                            >
                              <span className={`text-xs font-bold truncate pr-2 ${qty > 0 ? 'text-teal-900' : 'text-gray-500'}`}>
                                {f.name}
                              </span>
                              <div className="flex items-center bg-white rounded-xl border border-gray-100 shadow-sm p-1">
                                <button 
                                  onClick={() => handleUpdateQty(product.id, f.id, -1, product.min_qty_per_variant)}
                                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-8 text-center text-xs font-black text-gray-900">
                                  {qty}
                                </span>
                                <button 
                                  onClick={() => handleUpdateQty(product.id, f.id, 1, product.min_qty_per_variant)}
                                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-50 text-teal-600"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Unidades</p>
                           <p className={`text-2xl font-black ${totalQty >= 100 && product.slug.includes('100') ? 'text-teal-600' : 'text-gray-900'}`}>
                             {totalQty} u.
                           </p>
                        </div>
                        <button 
                          onClick={() => handleAddToCart(product)}
                          disabled={totalQty === 0}
                          className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-gray-900 text-white font-black text-sm uppercase tracking-widest hover:bg-teal-600 transition-all active:scale-95 disabled:opacity-20"
                        >
                          <ShoppingCart size={18} /> Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* Surtido Modal */}
      {showSurtidoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
                <Wand2 size={32} />
              </div>
              <button onClick={() => setShowSurtidoModal(null)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <h2 className="font-display text-2xl font-black text-gray-900 mb-2">Armar Surtido Random</h2>
            <p className="text-gray-500 text-sm mb-8">Repartiremos las 100 unidades automáticamente entre la cantidad de fragancias que elijas.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">¿Cuántas fragancias quieres?</label>
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                  <button 
                    onClick={() => setSurtidoCount(c => Math.max(1, c - 1))}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm text-gray-400 hover:text-teal-600"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="flex-1 text-center text-3xl font-black text-gray-900">{surtidoCount}</span>
                  <button 
                    onClick={() => setSurtidoCount(c => Math.min(fragrances.length, c + 1))}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm text-teal-600 hover:text-teal-700"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <p className="mt-3 text-[10px] text-gray-400 font-bold italic text-center">
                  (Cada fragancia tendrá aprox. {Math.floor(100 / surtidoCount)} unidades)
                </p>
              </div>
              
              <button 
                onClick={handleApplySurtido}
                className="w-full py-5 rounded-3xl bg-teal-600 text-white font-black text-sm uppercase tracking-widest hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Check size={18} /> Confirmar Selección
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
