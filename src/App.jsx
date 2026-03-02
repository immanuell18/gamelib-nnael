import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/ProtectedRoute'
import useAuthStore from './store/useAuthStore'
import useGameStore from './store/useGameStore'

import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import LibraryPage from './pages/LibraryPage'
import StatsPage from './pages/StatsPage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
}

function AnimatedRoutes() {
  const location = useLocation()
  const isLogin = location.pathname === '/login'

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <Routes location={location}>
          {/* Public (redirect to / if already logged in) */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

          {/* Public pages (Home is accessible, but library/stats require login) */}
          <Route path="/" element={<><Navbar /><HomePage /></>} />
          <Route path="/search" element={<><Navbar /><SearchPage /></>} />

          {/* Protected pages */}
          <Route path="/library" element={<ProtectedRoute><Navbar /><LibraryPage /></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute><Navbar /><StatsPage /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin" element={<AdminRoute><Navbar /><AdminPage /></AdminRoute>} />

          {/* 404 fallback */}
          <Route path="*" element={<><Navbar /><div style={{ paddingTop: '64px', textAlign: 'center', padding: '6rem 1rem', color: 'var(--text-muted)' }}>Page not found</div></>} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

// Auth + library sync on app mount
function AuthSync() {
  const initAuth = useAuthStore(s => s.initAuth)
  const user = useAuthStore(s => s.user)
  const subscribeLibrary = useGameStore(s => s.subscribeLibrary)
  const unsubscribeLibrary = useGameStore(s => s.unsubscribeLibrary)

  useEffect(() => {
    const cleanup = initAuth()
    return () => { if (cleanup) cleanup() }
  }, [])

  useEffect(() => {
    if (user) {
      subscribeLibrary(user.uid)
    } else {
      unsubscribeLibrary()
    }
  }, [user?.uid])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthSync />
      <AnimatedRoutes />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '0.875rem',
          },
        }}
      />
    </BrowserRouter>
  )
}
