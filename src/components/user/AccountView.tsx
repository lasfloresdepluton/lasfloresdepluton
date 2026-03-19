'use client';

import { useState, useEffect } from 'react';
import { User, Package, LogOut, ChevronRight, ShoppingBag } from 'lucide-react';
import { logout } from '@/lib/auth/actions';
import { UserOrder } from '@/lib/user/actions';

interface Profile {
  full_name: string | null;
  role: string;
  is_verified_wholesaler: boolean;
}

export default function AccountView({ 
  profile, 
  orders 
}: { 
  profile: Profile | null; 
  orders: UserOrder[] 
}) {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; bg: string }> = {
      pending: { label: 'Pendiente', color: '#B45309', bg: '#FEF3C7' },
      producing: { label: 'En Producción', color: '#1D4ED8', bg: '#DBEAFE' },
      ready_to_ship: { label: 'Listo para Envío', color: '#047857', bg: '#D1FAE5' },
      shipped: { label: 'Enviado', color: '#6D28D9', bg: '#EDE9FE' },
      delivered: { label: 'Entregado', color: '#059669', bg: '#D1FAE5' },
      cancelled: { label: 'Cancelado', color: '#DC2626', bg: '#FEE2E2' },
    };
    const s = statusMap[status] || { label: status, color: '#4B5563', bg: '#F3F4F6' };
    return (
      <span 
        className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
        style={{ color: s.color, backgroundColor: s.bg }}
      >
        {s.label}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-2">
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--accent-teal)' }}>
              <User size={24} color="white" />
            </div>
            <h2 className="font-display text-lg font-bold text-gray-900 leading-tight">
              {profile?.full_name || 'Usuario'}
            </h2>
            <p className="text-sm text-gray-500 capitalize">
              {profile?.role === 'wholesaler' ? 'Mayorista' : 'Cliente Minorista'}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
              activeTab === 'orders' ? 'bg-[color:var(--accent-teal)] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package size={20} />
              <span className="font-bold">Mis Pedidos</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 p-4 rounded-xl text-red-500 bg-white border border-red-50 border-gray-100 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            <span className="font-bold">Cerrar Sesión</span>
          </button>
        </aside>

        {/* Content */}
        <main className="flex-1">
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-display font-black text-gray-900">Historial de Pedidos</h1>
                <span className="text-sm font-medium text-gray-500">{orders.length} pedidos</span>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag size={28} className="text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Aún no tienes pedidos</h3>
                  <p className="text-gray-500 mb-6 max-w-xs mx-auto">
                    Cuando realices tu primera compra, aparecerá aquí para que puedas seguir su estado.
                  </p>
                  <a 
                    href="/productos"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-white transition-transform hover:scale-105"
                    style={{ backgroundColor: 'var(--accent-teal)' }}
                  >
                    Ver Productos
                  </a>
                </div>
              ) : (
                <div className="grid gap-4">
                  {orders.map((order) => (
                    <div 
                      key={order.id}
                      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                            Orden #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-sm font-medium text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('es-AR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-lg font-black text-gray-900">
                            ${Number(order.total_amount).toLocaleString('es-AR')}
                          </p>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-50 pt-4">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Productos</p>
                        <ul className="space-y-2">
                          {order.order_items.map((item, idx) => (
                            <li key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-700">
                                <span className="font-bold text-gray-900">{item.quantity}x</span> {item.products?.name || 'Producto'}
                              </span>
                              <span className="text-gray-500 font-medium">
                                ${Number(item.unit_price).toLocaleString('es-AR')}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
