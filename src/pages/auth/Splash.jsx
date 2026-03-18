import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Splash() {
  const navigate = useNavigate()

  return (
    <div className="page" style={{ padding: '0 24px', justifyContent: 'space-between' }}>

      {/* Top section — logo + tagline */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 80px)' }}
      >
        {/* Accent bar */}
        <div style={{ width: 40, height: 4, background: 'var(--accent)', borderRadius: 2, marginBottom: 24 }} />

        <h1 className="font-mono" style={{ fontSize: 52, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 16 }}>
          REP<br />FORGE
        </h1>

        <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: 280 }}>
          Your program, any format.<br />Logged in seconds.
        </p>
      </motion.div>

      {/* Middle — feature chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {[
          ['Upload PDF or photo', 'AI extracts your full program'],
          ['Any program structure', 'Normalized into one clean format'],
          ['Log sets as you train', 'Weight, reps, notes — all optional']
        ].map(([title, sub]) => (
          <div key={title} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 16px'
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', marginTop: 6, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{sub}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Bottom — CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 40px)',
          display: 'flex', flexDirection: 'column', gap: 12
        }}
      >
        <button className="btn-primary" onClick={() => navigate('/signup')}>
          Get Started
        </button>
        <button className="btn-secondary" onClick={() => navigate('/login')}>
          Log In
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          By continuing you agree to our Terms &amp; Privacy Policy
        </p>
      </motion.div>
    </div>
  )
}
