import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'

export default function LogIn() {
  const navigate = useNavigate()
  const signIn = useAuthStore(s => s.signIn)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) { setError('Enter your email and password.'); return }
    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
      // Auth store triggers redirect via App.jsx
    } catch (err) {
      setError('Incorrect email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ padding: '0 24px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
        paddingBottom: 24, flexShrink: 0
      }}>
        <button className="btn-ghost" onClick={() => navigate(-1)} style={{ padding: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="var(--text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ fontSize: 18, fontWeight: 600 }}>Welcome Back</span>
      </div>

      <div className="page-content" style={{ paddingBottom: 32 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          {error && (
            <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid var(--danger)', borderRadius: 8, padding: '12px 16px', fontSize: 14, color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com" autoComplete="email"
              style={{ padding: '14px 16px', height: 52 }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Password</label>
              <button className="btn-ghost" onClick={() => navigate('/forgot-password')}
                style={{ fontSize: 13, color: 'var(--accent)', padding: 0 }}>
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                style={{ padding: '14px 48px 14px 16px', height: 52 }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button onClick={() => setShowPass(!showPass)} className="btn-ghost"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  {showPass
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" /><path d="M1 1l22 22" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" /></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="var(--text-muted)" strokeWidth="1.8" /><circle cx="12" cy="12" r="3" stroke="var(--text-muted)" strokeWidth="1.8" /></>
                  }
                </svg>
              </button>
            </div>
          </div>

          <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <button className="btn-ghost" onClick={() => navigate('/signup')}
              style={{ color: 'var(--accent)', padding: 0, fontSize: 14 }}>
              Sign up
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
