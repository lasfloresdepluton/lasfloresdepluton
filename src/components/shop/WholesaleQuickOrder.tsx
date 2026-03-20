'use client';

import { useState, useMemo } from 'react';
import { ShoppingCart, Wand2, Plus, Minus, X, Check, Info, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { WholesaleProduct, Fragrance } from '@/lib/products/actions';
import Image from 'next/image';

interface Props {
  products: WholesaleProduct[];
  fragrances: Fragrance[];
}

export default function WholesaleQuickOrder({ products, fragrances }: Props) {
  const [quantities, setQuantities] = useState<Record<string, Record<string, number>>>({});
  const [showSurtidoModal, setShowSurtidoModal] = useState<{ productId: string; name: string; capacity: number } | null>(null);
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

  const handleUpdateQty = (productId: string, fragranceId: string, delta: number, minJump: number) => {
    setQuantities((prev) => {
      const productQtys = prev[productId] || {};
      const current = productQtys[fragranceId] || 0;
      let next = current + delta;
      
      // Smart Incrementor: jump to minJump, then +1
      if (delta > 0 && current === 0) {
        next = minJump;
      } else if (delta < 0 && current === minJump) {
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
    const { productId, capacity } = showSurtidoModal;
    
    const shuffled = [...fragrances].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, surtidoCount);
    
    const baseQty = Math.floor(capacity / surtidoCount);
    const remainder = capacity % surtidoCount;
    
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
    const totalQty = calculateProductTotal(product.id);
    const isValid = product.is_exact_total 
      ? totalQty === (product.min_total_qty || 1)
      : totalQty >= (product.min_total_qty || 1);
    
    if (!isValid) return;

    setWholesale(true);
    const productQtys = quantities[product.id] || {};
    
    Object.entries(productQtys).forEach(([fragId, qty]) => {
      if (qty <= 0) return;
      const fragrance = fragrances.find(f => f.id === fragId);
      addItem({
        product_id: product.id,
        product_name: product.name,
        variant_id: fragId,
        fragrance_name: fragrance?.name || 'Fragancia',
        image_url: (product as any).image_url || undefined,
        quantity: qty,
        unit_price: product.wholesale_price / ((product as any).min_total_qty || 1),
        is_pack: false,
      });
    });

    setQuantities((prev) => {
      const next = { ...prev };
      delete next[product.id];
      return next;
    });
  };

  return (
    <div className="space-y-12">
      {Object.entries(categories).map(([catName, catProducts]) => (
        <section key={catName} className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100">
          <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100">
            <h2 className="font-display text-base font-black text-gray-400 uppercase tracking-[0.2em]">{catName}</h2>
          </div>

          <div className="divide-y divide-gray-50">
            {catProducts.map((product) => {
              const totalQty = calculateProductTotal(product.id);
              const target = product.min_total_qty || 1;
              const isComplete = product.is_exact_total ? totalQty === target : totalQty >= target;
              const diff = target - totalQty;

              return (
                <div key={product.id} className="p-8 lg:p-10">
                  <div className="flex flex-col lg:flex-row gap-10">
                    {/* Left: Product Info */}
                    <div className="lg:w-1 whitespace-nowrap grow-0 shrink-0 basis-80">
                      <div className="flex items-center gap-5 mb-6">
                        <div className="w-20 h-20 relative rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                          {product.image_url && <Image src={product.image_url} alt={product.name} fill className="object-cover" />}
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-bold text-gray-900 leading-tight mb-1">{product.name}</h3>
                          <div className="flex flex-wrap items-center gap-2">
                             <span className="text-sm font-black text-teal-600">
                               ${product.wholesale_price.toLocaleString('es-AR')}
                             </span>
                             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">
                               Min Total: {target}u
                             </span>
                          </div>
                        </div>
                      </div>
                      
                      {product.is_exact_total && (
                        <button 
                          onClick={() => setShowSurtidoModal({ productId: product.id, name: product.name, capacity: target })}
                          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100 transition-all font-black text-xs uppercase tracking-widest mb-4"
                        >
                          <Wand2 size={16} /> Armar Surtido Random
                        </button>
                      )}

                      <div className={`p-4 rounded-2xl border transition-all ${isComplete ? 'bg-teal-50 border-teal-100' : 'bg-orange-50/50 border-orange-100'}`}>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Progreso</span>
                           <span className={`text-xs font-black ${isComplete ? 'text-teal-600' : 'text-orange-600'}`}>
                             {totalQty} / {target} u.
                           </span>
                        </div>
                        <div className="h-2 w-full bg-white rounded-full overflow-hidden">
                           <div 
                             className={`h-full transition-all duration-500 rounded-full ${isComplete ? 'bg-teal-500' : 'bg-orange-400'}`}
                             style={{ width: `${Math.min(100, (totalQty / target) * 100)}%` }}
                           />
                        </div>
                        {!isComplete && (
                          <p className="mt-3 text-[10px] text-orange-600 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                            <AlertCircle size={12} /> {product.is_exact_total ? `Faltan ${diff} unidades` : `Faltan ${diff} para el mínimo`}
                          </p>
                        )}
                        {isComplete && (
                          <p className="mt-3 text-[10px] text-teal-600 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                            <Check size={12} /> {product.is_exact_total ? 'Pack completo' : 'Mínimo alcanzado'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Fragrance Selection */}
                    <div className="flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {fragrances.map((f) => {
                          const qty = quantities[product.id]?.[f.id] || 0;
                          return (
                            <div 
                              key={f.id}
                              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                qty > 0 ? 'bg-white border-teal-200 shadow-sm' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
                              }`}
                            >
                              <span className={`text-xs font-bold truncate pr-2 ${qty > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                                {f.name}
                              </span>
                              <div className="flex items-center bg-white rounded-xl border border-gray-100 shadow-sm p-1">
                                <button 
                                  onClick={() => handleUpdateQty(product.id, f.id, -1, product.min_qty_per_variant || 1)}
                                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className={`w-8 text-center text-xs font-black ${qty > 0 ? 'text-teal-600' : 'text-gray-900'}`}>
                                  {qty}
                                </span>
                                <button 
                                  onClick={() => handleUpdateQty(product.id, f.id, 1, product.min_qty_per_variant || 1)}
                                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-50 text-teal-600"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-8 flex items-center justify-end">
                        <button 
                          onClick={() => handleAddToCart(product)}
                          disabled={!isComplete}
                          className="flex items-center gap-3 px-12 py-5 rounded-3xl bg-gray-900 text-white font-black text-sm uppercase tracking-widest hover:bg-teal-600 shadow-xl shadow-gray-200 transition-all active:scale-95 disabled:opacity-20 disabled:grayscale"
                        >
                          <ShoppingCart size={18} /> Agregar al pedido
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
            <p className="text-gray-500 text-sm mb-8">Repartiremos las {showSurtidoModal.capacity} unidades automáticamente entre la cantidad de fragancias que elijas.</p>
            
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
                  (Cada fragancia tendrá aprox. {Math.floor(showSurtidoModal.capacity / surtidoCount)} unidades)
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
