import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, Search, LayoutGrid, BarChart3, Home, Shield, LogOut, ChevronDown } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'
import toast from 'react-hot-toast'

const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/search', label: 'Discover', icon: Search },
    { path: '/library', label: 'Library', icon: LayoutGrid },
    { path: '/stats', label: 'Stats', icon: BarChart3 },
]

export default function Navbar() {
    const location = useLocation()
    const library = useGameStore(s => s.library)
    const { user, isAdmin, logout } = useAuthStore()
    const [showDropdown, setShowDropdown] = useState(false)

    const handleLogout = async () => {
        await logout()
        setShowDropdown(false)
        toast.success('Logged out!', {
            style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '8px' }
        })
    }

    return (
        <nav id="navbar" className="glass-strong"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '64px' }}
        >
            {/* Top neon line */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--cyan) 70%, transparent 100%)',
                opacity: 0.8,
            }} />

            <div className="page-container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Logo */}
                <Link to="/" id="nav-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <motion.div whileHover={{ scale: 1.05, rotate: -5 }} style={{
                        width: '36px', height: '36px',
                        background: 'linear-gradient(135deg, #7c3aed, #06d6f5)',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(124,58,237,0.5)',
                    }}>
                        <Gamepad2 size={20} color="white" />
                    </motion.div>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                        Game<span style={{ background: 'linear-gradient(135deg, var(--accent-light), var(--cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Lib</span>
                    </span>
                </Link>

                {/* Center nav links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {navItems.map(({ path, label, icon: Icon }) => {
                        const active = location.pathname === path
                        return (
                            <Link key={path} to={path} id={`nav-${label.toLowerCase()}`}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                                    padding: '0.5rem 0.875rem', borderRadius: '0.5rem', textDecoration: 'none',
                                    fontSize: '0.875rem', fontWeight: active ? 700 : 500,
                                    color: active ? 'var(--cyan)' : 'var(--text-secondary)',
                                    background: active ? 'rgba(6,214,245,0.07)' : 'transparent',
                                    border: active ? '1px solid rgba(6,214,245,0.2)' : '1px solid transparent',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'var(--border-light)' } }}
                                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' } }}
                            >
                                <Icon size={15} />
                                {label}
                                {label === 'Library' && library.length > 0 && (
                                    <span style={{
                                        background: 'linear-gradient(135deg, var(--accent), var(--cyan))', color: 'white',
                                        fontSize: '0.65rem', fontWeight: 800, padding: '0 5px', borderRadius: '4px',
                                        minWidth: '18px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>{library.length}</span>
                                )}
                            </Link>
                        )
                    })}

                    {/* Admin link */}
                    {isAdmin && (
                        <Link to="/admin" id="nav-admin"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                padding: '0.5rem 0.875rem', borderRadius: '0.5rem', textDecoration: 'none',
                                fontSize: '0.875rem', fontWeight: location.pathname === '/admin' ? 700 : 500,
                                color: location.pathname === '/admin' ? 'var(--red)' : 'var(--text-muted)',
                                background: location.pathname === '/admin' ? 'rgba(255,56,100,0.08)' : 'transparent',
                                border: location.pathname === '/admin' ? '1px solid rgba(255,56,100,0.25)' : '1px solid transparent',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <Shield size={14} /> Admin
                        </Link>
                    )}
                </div>

                {/* Right: user section */}
                <div style={{ position: 'relative' }}>
                    {user ? (
                        <>
                            <button
                                id="nav-user-btn"
                                onClick={() => setShowDropdown(v => !v)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.375rem 0.625rem', borderRadius: '0.5rem',
                                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                                    cursor: 'pointer', color: 'var(--text-primary)',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <img
                                    src={user.photoURL || ''}
                                    alt={user.displayName}
                                    style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid var(--accent)' }}
                                    onError={e => e.target.style.display = 'none'}
                                />
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user.displayName?.split(' ')[0]}
                                </span>
                                <ChevronDown size={13} color="var(--text-muted)" style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                            </button>

                            <AnimatePresence>
                                {showDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                        transition={{ duration: 0.15 }}
                                        style={{
                                            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                                            borderRadius: '0.75rem', overflow: 'hidden', minWidth: '200px',
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                                            zIndex: 200,
                                        }}
                                    >
                                        {/* User info */}
                                        <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.displayName}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{user.email}</div>
                                            {isAdmin && (
                                                <div style={{ marginTop: '0.375rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.1rem 0.4rem', background: 'rgba(255,56,100,0.1)', border: '1px solid rgba(255,56,100,0.25)', borderRadius: '3px' }}>
                                                    <Shield size={10} color="var(--red)" />
                                                    <span style={{ fontSize: '0.6rem', color: 'var(--red)', fontWeight: 700 }}>ADMIN</span>
                                                </div>
                                            )}
                                        </div>
                                        {/* Logout */}
                                        <button
                                            id="btn-logout"
                                            onClick={handleLogout}
                                            style={{
                                                width: '100%', padding: '0.75rem 1rem',
                                                display: 'flex', alignItems: 'center', gap: '0.625rem',
                                                background: 'transparent', border: 'none', cursor: 'pointer',
                                                color: 'var(--red)', fontSize: '0.875rem', fontWeight: 600, textAlign: 'left',
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,56,100,0.06)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <LogOut size={15} /> Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Close dropdown on outside click */}
                            {showDropdown && (
                                <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setShowDropdown(false)} />
                            )}
                        </>
                    ) : (
                        <Link to="/login" id="nav-login" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
