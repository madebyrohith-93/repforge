import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

export default function ExerciseLog() {
  const { programId, dayId, exerciseId } = useParams()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)

  const [exercise, setExercise] = useState(null)
  const [allExercises, setAllExercises] = useState([])
  const [sets, setSets] = useState([])
  const [unit, setUnit] = useState('kg')
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)
  const [loading, setLoading] = useState(true)
  const saveTimer = useRef(null)

  useEffect(() => { load() }, [exerciseId, sessionId])

  const load = async () => {
    setLoading(true)
    const [{ data: ex }, { data: allEx }, { data: existingLogs }] = await Promise.all([
      supabase.from('exercises').select('*').eq('id', exerciseId).single(),
      supabase.from('exercises').select('*').eq('day_id', dayId).order('order_index'),
      sessionId
        ? supabase.from('set_logs').select('*').eq('session_id', sessionId).eq('exercise_id', exerciseId).order('set_number')
        : { data: [] }
    ])

    setExercise(ex)
    setAllExercises(allEx || [])

    // Get previous session data for ghost values
    const { data: prevLogs } = await supabase
      .from('set_logs')
      .select('*, sessions!inner(day_id, user_id)')
      .eq('exercise_id', exerciseId)
      .eq('sessions.user_id', user.id)
      .eq('sessions.day_id', dayId)
      .neq('session_id', sessionId || 'none')
      .order('set_number')
      .limit(6)

    const plannedSets = ex?.planned_sets || 3
    const initialSets = []

    for (let i = 0; i < plannedSets; i++) {
      const existing = existingLogs?.find(l => l.set_number === i + 1)
      const prev = prevLogs?.find(l => l.set_number === i + 1)
      initialSets.push({
        set_number: i + 1,
        weight: existing?.weight ?? '',
        reps: existing?.reps ?? '',
        skipped: existing?.skipped ?? false,
        id: existing?.id ?? null,
        prevWeight: prev?.weight ?? null,
        prevReps: prev?.reps ?? null,
        isDefault: true
      })
    }

    // Add any extra logged sets beyond planned
    const extraLogs = existingLogs?.filter(l => l.set_number > plannedSets) || []
    for (const extra of extraLogs) {
      initialSets.push({
        set_number: extra.set_number,
        weight: extra.weight ?? '',
        reps: extra.reps ?? '',
        skipped: extra.skipped ?? false,
        id: extra.id,
        prevWeight: null, prevReps: null,
        isDefault: false
      })
    }

    if (existingLogs?.[0]?.unit) setUnit(existingLogs[0].unit)
    setSets(initialSets)
    setLoading(false)
  }

  const saveSet = async (setIndex) => {
    if (!sessionId) return
    const s = sets[setIndex]
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      const payload = {
        session_id: sessionId,
        exercise_id: exerciseId,
        set_number: s.set_number,
        weight: s.weight !== '' ? parseFloat(s.weight) : null,
        reps: s.reps !== '' ? parseInt(s.reps) : null,
        unit,
        skipped: s.skipped
      }
      let result
      if (s.id) {
        result = await supabase.from('set_logs').update(payload).eq('id', s.id).select().single()
      } else {
        result = await supabase.from('set_logs').insert(payload).select().single()
      }
      if (result.data) {
        setSets(prev => prev.map((p, i) => i === setIndex ? { ...p, id: result.data.id } : p))
      }
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 1200)
    }, 600)
  }

  const updateSet = (index, field, value) => {
    setSets(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
    saveSet(index)
  }

  const toggleSkip = (index) => {
    setSets(prev => prev.map((s, i) => i === index ? { ...s, skipped: !s.skipped } : s))
    setTimeout(() => saveSet(index), 50)
  }

  const addSet = () => {
    if (sets.length >= 6) return
    setSets(prev => [...prev, {
      set_number: prev.length + 1,
      weight: '', reps: '', skipped: false, id: null,
      prevWeight: null, prevReps: null, isDefault: false
    }])
  }

  const removeSet = (index) => {
    const s = sets[index]
    if (s.id) supabase.from('set_logs').delete().eq('id', s.id)
    setSets(prev => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, set_number: i + 1 })))
  }

  const currentIndex = allExercises.findIndex(e => e.id === exerciseId)
  const prevEx = allExercises[currentIndex - 1]
  const nextEx = allExercises[currentIndex + 1]

  const navToExercise = (ex) => {
    navigate(`/programs/${programId}/day/${dayId}/exercise/${ex.id}?sessionId=${sessionId}`, { replace: true })
  }

  if (loading) return <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ display: 'flex', gap: 8 }}>
      {[1,2,3].map(i => <span key={i} className={`dot-${i}`} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'block' }} />)}
    </div>
  </div>

  return (
    <div className="page">
      {/* Saved flash */}
      <AnimatePresence>
        {savedFlash && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', top: 'calc(env(safe-area-inset-top) + 8px)',
              left: '50%', transform: 'translateX(-50%)',
              background: 'var(--accent)', color: '#000', fontSize: 12, fontWeight: 600,
              padding: '5px 14px', borderRadius: 20, zIndex: 100,
              pointerEvents: 'none'
            }}
          >
            Saved
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 16px) 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <button className="btn-ghost" onClick={() => navigate(-1)} style={{ padding: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="var(--text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div style={{ flex: 1 }}>
            <h2 className="font-mono" style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.2 }}>{exercise?.name}</h2>
            {(exercise?.planned_sets || exercise?.planned_reps_per_set) && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                Planned: {exercise.planned_sets ? `${exercise.planned_sets} sets` : ''}
                {exercise.planned_sets && exercise.planned_reps_per_set ? ' × ' : ''}
                {exercise.planned_reps_per_set ? `${exercise.planned_reps_per_set} reps` : ''}
              </div>
            )}
          </div>
          {/* Unit toggle */}
          <div style={{
            display: 'flex', border: '1px solid var(--border)',
            borderRadius: 8, overflow: 'hidden', flexShrink: 0
          }}>
            {['kg', 'lbs'].map(u => (
              <button key={u} onClick={() => setUnit(u)} style={{
                padding: '6px 12px', fontSize: 12, fontWeight: 600,
                background: unit === u ? 'var(--accent)' : 'transparent',
                color: unit === u ? '#000' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace'
              }}>{u}</button>
            ))}
          </div>
        </div>
        <div className="divider" style={{ marginTop: 14 }} />

        {/* Column labels */}
        <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 36px', gap: 8, padding: '10px 0 6px', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>#</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>WEIGHT ({unit})</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>REPS</span>
          <span />
        </div>
      </div>

      {/* Sets */}
      <div className="page-content" style={{ padding: '0 20px' }}>
        <AnimatePresence>
          {sets.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
            >
              <div style={{
                display: 'grid', gridTemplateColumns: '32px 1fr 1fr 36px',
                gap: 8, padding: '6px 0', alignItems: 'center',
                opacity: s.skipped ? 0.4 : 1,
                transition: 'opacity 0.2s'
              }}>
                {/* Set number */}
                <span className="font-mono" style={{ fontSize: 13, color: 'var(--text-muted)', paddingLeft: 2 }}>
                  {s.set_number}
                </span>

                {/* Weight */}
                <input
                  type="number"
                  inputMode="decimal"
                  value={s.weight}
                  onChange={e => updateSet(i, 'weight', e.target.value)}
                  placeholder={s.prevWeight !== null ? String(s.prevWeight) : '—'}
                  disabled={s.skipped}
                  style={{
                    height: 52, padding: '0 12px', textAlign: 'center',
                    fontSize: 18, fontFamily: 'DM Mono, monospace', fontWeight: 500,
                    borderColor: s.weight ? 'var(--accent)' : 'var(--border)'
                  }}
                />

                {/* Reps */}
                <input
                  type="number"
                  inputMode="numeric"
                  value={s.reps}
                  onChange={e => updateSet(i, 'reps', e.target.value)}
                  placeholder={s.prevReps !== null ? String(s.prevReps) : '—'}
                  disabled={s.skipped}
                  style={{
                    height: 52, padding: '0 12px', textAlign: 'center',
                    fontSize: 18, fontFamily: 'DM Mono, monospace', fontWeight: 500,
                    borderColor: s.reps ? 'var(--accent)' : 'var(--border)'
                  }}
                />

                {/* Skip / remove */}
                <button
                  onClick={() => s.isDefault ? toggleSkip(i) : removeSet(i)}
                  style={{
                    width: 36, height: 36, border: 'none', background: 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                >
                  {s.isDefault ? (
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      border: `2px solid ${s.skipped ? 'var(--accent)' : 'var(--border)'}`,
                      background: s.skipped ? 'var(--accent-dim)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {s.skipped && <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>}
                    </div>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="divider" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add set */}
        {sets.length < 6 && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={addSet}
            style={{
              marginTop: 12, width: '100%', height: 44,
              border: '1px dashed var(--border)', borderRadius: 10,
              background: 'transparent', color: 'var(--accent)',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            Add Set
          </motion.button>
        )}

        {/* Note */}
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => setNoteOpen(!noteOpen)}
            className="btn-ghost"
            style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {noteOpen ? 'Hide note' : note ? 'Edit note' : 'Add note'}
          </button>
          <AnimatePresence>
            {noteOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden', marginTop: 8 }}
              >
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Form cue, how it felt, anything..."
                  rows={2}
                  style={{ padding: '12px', resize: 'none', fontSize: 14, borderRadius: 8 }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom navigation between exercises */}
      <div style={{
        padding: '12px 20px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        flexShrink: 0, borderTop: '1px solid var(--border)',
        display: 'flex', gap: 10
      }}>
        <button
          className="btn-secondary"
          style={{ height: 48, flex: prevEx ? 1 : 0, minWidth: 48, opacity: prevEx ? 1 : 0.3 }}
          disabled={!prevEx}
          onClick={() => prevEx && navToExercise(prevEx)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="var(--text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          className="btn-secondary"
          style={{ height: 48, flex: 1 }}
          onClick={() => navigate(-1)}
        >
          Back to Day
        </button>
        <button
          className="btn-secondary"
          style={{ height: 48, flex: nextEx ? 1 : 0, minWidth: 48, opacity: nextEx ? 1 : 0.3 }}
          disabled={!nextEx}
          onClick={() => nextEx && navToExercise(nextEx)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="var(--text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
