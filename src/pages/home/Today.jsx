import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useProgramStore } from '../../store/programStore'
import { supabase } from '../../lib/supabase'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function Today() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { programs, activeProgram, fetchPrograms, loading } = useProgramStore()
  const [activeDays, setActiveDays] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedDayExercises, setSelectedDayExercises] = useState([])
  const [loadingDay, setLoadingDay] = useState(false)

  const now = new Date()
  const dateLabel = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`

  useEffect(() => {
    if (user) fetchPrograms(user.id)
  }, [user])

  useEffect(() => {
    if (activeProgram) loadDays(activeProgram.id)
  }, [activeProgram])

  const loadDays = async (programId) => {
    const { data } = await supabase
      .from('days')
      .select('*')
      .eq('program_id', programId)
      .order('week_number').order('day_number')
    setActiveDays(data || [])
    if (data?.length) {
      const today = data[0]
      setSelectedDay(today)
      loadExercises(today.id)
    }
  }

  const loadExercises = async (dayId) => {
    setLoadingDay(true)
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .eq('day_id', dayId)
      .order('order_index')
    setSelectedDayExercises(data || [])
    setLoadingDay(false)
  }

  const handleDaySelect = (day) => {
    setSelectedDay(day)
    loadExercises(day.id)
  }

  if (loading) return <LoadingState />

  return (
    <div className="page">
      {/* Header */}
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 20px) 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span className="font-mono" style={{ fontSize: 16, fontWeight: 500, color: 'var(--accent)', letterSpacing: '0.05em' }}>
            REPFORGE
          </span>
          <button
            onClick={() => navigate('/profile')}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--surface)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text)', fontSize: 13, fontWeight: 600
            }}
          >
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </button>
        </div>
      </div>

      <div className="page-content" style={{ padding: '0 20px' }}>
        {/* Date */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{dateLabel}</p>
          <h1 className="font-mono" style={{ fontSize: 32, fontWeight: 500, marginBottom: 20 }}>Today</h1>
        </motion.div>

        {!activeProgram ? (
          <EmptyState navigate={navigate} />
        ) : (
          <>
            {/* Session Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="card"
              style={{ marginBottom: 16, borderLeft: '3px solid var(--accent)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                  {activeProgram.name}
                </span>
                {selectedDay && (
                  <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500, fontFamily: 'DM Mono, monospace' }}>
                    Wk {selectedDay.week_number} · {selectedDay.day_label || `Day ${selectedDay.day_number}`}
                  </span>
                )}
              </div>

              {/* Exercise chips */}
              {loadingDay ? (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ height: 28, width: 80, background: 'var(--surface-raised)', borderRadius: 6, opacity: 0.5 }} />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  {selectedDayExercises.map(ex => (
                    <span key={ex.id} style={{
                      fontSize: 12, padding: '5px 10px',
                      background: 'var(--surface-raised)', borderRadius: 6,
                      color: 'var(--text-muted)', border: '1px solid var(--border)'
                    }}>
                      {ex.name}
                    </span>
                  ))}
                </div>
              )}

              <button
                className="btn-primary"
                style={{ height: 44, fontSize: 14 }}
                onClick={() => selectedDay && navigate(`/programs/${activeProgram.id}/day/${selectedDay.id}`)}
              >
                Start Session
              </button>
            </motion.div>

            {/* Day selector */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 500 }}>
                NOT TODAY? PICK A DAY
              </p>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}
                className="scroll-area">
                {activeDays.slice(0, 20).map(day => (
                  <button
                    key={day.id}
                    onClick={() => handleDaySelect(day)}
                    style={{
                      flexShrink: 0, padding: '8px 14px',
                      borderRadius: 8, border: '1px solid',
                      borderColor: selectedDay?.id === day.id ? 'var(--accent)' : 'var(--border)',
                      background: selectedDay?.id === day.id ? 'var(--accent-dim)' : 'var(--surface)',
                      color: selectedDay?.id === day.id ? 'var(--accent)' : 'var(--text-muted)',
                      fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap'
                    }}
                  >
                    Wk{day.week_number} · {day.day_label || `D${day.day_number}`}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
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
      transition={{ delay: 0.15, duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 60, gap: 20 }}
    >
      {/* Barbell icon */}
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <rect x="8" y="28" width="48" height="8" rx="4" stroke="var(--border)" strokeWidth="2" />
        <rect x="4" y="22" width="8" height="20" rx="3" stroke="var(--border)" strokeWidth="2" />
        <rect x="52" y="22" width="8" height="20" rx="3" stroke="var(--border)" strokeWidth="2" />
        <rect x="1" y="26" width="6" height="12" rx="2" stroke="var(--text-muted)" strokeWidth="1.5" />
        <rect x="57" y="26" width="6" height="12" rx="2" stroke="var(--text-muted)" strokeWidth="1.5" />
      </svg>
      <div>
        <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No program yet</p>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Upload your workout program to get started.
        </p>
      </div>
      <button
        className="btn-primary"
        style={{ width: 200 }}
        onClick={() => navigate('/programs')}
      >
        Upload Program
      </button>
    </motion.div>
  )
}

function LoadingState() {
  return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <span className="dot-1" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'block' }} />
        <span className="dot-2" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'block' }} />
        <span className="dot-3" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'block' }} />
      </div>
    </div>
  )
}
