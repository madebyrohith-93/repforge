import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const signOut = useAuthStore(s => s.signOut)

  const handleBack = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="page" style={{ padding: '0 24px', justifyContent: 'center', alignItems: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center', width: '100%' }}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--accent-dim)', border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              stroke="var(--accent)" strokeWidth="1.8" />
            <path d="M22 6l-10 7L2 6" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </motion.div>

        <div>
          <h2 className="font-mono" style={{ fontSize: 26, fontWeight: 500, marginBottom: 12 }}>
            Verify your email
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 300 }}>
            We sent a verification link to your inbox. Click it to activate your account and get started.
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Check your spam folder if you don't see it
            </span>
          </div>

          <button className="btn-secondary" onClick={handleBack}>
            Use a different account
          </button>
        </div>
      </motion.div>
    </div>
  )
}
