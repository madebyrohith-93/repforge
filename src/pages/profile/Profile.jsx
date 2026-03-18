import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'

export default function Profile() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const [showSignOut, setShowSignOut] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const initials = user?.email?.[0]?.toUpperCase() || 'U'

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    navigate('/')
  }

  const menuItems = [
    {
      label: 'Account',
      items: [
        { icon: '✉️', label: 'Email', value: user?.email, action: null },
      ]
    },
    {
      label: 'Preferences',
      items: [
        { icon: '⚖️', label: 'Default weight unit', value: 'kg', action: () => {} },
        { icon: '🔔', label: 'Notifications', value: '', action: () => {} },
      ]
    },
    {
      label: 'About',
      items: [
        { icon: '📋', label: 'Privacy Policy', value: '', action: () => {} },
        { icon: '📄', label: 'Terms of Service', value: '', action: () => {} },
      ]
    }
  ]

  return (
    <div className="page">
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 20px) 20px 0', flexShrink: 0 }}>
        <h1 className="font-mono" style={{ fontSize: 28, fontWeight: 500, marginBottom: 24 }}>Profile</h1>
      </div>

      <div className="page-content" style={{ padding: '0 20px' }}>
        {/* Avatar + user info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--accent-dim)', border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: 'var(--accent)',
            fontFamily: 'DM Mono, monospace', flexShrink: 0
          }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
              {user?.email?.split('@')[0]}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
        </motion.div>

        {/* Settings groups */}
        {menuItems.map((group, gi) => (
          <motion.div
            key={gi}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.08 }}
            style={{ marginBottom: 20 }}
          >
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.07em', marginBottom: 8, textTransform: 'uppercase' }}>
              {group.label}
            </p>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              {group.items.map((item, ii) => (
                <div key={ii}>
                  <button
                    onClick={item.action || undefined}
                    style={{
                      width: '100%', padding: '14px 16px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'none', border: 'none', cursor: item.action ? 'pointer' : 'default',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <span style={{ fontSize: 15, color: 'var(--text)' }}>{item.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {item.value && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.value}</span>}
                      {item.action && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M9 18l6-6-6-6" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                  {ii < group.items.length - 1 && <div className="divider" />}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Sign Out */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <button
            onClick={() => setShowSignOut(true)}
            style={{
              width: '100%', padding: '14px 16px', marginBottom: 40,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, color: 'var(--danger)', fontSize: 15, fontWeight: 600,
              cursor: 'pointer', textAlign: 'center'
            }}
          >
            Sign Out
          </button>
        </motion.div>
      </div>

      {/* Sign out confirmation bottom sheet */}
      <AnimatePresence>
        {showSignOut && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignOut(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
                background: 'var(--surface)', borderTop: '1px solid var(--border)',
                borderRadius: '20px 20px 0 0',
                padding: '20px 20px',
                paddingBottom: 'calc(20px + env(safe-area-inset-bottom))'
              }}
            >
              <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />
              <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>Sign out?</p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 20 }}>
                Your data is saved and will be here when you return.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  style={{
                    height: 52, borderRadius: 10, border: 'none',
                    background: 'var(--danger)', color: '#fff',
                    fontSize: 15, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  {signingOut ? 'Signing out...' : 'Sign Out'}
                </button>
                <button className="btn-secondary" onClick={() => setShowSignOut(false)}>Cancel</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
