'use client'

import { useState } from 'react'
import Link from 'next/link'
import { register } from '@/lib/auth/actions'
import { Leaf, Eye, EyeOff, Loader2 } from 'lucide-react'

import Image from 'next/image'

export default function RegisterForm({ logoUrl }: { logoUrl?: string | null }) {
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await register(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 paper-texture"
      style={{ background: 'var(--bg-cream)' }}
    >
      <div className="blob blob-teal animate-float" style={{ width: 300, height: 300, top: -60, left: -80 }} />
      <div className="blob blob-yellow animate-float" style={{ width: 200, height: 200, bottom: -40, right: -60, animationDelay: '1.2s' }} />

      <div
        className="relative z-10 w-full max-w-md rounded-3xl p-8 shadow-2xl"
        style={{ background: 'white', border: '1px solid var(--border-paper)' }}
      >
        <div className="text-center mb-8">
          <div
            className="w-32 h-32 flex items-center justify-center mx-auto mb-6 overflow-hidden relative"
          >
            {logoUrl ? (
              <Image 
                src={logoUrl} 
                alt="Las Flores de Plutón" 
                fill 
                className="object-contain"
                priority
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[color:var(--accent-teal)] flex items-center justify-center">
                <Leaf size={32} color="white" />
              </div>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text-dark)' }}>
            Crear cuenta
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-light)' }}>
            Unite a Las Flores de Plutón
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-medium)' }}>
              Nombre completo
            </label>
            <input name="full_name" type="text" required placeholder="Tu nombre" className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-medium)' }}>
              Email
            </label>
            <input name="email" type="email" required placeholder="tu@email.com" className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-medium)' }}>
              Teléfono (opcional)
            </label>
            <input name="phone" type="tel" placeholder="+54 9 11 ..." className="input-field" />
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
                placeholder="Mínimo 8 caracteres"
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
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-light)' }}>
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>
            Ingresá acá
          </Link>
        </p>
      </div>
    </div>
  )
}
