'use client';

import { useState, useMemo } from 'react';
import { Package, ShoppingCart, AlertCircle, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { ProductWithVariants } from '@/lib/products/actions';
import Image from 'next/image';

interface Props {
  products: ProductWithVariants[];
}

export default function WholesaleQuickOrder({ products }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const addItem = useCartStore((state) => state.addItem);
  const setWholesale = useCartStore((state) => state.setWholesale);

  // Group products by wholesale_category
  const categories = useMemo(() => {
    const groups: Record<string, ProductWithVariants[]> = {};
    products.forEach((p) => {
      const cat = p.wholesale_category || 'Otros';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [products]);

  const handleQtyChange = (variantId: string, val: string, minQty: number) => {
    const num = parseInt(val) || 0;
    setQuantities((prev) => ({ ...prev, [variantId]: num }));
  };

  const getPriceForQty = (product: ProductWithVariants, totalQty: number) => {
    // Sort tiers by qty descending to find the best match
    const sortedTiers = [...product.wholesale_tiers].sort((a, b) => b.min_total_qty - a.min_total_qty);
    const applicableTier = sortedTiers.find((t) => totalQty >= t.min_total_qty);

    if (applicableTier) {
      if (applicableTier.fixed_total_price) return applicableTier.fixed_total_price / totalQty;
      if (applicableTier.unit_price) return applicableTier.unit_price;
    }
    return product.wholesale_price;
  };

  const calculateSubtotal = (product: ProductWithVariants) => {
    let totalQty = 0;
    product.product_variants.forEach((v) => {
      totalQty += quantities[v.id] || 0;
    });
    const unitPrice = getPriceForQty(product, totalQty);
    return totalQty * unitPrice;
  };

  const handleAddAll = (product: ProductWithVariants) => {
    setWholesale(true);
    let added = 0;
    
    // Check if the business logic requires min_qty_per_variant validation here too
    const variantsToAdd = product.product_variants.filter(v => (quantities[v.id] || 0) > 0);
    
    // First, check if any variant doesn't meet the min_qty_per_variant
    const invalidVariants = variantsToAdd.filter(v => (quantities[v.id] || 0) < (product.min_qty_per_variant || 1));
    
    if (invalidVariants.length > 0) {
      alert(`Error: Se requiere un mínimo de ${product.min_qty_per_variant} unidades por fragancia para ${product.name}.`);
      return;
    }

    // Calculate the correct unit price for all variants based on total qty of the product
    let totalOrderQty = 0;
    variantsToAdd.forEach(v => totalOrderQty += quantities[v.id]);
    const unitPrice = getPriceForQty(product, totalOrderQty);

    variantsToAdd.forEach((v) => {
      addItem({
        product_id: product.id,
        product_name: product.name,
        variant_id: v.id,
        fragrance_name: v.fragrances?.name || 'Fragancia',
        image_url: v.image_url || (product.image_url as string | undefined),
        quantity: quantities[v.id],
        unit_price: unitPrice,
        is_pack: product.is_pack,
      });
      added++;
    });

    if (added > 0) {
      // Clear quantities for this product
      const newQtys = { ...quantities };
      product.product_variants.forEach(v => delete newQtys[v.id]);
      setQuantities(newQtys);
    }
  };

  return (
    <div className="space-y-12">
      {Object.entries(categories).map(([catName, catProducts]) => (
        <section key={catName} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="bg-gray-50 px-8 py-5 border-bottom border-gray-100 flex items-center justify-between">
            <h2 className="font-display text-xl font-black text-gray-900 uppercase tracking-tight">
              {catName}
            </h2>
            <div className="flex gap-4">
               {catProducts[0]?.min_qty_per_variant > 1 && (
                 <span className="flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
                   <Info size={14} /> MÍNIMO {catProducts[0].min_qty_per_variant}U POR FRAGANCIA
                 </span>
               )}
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {catProducts.map((product) => {
              const productTotalQty = product.product_variants.reduce((sum, v) => sum + (quantities[v.id] || 0), 0);
              const currentUnitPrice = getPriceForQty(product, productTotalQty);
              const subtotal = calculateSubtotal(product);

              return (
                <div key={product.id} className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Product Info & Tiers */}
                    <div className="lg:w-1/3">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                           <Image src={(product.image_url || '/placeholder.png') as string} alt={product.name} fill className="object-cover" />
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-bold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                        </div>
                      </div>

                      {/* Display scales/tiers */}
                      {product.wholesale_tiers.length > 0 && (
                        <div className="mt-4 p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
                          <p className="text-[10px] font-black text-teal-700 uppercase tracking-widest mb-2">Escalas de precio</p>
                          <div className="space-y-1">
                            {product.wholesale_tiers.map(tier => (
                               <div key={tier.id} className="flex justify-between text-xs font-medium">
                                 <span className="text-teal-800">{tier.label || `Llevando +${tier.min_total_qty}u`}</span>
                                 <span className="font-bold text-teal-900">
                                   ${tier.fixed_total_price ? (tier.fixed_total_price / tier.min_total_qty).toLocaleString('es-AR') : tier.unit_price?.toLocaleString('es-AR')} c/u
                                 </span>
                               </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Variants Grid */}
                    <div className="flex-1">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {product.product_variants.map((variant) => (
                          <div 
                            key={variant.id}
                            className={`p-3 rounded-2xl border transition-all ${
                              (quantities[variant.id] || 0) > 0 ? 'bg-white border-teal-500 shadow-sm' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <p className="text-[10px] font-bold text-gray-400 uppercase truncate mb-1">
                              {variant.fragrances?.name || 'Aroma'}
                            </p>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={quantities[variant.id] || ''}
                                onChange={(e) => handleQtyChange(variant.id, e.target.value, product.min_qty_per_variant)}
                                placeholder="0"
                                className="w-full bg-transparent text-lg font-black text-gray-900 outline-none placeholder:text-gray-200"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer for product section */}
                      <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Unidades totales</p>
                              <p className="text-xl font-black text-gray-900">{productTotalQty} u.</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Precio Unitario</p>
                              <p className="text-xl font-black text-teal-600">${currentUnitPrice.toLocaleString('es-AR')}</p>
                           </div>
                           <div className="h-8 w-px bg-gray-100 hidden sm:block" />
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Subtotal Producto</p>
                              <p className="text-2xl font-black text-gray-900">${subtotal.toLocaleString('es-AR')}</p>
                           </div>
                        </div>

                        <button
                          onClick={() => handleAddAll(product)}
                          disabled={productTotalQty === 0}
                          className="flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                          style={{ background: 'var(--accent-teal)', color: 'white' }}
                        >
                          <ShoppingCart size={18} /> Agregar al Carrito
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
      
      {/* Global Cart Summary Float? */}
      <div className="fixed bottom-8 right-8 z-40">
         <a 
           href="/carrito"
           className="flex items-center gap-4 bg-gray-900 text-white px-8 py-4 rounded-3xl shadow-2xl hover:bg-[#3dbdb5] transition-all group"
         >
           <div>
              <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-0.5">Mínimo Mayorista</p>
              <p className="text-xs font-bold">$50.000 (Consultar)</p>
           </div>
           <div className="w-px h-8 bg-white/20" />
           <div className="flex items-center gap-2">
              <span className="font-black">IR AL CARRITO</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
           </div>
         </a>
      </div>
    </div>
  );
}
