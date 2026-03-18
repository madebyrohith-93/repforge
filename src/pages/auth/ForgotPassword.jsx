import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const resetPassword = useAuthStore(s => s.resetPassword)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
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
        <span style={{ fontSize: 18, fontWeight: 600 }}>Reset Password</span>
      </div>

      <div className="page-content" style={{ paddingBottom: 32 }}>
        {!sent ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Enter your email and we'll send you a link to reset your password.
            </p>

            {error && (
              <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid var(--danger)', borderRadius: 8, padding: '12px 16px', fontSize: 14, color: 'var(--danger)' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="you@email.com"
                autoComplete="email"
                style={{ padding: '14px 16px', height: 52 }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, paddingTop: 40, textAlign: 'center' }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--accent-dim)', border: '2px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Check your inbox</p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                We sent a reset link to <span style={{ color: 'var(--text)' }}>{email}</span>
              </p>
            </div>
            <button className="btn-secondary" onClick={() => navigate('/login')} style={{ marginTop: 8 }}>
              Back to Log In
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
