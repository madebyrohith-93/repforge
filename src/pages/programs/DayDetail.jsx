import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export default function DayDetail() {
  const { programId, dayId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [day, setDay] = useState(null)
  const [program, setProgram] = useState(null)
  const [exercises, setExercises] = useState([])
  const [loggedIds, setLoggedIds] = useState(new Set())
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [dayId])

  const load = async () => {
    setLoading(true)
    const [{ data: dayData }, { data: progData }, { data: exData }] = await Promise.all([
      supabase.from('days').select('*').eq('id', dayId).single(),
      supabase.from('programs').select('*').eq('id', programId).single(),
      supabase.from('exercises').select('*').eq('day_id', dayId).order('order_index')
    ])
    setDay(dayData)
    setProgram(progData)
    setExercises(exData || [])

    // Check for today's session
    const today = new Date().toISOString().split('T')[0]
    const { data: sess } = await supabase
      .from('sessions')
      .select('*, set_logs(exercise_id)')
      .eq('user_id', user.id)
      .eq('day_id', dayId)
      .gte('logged_at', today)
      .single()

    if (sess) {
      setSession(sess)
      const ids = new Set(sess.set_logs?.map(l => l.exercise_id))
      setLoggedIds(ids)
    }
    setLoading(false)
  }

  const ensureSession = async () => {
    if (session) return session
    const { data: sess } = await supabase
      .from('sessions')
      .insert({ user_id: user.id, day_id: dayId, logged_at: new Date().toISOString() })
      .select()
      .single()
    setSession(sess)
    return sess
  }

  const handleExerciseTap = async (exercise) => {
    const sess = await ensureSession()
    navigate(`/programs/${programId}/day/${dayId}/exercise/${exercise.id}?sessionId=${sess.id}`)
  }

  const loggedCount = loggedIds.size
  const total = exercises.length

  if (loading) return <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ display: 'flex', gap: 8 }}>
      {[1,2,3].map(i => <span key={i} className={`dot-${i}`} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'block' }} />)}
    </div>
  </div>

  return (
    <div className="page">
      {/* Header */}
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 16px) 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <button className="btn-ghost" onClick={() => navigate(-1)} style={{ padding: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="var(--text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>{program?.name}</div>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>
              Week {day?.week_number} · {day?.day_label || `Day ${day?.day_number}`}
            </h2>
          </div>
        </div>

        {/* Progress bar */}
        {loggedCount > 0 && (
          <div style={{ marginTop: 12, marginBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{loggedCount} of {total} logged</span>
              <span style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'DM Mono, monospace' }}>
                {Math.round((loggedCount / total) * 100)}%
              </span>
            </div>
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 2 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(loggedCount / total) * 100}%` }}
                style={{ height: '100%', background: 'var(--accent)', borderRadius: 2 }}
              />
            </div>
          </div>
        )}
        <div className="divider" style={{ marginTop: 16 }} />
      </div>

      {/* Exercise list */}
      <div className="page-content" style={{ padding: '12px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {exercises.map((ex, i) => {
            const isLogged = loggedIds.has(ex.id)
            return (
              <motion.button
                key={ex.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleExerciseTap(ex)}
                style={{
                  background: isLogged ? 'rgba(232,255,71,0.05)' : 'var(--surface)',
                  border: `1px solid ${isLogged ? 'rgba(232,255,71,0.3)' : 'var(--border)'}`,
                  borderRadius: 12, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', textAlign: 'left', width: '100%'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Check or empty circle */}
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${isLogged ? 'var(--accent)' : 'var(--border)'}`,
                    background: isLogged ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isLogged && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{ex.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
                      {ex.planned_sets ? `${ex.planned_sets} sets` : ''}
                      {ex.planned_sets && ex.planned_reps_per_set ? ' × ' : ''}
                      {ex.planned_reps_per_set ? `${ex.planned_reps_per_set} reps` : ''}
                      {!ex.planned_sets && !ex.planned_reps_per_set ? 'Tap to log' : ''}
                    </div>
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

      {/* Sticky footer */}
      {loggedCount > 0 && (
        <div style={{ padding: '12px 20px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', flexShrink: 0, borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
          <button className="btn-primary" onClick={() => navigate('/today')}>
            {loggedCount === total ? '✓ Session Complete' : `Done for now (${loggedCount}/${total})`}
          </button>
        </div>
      )}
    </div>
  )
}
