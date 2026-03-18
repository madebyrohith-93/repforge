import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useProgramStore } from '../../store/programStore'

const PROCESSING_MESSAGES = [
  'Reading your document...',
  'Finding exercises...',
  'Detecting weeks and days...',
  'Building your program...'
]

export default function UploadFlow() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const { saveProgram } = useProgramStore()
  const fileRef = useRef(null)
  const imageRef = useRef(null)

  const [step, setStep] = useState('pick') // pick | processing | preview | name | error
  const [msgIndex, setMsgIndex] = useState(0)
  const [extracted, setExtracted] = useState(null)
  const [programName, setProgramName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleFile = async (file) => {
    if (!file) return
    setStep('processing')

    // Cycle processing messages
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % PROCESSING_MESSAGES.length)
    }, 2200)

    try {
      let base64Images = []

      if (file.type === 'application/pdf') {
        base64Images = await pdfToImages(file)
      } else {
        const b64 = await fileToBase64(file)
        base64Images = [b64]
      }

      const result = await callExtractionAPI(base64Images)
      clearInterval(interval)
      setExtracted(result)
      setProgramName(result.program_name || '')
      setStep('preview')
    } catch (err) {
      clearInterval(interval)
      setError(err.message || 'Could not read your program. Try a clearer image or PDF.')
      setStep('error')
    }
  }

  const callExtractionAPI = async (base64Images) => {
    const content = [
      {
        type: 'text',
        text: `You are extracting workout program data from a document. Return ONLY valid JSON, no markdown, no explanation.

Extract ONLY exercise names and their set/rep structure. Ignore all coaching notes, descriptions, nutrition info, and any non-exercise content.

Return this exact structure:
{
  "program_name": "string (detected name or 'My Program')",
  "total_weeks": number,
  "days": [
    {
      "week_number": 1,
      "day_number": 1,
      "day_label": "Push Day",
      "exercises": [
        {
          "name": "Bench Press",
          "planned_sets": 4,
          "planned_reps_per_set": 8
        }
      ]
    }
  ]
}

Rules:
- planned_sets and planned_reps_per_set are integers or null if not specified
- If reps are a range (e.g. 8-12), use the lower number
- day_label should be the day name from the document (Push, Pull, Legs, Monday, etc.)
- Include ALL weeks and ALL days found in the document
- If week count is unclear, count the distinct week patterns`
      },
      ...base64Images.slice(0, 8).map(img => ({
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data: img }
      }))
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content }]
      })
    })

    if (!response.ok) throw new Error('AI extraction failed. Please try again.')
    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  }

  const handleSave = async () => {
    if (!programName.trim()) return
    setSaving(true)
    try {
      await saveProgram({ ...extracted, name: programName.trim() }, user.id)
      navigate('/programs')
    } catch (err) {
      setError('Failed to save program. Please try again.')
      setStep('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 16px) 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button className="btn-ghost" onClick={() => navigate('/programs')} style={{ padding: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="var(--text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Upload Program</h2>
        </div>
      </div>

      <div className="page-content" style={{ padding: '0 20px' }}>
        <AnimatePresence mode="wait">

          {/* STEP: PICK */}
          {step === 'pick' && (
            <motion.div key="pick" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
                Upload your workout program as a PDF or photo. Our AI will extract all exercises, sets, and reps automatically.
              </p>

              <input ref={fileRef} type="file" accept=".pdf,application/pdf" style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files?.[0])} />
              <input ref={imageRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files?.[0])} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'PDF or Document', sub: 'From your files', icon: '📄', ref: fileRef },
                  { label: 'Photo or Image', sub: 'Camera or photos library', icon: '📷', ref: imageRef }
                ].map(opt => (
                  <motion.button
                    key={opt.label}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => opt.ref.current?.click()}
                    style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 14, padding: '20px 20px',
                      display: 'flex', alignItems: 'center', gap: 16,
                      cursor: 'pointer', textAlign: 'left', width: '100%'
                    }}
                  >
                    <span style={{ fontSize: 32 }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{opt.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{opt.sub}</div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div style={{ marginTop: 24, padding: '14px 16px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  Works with Jeff Nippard programs, Stronger By Science, any PDF, handwritten notes, screenshots — any format.
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP: PROCESSING */}
          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 32 }}>
              <motion.div
                animate={{ boxShadow: ['0 0 0 0 rgba(232,255,71,0.4)', '0 0 0 20px rgba(232,255,71,0)', '0 0 0 0 rgba(232,255,71,0)'] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                style={{
                  width: 80, height: 80, borderRadius: '50%',
                  border: '2px solid var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <span className="font-mono" style={{ fontSize: 24, fontWeight: 500, color: 'var(--accent)' }}>RF</span>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{ fontSize: 16, color: 'var(--text-muted)', textAlign: 'center' }}
                >
                  {PROCESSING_MESSAGES[msgIndex]}
                </motion.p>
              </AnimatePresence>

              <div style={{ display: 'flex', gap: 8 }}>
                <span className="dot-1" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'block' }} />
                <span className="dot-2" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'block' }} />
                <span className="dot-3" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'block' }} />
              </div>
            </motion.div>
          )}

          {/* STEP: PREVIEW */}
          {step === 'preview' && extracted && (
            <motion.div key="preview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Does this look right?</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Nothing was changed from your plan — just reformatted for logging.
                </p>
              </div>

              <div style={{ marginBottom: 16, padding: '12px 14px', background: 'var(--accent-dim)', borderRadius: 10, border: '1px solid rgba(232,255,71,0.2)' }}>
                <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>
                  Found: {extracted.total_weeks} weeks · {extracted.days?.length} days · {extracted.days?.reduce((a, d) => a + (d.exercises?.length || 0), 0)} exercises
                </div>
              </div>

              {/* Preview of days */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {extracted.days?.slice(0, 6).map((day, i) => (
                  <div key={i} className="card" style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>
                        Wk {day.week_number} · {day.day_label || `Day ${day.day_number}`}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {day.exercises?.length} exercises
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {day.exercises?.slice(0, 4).map((ex, j) => (
                        <span key={j} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--surface-raised)', padding: '3px 8px', borderRadius: 4 }}>
                          {ex.name}
                        </span>
                      ))}
                      {(day.exercises?.length || 0) > 4 && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{day.exercises.length - 4} more</span>
                      )}
                    </div>
                  </div>
                ))}
                {(extracted.days?.length || 0) > 6 && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                    + {extracted.days.length - 6} more days
                  </p>
                )}
              </div>

              {/* Name input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Program Name</label>
                <input
                  value={programName}
                  onChange={e => setProgramName(e.target.value)}
                  placeholder="e.g. Jeff Nippard PPL"
                  style={{ padding: '14px 16px', height: 52 }}
                />
              </div>

              <button className="btn-primary" onClick={handleSave} disabled={saving || !programName.trim()}>
                {saving ? 'Saving...' : 'Save Program'}
              </button>
              <button className="btn-ghost" onClick={() => setStep('pick')}
                style={{ width: '100%', marginTop: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                Upload a different file
              </button>
            </motion.div>
          )}

          {/* STEP: ERROR */}
          {step === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, gap: 20, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,68,68,0.1)', border: '2px solid var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v4m0 4h.01M22 12A10 10 0 112 12a10 10 0 0120 0z" stroke="var(--danger)" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Something went wrong</p>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{error}</p>
              </div>
              <button className="btn-primary" onClick={() => setStep('pick')}>Try Again</button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

async function fileToBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload = () => res(reader.result.split(',')[1])
    reader.onerror = rej
    reader.readAsDataURL(file)
  })
}

async function pdfToImages(file) {
  const pdfjsLib = await import('pdfjs-dist')
  const workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.min.js', import.meta.url).href
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const images = []
  for (let i = 1; i <= Math.min(pdf.numPages, 8); i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
    images.push(canvas.toDataURL('image/jpeg', 0.85).split(',')[1])
  }
  return images
}
