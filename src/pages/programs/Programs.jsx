import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useProgramStore } from '../../store/programStore'
import ProgramDetail from './ProgramDetail'
import DayDetail from './DayDetail'
import ExerciseLog from './ExerciseLog'
import UploadFlow from './UploadFlow'

export default function Programs() {
  return (
    <Routes>
      <Route index element={<ProgramsList />} />
      <Route path="upload" element={<UploadFlow />} />
      <Route path=":programId" element={<ProgramDetail />} />
      <Route path=":programId/day/:dayId" element={<DayDetail />} />
      <Route path=":programId/day/:dayId/exercise/:exerciseId" element={<ExerciseLog />} />
    </Routes>
  )
}

function ProgramsList() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { programs, fetchPrograms, setActiveProgram, deleteProgram, loading } = useProgramStore()
  const [swipedId, setSwipedId] = useState(null)

  useEffect(() => {
    if (user) fetchPrograms(user.id)
  }, [user])

  const handleSetActive = async (id) => {
    await setActiveProgram(id, user.id)
    setSwipedId(null)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this program? Your log history will be preserved.')) {
      await deleteProgram(id, user.id)
    }
    setSwipedId(null)
  }

  return (
    <div className="page">
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 20px) 20px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="font-mono" style={{ fontSize: 28, fontWeight: 500 }}>Programs</h1>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate('/programs/upload')}
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--accent)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="#000" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </motion.button>
        </div>
      </div>

      <div className="page-content" style={{ padding: '0 20px' }}>
        {loading ? (
          <LoadingRows />
        ) : programs.length === 0 ? (
          <EmptyState navigate={navigate} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {programs.map((prog, i) => (
              <motion.div
                key={prog.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                style={{ position: 'relative', overflow: 'hidden', borderRadius: 14 }}
              >
                {/* Swipe action buttons */}
                <AnimatePresence>
                  {swipedId === prog.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'absolute', right: 0, top: 0, bottom: 0,
                        display: 'flex', alignItems: 'stretch', zIndex: 1
                      }}
                    >
                      {!prog.is_active && (
                        <button
                          onClick={() => handleSetActive(prog.id)}
                          style={{ padding: '0 16px', background: 'var(--accent)', color: '#000', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                        >
                          Set Active
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(prog.id)}
                        style={{ padding: '0 16px', background: 'var(--danger)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Program card */}
                <div
                  className="card"
                  style={{
                    borderLeft: prog.is_active ? '3px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: 14, cursor: 'pointer',
                    position: 'relative', zIndex: 2,
                    background: 'var(--surface)'
                  }}
                  onClick={() => swipedId === prog.id ? setSwipedId(null) : navigate(`/programs/${prog.id}`)}
                  onContextMenu={e => { e.preventDefault(); setSwipedId(swipedId === prog.id ? null : prog.id) }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        {prog.is_active && (
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#000', background: 'var(--accent)', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.05em' }}>
                            ACTIVE
                          </span>
                        )}
                        <span style={{ fontSize: 16, fontWeight: 600 }}>{prog.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          {prog.total_weeks} weeks
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          Uploaded {new Date(prog.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                      <path d="M9 18l6-6-6-6" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Hint */}
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 4 }}>
              Long-press a program to set active or delete
            </p>
          </div>
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
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 60, gap: 20 }}
    >
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        border: '2px dashed var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No programs yet</p>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Upload a PDF or photo of your workout program and we'll handle the rest.
        </p>
      </div>
      <button className="btn-primary" style={{ width: 220 }} onClick={() => navigate('/programs/upload')}>
        Upload Your Program
      </button>
    </motion.div>
  )
}

function LoadingRows() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1,2,3].map(i => (
        <div key={i} className="card" style={{ height: 72, opacity: 0.4 }}>
          <div style={{ width: '60%', height: 14, background: 'var(--surface-raised)', borderRadius: 4, marginBottom: 10 }} />
          <div style={{ width: '40%', height: 12, background: 'var(--surface-raised)', borderRadius: 4 }} />
        </div>
      ))}
    </div>
  )
}
