import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'

export default function SignUp() {
  const navigate = useNavigate()
  const signUp = useAuthStore(s => s.signUp)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email'
    if (!password || password.length < 8) e.password = 'Password must be at least 8 characters'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    try {
      await signUp(email, password)
      navigate('/verify-email')
    } catch (err) {
      setErrors({ general: err.message || 'Something went wrong. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ padding: '0 24px' }}>
      {/* Header */}
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
        <span style={{ fontSize: 18, fontWeight: 600 }}>Create Account</span>
      </div>

      <div className="page-content" style={{ paddingBottom: 32 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          {errors.general && (
            <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid var(--danger)', borderRadius: 8, padding: '12px 16px', fontSize: 14, color: 'var(--danger)' }}>
              {errors.general}
            </div>
          )}

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: null })) }}
              placeholder="you@email.com"
              autoComplete="email"
              style={{ padding: '14px 16px', height: 52 }}
            />
            {errors.email && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{errors.email}</span>}
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: null })) }}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                style={{ padding: '14px 48px 14px 16px', height: 52 }}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="btn-ghost"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  {showPass
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" /><path d="M1 1l22 22" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" /></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="var(--text-muted)" strokeWidth="1.8" /><circle cx="12" cy="12" r="3" stroke="var(--text-muted)" strokeWidth="1.8" /></>
                  }
                </svg>
              </button>
            </div>
            {errors.password && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{errors.password}</span>}
          </div>

          <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <button className="btn-ghost" onClick={() => navigate('/login')} style={{ color: 'var(--accent)', padding: 0, fontSize: 14 }}>
              Log in
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
