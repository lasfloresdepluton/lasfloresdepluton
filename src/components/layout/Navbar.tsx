'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User, Menu, X, Leaf } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function Navbar({ logoUrl }: { logoUrl?: string | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());

  // Prevent hydration mismatch for the badge count
  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { label: 'Productos', href: '/productos' },
    { label: 'Mayoristas', href: '/mayoristas' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 group">
          {logoUrl ? (
            <div className="relative h-16 w-64 transition-transform group-hover:scale-105">
              <Image src={logoUrl} alt="Las Flores de Plutón" fill className="object-contain object-left" priority />
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-teal-100">
                <Leaf size={32} color="white" />
              </div>
              <span className="text-2xl font-black text-gray-900 tracking-tight">
                Las Flores <span className="text-teal-600">de Plutón</span>
              </span>
            </>
          )}
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-teal-600 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/cuenta"
            className="p-3 rounded-2xl transition-colors hover:bg-gray-50 text-gray-400 hover:text-gray-900"
            aria-label="Mi cuenta"
          >
            <User size={20} />
          </Link>
          <Link
            href="/carrito"
            className="relative p-3 rounded-2xl bg-gray-900 text-white shadow-xl shadow-gray-200 transition-all hover:bg-teal-600 active:scale-95"
            aria-label="Carrito"
          >
            <ShoppingCart size={20} />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-[10px] font-black text-white flex items-center justify-center border-2 border-white">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-3 rounded-2xl transition-colors hover:bg-gray-50 text-gray-400"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 px-6 py-6 bg-white border-b border-gray-100 animate-in slide-in-from-top-4">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-sm font-black uppercase tracking-widest py-3 text-gray-900 hover:text-teal-600 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
