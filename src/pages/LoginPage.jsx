import { motion } from 'framer-motion'
import { Chrome, Gamepad2, Zap, Shield } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import toast from 'react-hot-toast'

const toastStyle = {
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
}

const features = [
    { icon: 'bi-controller', text: 'Track semua game yang pernah kamu mainin' },
    { icon: 'bi-star-fill', text: 'Kasih personal rating & review' },
    { icon: 'bi-bar-chart-fill', text: 'Lihat statistik gaming journey kamu' },
    { icon: 'bi-search', text: 'Discover jutaan game via RAWG API' },
]

export default function LoginPage() {
    const { loginWithGoogle, loading } = useAuthStore()

    const handleLogin = async () => {
        const { success, error } = await loginWithGoogle()
        if (!success) {
            toast.error('Login gagal: ' + (error || 'Unknown error'), { style: toastStyle })
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: 'var(--bg-primary)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background blobs */}
            <div style={{
                position: 'absolute', top: '-10%', left: '-5%',
                width: '500px', height: '500px',
                background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-15%', right: '-5%',
                width: '400px', height: '400px',
                background: 'radial-gradient(circle, rgba(6,214,245,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            {/* Left panel — branding */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '3rem 4rem',
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, transparent 60%)',
                    borderRight: '1px solid var(--border)',
                }}
            >
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
                    <div style={{
                        width: '48px', height: '48px',
                        background: 'linear-gradient(135deg, #7c3aed, #06d6f5)',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 25px rgba(124,58,237,0.4)',
                    }}>
                        <Gamepad2 size={26} color="white" />
                    </div>
                    <span style={{
                        fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.5rem',
                        color: 'var(--text-primary)', letterSpacing: '-0.03em',
                    }}>
                        Game<span style={{
                            background: 'linear-gradient(135deg, #a78bfa, #06d6f5)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>Lib</span>
                    </span>
                </div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                        fontWeight: 900,
                        lineHeight: 1.1,
                        letterSpacing: '-0.04em',
                        marginBottom: '1rem',
                    }}
                >
                    Your Ultimate<br />
                    <span style={{
                        background: 'linear-gradient(135deg, #a78bfa, #06d6f5)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        Gaming Diary
                    </span>
                </motion.h1>

                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '420px' }}>
                    Track semua game favoritmu, catat progress, kasih rating, dan bangun koleksi gaming library-mu sendiri.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.07 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                        >
                            <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(124,58,237,0.12)`, border: '1px solid rgba(124,58,237,0.25)', borderRadius: '8px', flexShrink: 0 }}>
                                <i className={`bi ${f.icon}`} style={{ fontSize: '1rem', color: 'var(--accent-light)' }} />
                            </div>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{f.text}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Right panel — login form */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{
                    width: '420px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '3rem 2.5rem',
                }}
            >
                <div style={{ width: '100%', maxWidth: '340px' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                        <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,214,245,0.1))', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '16px', margin: '0 auto 0.875rem' }}>
                            <i className="bi bi-person-circle" style={{ fontSize: '1.75rem', color: 'var(--accent-light)' }} />
                        </div>
                        <h2 style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '1.625rem',
                            fontWeight: 800,
                            letterSpacing: '-0.03em',
                            color: 'var(--text-primary)',
                            marginBottom: '0.5rem',
                        }}>
                            Welcome Back
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Login untuk mulai tracking game kamu
                        </p>
                    </div>

                    {/* Google Login Button */}
                    <motion.button
                        id="btn-google-login"
                        onClick={handleLogin}
                        disabled={loading}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            width: '100%',
                            padding: '0.9375rem',
                            background: 'white',
                            color: '#1a1a2e',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '0.9375rem',
                            fontWeight: 700,
                            fontFamily: 'Outfit, sans-serif',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(124,58,237,0.08)',
                            opacity: loading ? 0.7 : 1,
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {/* Google SVG icon */}
                        <svg width="20" height="20" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        {loading ? 'Loading...' : 'Lanjutkan dengan Google'}
                    </motion.button>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>aman & gratis</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    </div>

                    {/* Info box */}
                    <div style={{
                        padding: '0.875rem 1rem',
                        background: 'rgba(6,214,245,0.05)',
                        border: '1px solid rgba(6,214,245,0.15)',
                        borderRadius: '8px',
                        display: 'flex',
                        gap: '0.625rem',
                        alignItems: 'flex-start',
                    }}>
                        <Shield size={15} color="var(--cyan)" style={{ flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            Data game library kamu tersimpan aman di cloud dan bisa diakses dari mana saja.
                        </p>
                    </div>

                    {/* Footer */}
                    <p style={{ textAlign: 'center', fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '1.75rem' }}>
                        Dengan login, kamu menyetujui{' '}
                        <span style={{ color: 'var(--accent-light)', cursor: 'pointer' }}>Terms of Service</span>
                        {' '}kami.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
