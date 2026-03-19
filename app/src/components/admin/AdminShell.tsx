'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/auth/actions'
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  Leaf,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/fragancias', label: 'Fragancias', icon: Leaf },
  { href: '/admin/configuracion', label: 'Configuración', icon: Sparkles },
]

export default function AdminShell({ children, logoUrl }: { children: React.ReactNode; logoUrl: string | null }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(item: (typeof navItems)[0]) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div className="flex min-h-screen font-medium" style={{ background: '#1a1408' }}>
      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 transition-transform duration-300 md:relative md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#0f0b05', borderRight: '1px solid rgba(200,169,122,0.15)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'rgba(200,169,122,0.15)' }}>
          {logoUrl ? (
            <div className="relative h-9 w-full">
              <Image src={logoUrl} alt="Logo" fill className="object-contain object-left" />
            </div>
          ) : (
            <>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--accent-teal)' }}
              >
                <Sparkles size={16} color="white" />
              </div>
              <div className="overflow-hidden">
                <p className="text-white font-display font-black text-sm leading-tight whitespace-nowrap">Las Flores</p>
                <p className="text-xs" style={{ color: 'var(--accent-teal)' }}>Panel Admin</p>
              </div>
            </>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`admin-nav-item ${active ? 'active' : ''}`}
                id={`admin-nav-${item.label.toLowerCase()}`}
              >
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(200,169,122,0.15)' }}>
          <form action={logout}>
            <button
              type="submit"
              className="admin-nav-item w-full text-left"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <LogOut size={18} />
              <span className="text-sm">Cerrar sesión</span>
            </button>
          </form>
          <Link
            href="/"
            className="admin-nav-item block mt-1"
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}
          >
            ← Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="sticky top-0 z-10 flex items-center gap-3 px-6 py-4 md:hidden"
          style={{ background: '#0f0b05', borderBottom: '1px solid rgba(200,169,122,0.15)' }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="text-white p-1"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
          <span className="text-white font-bold text-sm">Admin · Las Flores de Plutón</span>
        </header>

        <main className="flex-1 p-6 overflow-auto" style={{ background: '#12100a' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
