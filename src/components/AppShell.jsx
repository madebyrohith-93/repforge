import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const navItems = [
  {
    path: '/today',
    label: 'Today',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L4.09 12.96A1 1 0 005 14.5h7l-1 7.5 8.91-10.96A1 1 0 0019 9.5h-7l1-7.5z"
          stroke={active ? 'var(--accent)' : 'var(--text-muted)'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          fill={active ? 'var(--accent)' : 'none'} />
      </svg>
    )
  },
  {
    path: '/programs',
    label: 'Programs',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5"
          stroke={active ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.8"
          fill={active ? 'var(--accent-dim)' : 'none'} />
        <rect x="14" y="3" width="7" height="7" rx="1.5"
          stroke={active ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.8"
          fill={active ? 'var(--accent-dim)' : 'none'} />
        <rect x="3" y="14" width="7" height="7" rx="1.5"
          stroke={active ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.8"
          fill={active ? 'var(--accent-dim)' : 'none'} />
        <rect x="14" y="14" width="7" height="7" rx="1.5"
          stroke={active ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.8"
          fill={active ? 'var(--accent-dim)' : 'none'} />
      </svg>
    )
  },
  {
    path: '/log',
    label: 'History',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9"
          stroke={active ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.8" />
        <path d="M12 7v5l3 3"
          stroke={active ? 'var(--accent)' : 'var(--text-muted)'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4"
          stroke={active ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.8" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          stroke={active ? 'var(--accent)' : 'var(--text-muted)'}
          strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }
]

export default function AppShell() {
  return (
    <div className="page">
      {/* Page content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <Outlet />
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav" style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexShrink: 0,
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none', flex: 1 }}>
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.88 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '10px 0',
                }}
              >
                {item.icon(isActive)}
                <span style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '0.02em'
                }}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      width: 24,
                      height: 2,
                      background: 'var(--accent)',
                      borderRadius: 2
                    }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
