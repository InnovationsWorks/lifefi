'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + '/dashboard' } })
    if (error) {
      setError(error.message)
    } else {
      setError('Check your email to confirm your account.')
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#0A1628', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', padding: '20px' }}>
      <h1 style={{ color: '#00C896', fontSize: '32px', fontWeight: '700' }}>LifeFi</h1>
      <input type='email' placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '12px', borderRadius: '8px', width: '300px', fontSize: '16px', background: '#1a2a42', color: '#ffffff', border: '1px solid #2a3a52' }} />
      <input type='password' placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '12px', borderRadius: '8px', width: '300px', fontSize: '16px', background: '#1a2a42', color: '#ffffff', border: '1px solid #2a3a52' }} />
      {error && <p style={{ color: '#ff4444' }}>{error}</p>}
      <button onClick={handleEmailLogin} disabled={loading} style={{ padding: '12px 24px', background: '#00C896', border: 'none', borderRadius: '8px', width: '300px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', color: '#000000' }}>{loading ? 'Loading...' : 'Login'}</button>
      <button onClick={handleSignUp} disabled={loading} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #00C896', color: '#00C896', borderRadius: '8px', width: '300px', fontSize: '16px', cursor: 'pointer' }}>Create Account</button>
      <button onClick={() => router.push('/features')} style={{ padding: '12px 24px', background: 'transparent', border: 'none', color: '#888888', fontSize: '14px', cursor: 'pointer' }}>LifeFi Features</button>
    </div>
  )
}