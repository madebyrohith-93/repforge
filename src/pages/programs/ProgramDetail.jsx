import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useProgramStore } from '../../store/programStore'

export default function ProgramDetail() {
  const { programId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { programs, setActiveProgram, deleteProgram } = useProgramStore()
  const [program, setProgram] = useState(null)
  const [days, setDays] = useState([])
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    loadProgram()
  }, [programId])

  const loadProgram = async () => {
    setLoading(true)
    const { data: prog } = await supabase.from('programs').select('*').eq('id', programId).single()
    const { data: dayData } = await supabase.from('days').select('*, exercises(count)').eq('program_id', programId).order('week_number').order('day_number')
    setProgram(prog)
    setDays(dayData || [])
    setSelectedWeek(1)
    setLoading(false)
  }

  const weeks = [...new Set((days || []).map(d => d.week_number))].sort((a, b) => a - b)
  const weekDays = days.filter(d => d.week_number === selectedWeek)

  const handleSetActive = async () => {
    await setActiveProgram(programId, user.id)
    setShowMenu(false)
    loadProgram()
  }

  const handleDelete = async () => {
    if (confirm('Delete this program? Log history is preserved.')) {
      await deleteProgram(programId, user.id)
      navigate('/programs')
    }
    setShowMenu(false)
  }

  if (loading) return <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ display: 'flex', gap: 8 }}>
      {[1,2,3].map(i => <span key={i} className={`dot-${i}`} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'block' }} />)}
    </div>
  </div>

  return (
    <div className="page">
      {/* Header */}
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 16px) 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button className="btn-ghost" onClick={() => navigate('/programs')} style={{ padding: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="var(--text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 style={{ flex: 1, fontSize: 18, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {program?.name}
          </h2>
          <div style={{ position: 'relative' }}>
            <button className="btn-ghost" onClick={() => setShowMenu(!showMenu)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="5" r="1.5" fill="var(--text-muted)" />
                <circle cx="12" cy="12" r="1.5" fill="var(--text-muted)" />
                <circle cx="12" cy="19" r="1.5" fill="var(--text-muted)" />
              </svg>
            </button>
            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', zIndex: 50,
                background: 'var(--surface-raised)', border: '1px solid var(--border)',
                borderRadius: 10, overflow: 'hidden', minWidth: 160
              }}>
                {!program?.is_active && (
                  <button onClick={handleSetActive} style={{ display: 'block', width: '100%', padding: '12px 16px', textAlign: 'left', background: 'none', border: 'none', color: 'var(--accent)', fontSize: 14, cursor: 'pointer' }}>
                    Set as Active
                  </button>
                )}
                <button onClick={handleDelete} style={{ display: 'block', width: '100%', padding: '12px 16px', textAlign: 'left', background: 'none', border: 'none', color: 'var(--danger)', fontSize: 14, cursor: 'pointer' }}>
                  Delete Program
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Week tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12 }} className="scroll-area">
          {weeks.map(wk => (
            <button
              key={wk}
              onClick={() => setSelectedWeek(wk)}
              style={{
                flexShrink: 0, padding: '7px 14px', borderRadius: 8,
                border: '1px solid', fontFamily: 'DM Mono, monospace',
                borderColor: selectedWeek === wk ? 'var(--accent)' : 'var(--border)',
                background: selectedWeek === wk ? 'var(--accent-dim)' : 'transparent',
                color: selectedWeek === wk ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer'
              }}
            >
              Wk {wk}
            </button>
          ))}
        </div>
        <div className="divider" />
      </div>

      {/* Day list */}
      <div className="page-content" style={{ padding: '12px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {weekDays.map((day, i) => (
            <motion.button
              key={day.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onClick={() => navigate(`/programs/${programId}/day/${day.id}`)}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '14px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', textAlign: 'left', width: '100%'
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>
                  {day.day_label || `Day ${day.day_number}`}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {day.exercises?.[0]?.count || 0} exercises
                </div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
