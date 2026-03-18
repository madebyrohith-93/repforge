import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { AnimatePresence } from 'framer-motion'

// Auth pages
import Splash from './pages/auth/Splash'
import SignUp from './pages/auth/SignUp'
import LogIn from './pages/auth/LogIn'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyEmail from './pages/auth/VerifyEmail'

// App pages
import AppShell from './components/AppShell'
import Today from './pages/home/Today'
import Programs from './pages/programs/Programs'
import LogHistory from './pages/log/LogHistory'
import Profile from './pages/profile/Profile'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/today" replace />
  return children
}

function LoadingScreen() {
  return (
    <div className="page items-center justify-center">
      <div className="flex gap-2">
        <span className="dot-1 w-2 h-2 rounded-full bg-[var(--accent)]" />
        <span className="dot-2 w-2 h-2 rounded-full bg-[var(--accent)]" />
        <span className="dot-3 w-2 h-2 rounded-full bg-[var(--accent)]" />
      </div>
    </div>
  )
}

export default function App() {
  const init = useAuthStore(s => s.init)

  useEffect(() => { init() }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicRoute><Splash /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LogIn /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected — wrapped in AppShell (bottom nav) */}
        <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="today" element={<Today />} />
          <Route path="programs/*" element={<Programs />} />
          <Route path="log" element={<LogHistory />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
