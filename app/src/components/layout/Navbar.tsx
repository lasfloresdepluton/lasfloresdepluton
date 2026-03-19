'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User, Menu, X, Leaf } from 'lucide-react';

const navLinks = [
  { label: 'Productos', href: '/productos' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Mayoristas', href: '/mayoristas' },
  { label: 'Contacto', href: '/contacto' },
];

export default function Navbar({ cartCount = 0, logoUrl }: { cartCount?: number; logoUrl?: string | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      style={{
        background: 'rgba(245, 240, 232, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(200, 169, 122, 0.3)',
      }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-3"
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between font-medium">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {logoUrl ? (
            <div className="relative h-10 w-40 transition-transform group-hover:scale-105">
              <Image
                src={logoUrl}
                alt="Las Flores de Plutón"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          ) : (
            <>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: 'var(--accent-teal)' }}
              >
                <Leaf size={18} color="white" />
              </div>
              <span className="font-display text-xl font-black tracking-tight" style={{ color: 'var(--text-dark)' }}>
                Las Flores <span style={{ color: 'var(--accent-teal)' }}>de Plutón</span>
              </span>
            </>
          )}
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-[color:var(--accent-teal)]"
                style={{ color: 'var(--text-medium)' }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/cuenta"
            className="p-2 rounded-full transition-colors hover:bg-[color:var(--bg-paper)]"
            style={{ color: 'var(--text-medium)' }}
            aria-label="Mi cuenta"
          >
            <User size={20} />
          </Link>
          <Link
            href="/carrito"
            className="relative p-2 rounded-full transition-colors hover:bg-[color:var(--bg-paper)]"
            style={{ color: 'var(--text-medium)' }}
            aria-label="Carrito"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                style={{ background: 'var(--accent-teal)' }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-full transition-colors hover:bg-[color:var(--bg-paper)]"
            style={{ color: 'var(--text-medium)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 px-6 py-4"
          style={{ background: 'var(--bg-cream)', borderBottom: '1px solid var(--border-paper)' }}
        >
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block text-base font-medium py-2 transition-colors hover:text-[color:var(--accent-teal)]"
                  style={{ color: 'var(--text-dark)' }}
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
