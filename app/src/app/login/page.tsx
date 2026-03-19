'use client'

import { useState } from 'react'
import Link from 'next/link'
import { login } from '@/lib/auth/actions'
import { Leaf, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 paper-texture"
      style={{ background: 'var(--bg-cream)' }}
    >
      {/* Blobs */}
      <div className="blob blob-teal animate-float" style={{ width: 350, height: 350, top: -80, right: -100 }} />
      <div className="blob blob-orange animate-float" style={{ width: 250, height: 250, bottom: -60, left: -80, animationDelay: '1s' }} />

      <div
        className="relative z-10 w-full max-w-md rounded-3xl p-8 shadow-2xl"
        style={{ background: 'white', border: '1px solid var(--border-paper)' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--accent-teal)' }}
          >
            <Leaf size={24} color="white" />
          </div>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text-dark)' }}>
            Bienvenida/o
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-light)' }}>
            Ingresá a tu cuenta de Las Flores de Plutón
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-medium)' }}>
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="tu@email.com"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-medium)' }}>
              Contraseña
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPwd ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="input-field pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-light)' }}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-light)' }}>
          ¿No tenés cuenta?{' '}
          <Link href="/registro" style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>
            Registrate
          </Link>
        </p>
        <p className="text-center text-sm mt-2" style={{ color: 'var(--text-light)' }}>
          ¿Sos mayorista?{' '}
          <Link href="/mayoristas" style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>
            Conocé cómo acceder
          </Link>
        </p>
      </div>
    </div>
  )
}
