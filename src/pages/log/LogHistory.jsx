import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export default function LogHistory() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) loadSessions() }, [user])

  const loadSessions = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('sessions')
      .select(`*, days(day_label, day_number, week_number, programs(name)), set_logs(count)`)
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(50)
    setSessions(data || [])
    setLoading(false)
  }

  // Group by month
  const grouped = (sessions || []).reduce((acc, sess) => {
    const d = new Date(sess.logged_at)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!acc[key]) acc[key] = { label, items: [] }
    acc[key].items.push(sess)
    return acc
  }, {})

  return (
    <div className="page">
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 20px) 20px 16px', flexShrink: 0 }}>
        <h1 className="font-mono" style={{ fontSize: 28, fontWeight: 500 }}>History</h1>
      </div>

      <div className="page-content" style={{ padding: '0 20px' }}>
        {loading ? (
          <LoadingRows />
        ) : sessions.length === 0 ? (
          <EmptyState navigate={navigate} />
        ) : (
          Object.values(grouped).map((group, gi) => (
            <div key={gi} style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 10, textTransform: 'uppercase' }}>
                {group.label}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.items.map((sess, i) => {
                  const d = new Date(sess.logged_at)
                  const day = sess.days
                  const setCount = sess.set_logs?.[0]?.count || 0
                  return (
                    <motion.button
                      key={sess.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => navigate(`/log/${sess.id}`)}
                      className="card"
                      style={{ width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>
                          {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          {day?.programs?.name} · {day?.day_label || `Day ${day?.day_number}`}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, fontFamily: 'DM Mono, monospace' }}>
                          Wk {day?.week_number} · {setCount} sets logged
                        </div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function EmptyState({ navigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 60, gap: 16 }}
    >
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="var(--border)" strokeWidth="1.8" />
        <path d="M12 7v5l3 3" stroke="var(--border)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <div>
        <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>No sessions yet</p>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Start your first session from Today to see history here.
        </p>
      </div>
      <button className="btn-secondary" style={{ width: 180 }} onClick={() => navigate('/today')}>
        Go to Today
      </button>
    </motion.div>
  )
}

function LoadingRows() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[1,2,3,4].map(i => (
        <div key={i} className="card" style={{ height: 76, opacity: 0.4 }}>
          <div style={{ width: '50%', height: 14, background: 'var(--surface-raised)', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ width: '70%', height: 12, background: 'var(--surface-raised)', borderRadius: 4, marginBottom: 6 }} />
          <div style={{ width: '35%', height: 11, background: 'var(--surface-raised)', borderRadius: 4 }} />
        </div>
      ))}
    </div>
  )
}
