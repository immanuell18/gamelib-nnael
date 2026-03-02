import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

// ── Loading spinner sementara auth state dicek ─────────────
function AuthLoader() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            flexDirection: 'column',
            gap: '1rem',
        }}>
            <div style={{
                width: '40px', height: '40px',
                border: '3px solid var(--border)',
                borderTopColor: 'var(--cyan)',
                borderRightColor: 'var(--accent)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Checking authentication...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}

// ── Protects routes that require login ─────────────────────
export function ProtectedRoute({ children }) {
    const { user, loading } = useAuthStore()
    if (loading) return <AuthLoader />
    if (!user) return <Navigate to="/login" replace />
    return children
}

// ── Protects routes that require admin role ────────────────
export function AdminRoute({ children }) {
    const { user, isAdmin, loading } = useAuthStore()
    if (loading) return <AuthLoader />
    if (!user) return <Navigate to="/login" replace />
    if (!isAdmin) return <Navigate to="/" replace />
    return children
}

// ── Redirects logged-in users away from login page ────────
export function PublicRoute({ children }) {
    const { user, loading } = useAuthStore()
    if (loading) return <AuthLoader />
    if (user) return <Navigate to="/" replace />
    return children
}
