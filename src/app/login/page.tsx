'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GaneshaIcon } from '@/components/GaneshaIcon'
import { loginUser } from '@/app/actions'
import { Lock, User, LogIn, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)

      const result = await loginUser(null, formData)

      if (result.success) {
        router.push('/')
        router.refresh()
      } else {
        setError(result.error || 'Invalid credentials')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-slate-800 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex justify-center mb-3">
            <GaneshaIcon size="70px" color="#F59E0B" accentColor="#EF4444" showBackground />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Sagar Electricals
          </h1>
          <p className="text-xs text-amber-400 font-medium tracking-wider uppercase mt-1">
            Billing & POS Software
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1 text-center">
            Staff Login
          </h2>
          <p className="text-sm text-slate-500 mb-6 text-center">
            Sign in to access store management
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Default Credentials Info Box */}
          <div className="mt-8 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-slate-600 text-center">
            <span className="font-semibold text-slate-700">Default Admin Credentials:</span>
            <div className="mt-1 font-mono text-slate-800 bg-white/80 py-1 px-2 rounded border border-amber-200 inline-block">
              Username: <span className="font-bold">admin</span> | Password: <span className="font-bold">admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
