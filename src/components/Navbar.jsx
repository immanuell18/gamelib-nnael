import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, Search, LayoutGrid, BarChart3, Home, Shield, LogOut, ChevronDown, Menu, X } from 'lucide-react'
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
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleLogout = async () => {
        await logout()
        setShowDropdown(false)
        setMobileOpen(false)
        toast.success('Logged out!', {
            style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '8px' }
        })
    }

    const closeMobile = () => setMobileOpen(false)

    return (
        <>
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

                    {/* ── Desktop nav ── */}
                    <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
                                    onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' } }}
                                    onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent' } }}
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

                    {/* Right: user + hamburger */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {/* User section (desktop) */}
                        <div className="nav-desktop" style={{ position: 'relative' }}>
                            {user ? (
                                <>
                                    <button id="nav-user-btn" onClick={() => setShowDropdown(v => !v)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.375rem 0.625rem', borderRadius: '0.5rem',
                                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                                            cursor: 'pointer', color: 'var(--text-primary)',
                                        }}
                                    >
                                        <img src={user.photoURL || ''} alt={user.displayName}
                                            style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid var(--accent)' }}
                                            onError={e => e.target.style.display = 'none'}
                                        />
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {user.displayName?.split(' ')[0]}
                                        </span>
                                        <ChevronDown size={13} color="var(--text-muted)" style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                                    </button>

                                    <AnimatePresence>
                                        {showDropdown && (
                                            <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.15 }}
                                                style={{
                                                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                                                    borderRadius: '0.75rem', overflow: 'hidden', minWidth: '200px',
                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 200,
                                                }}
                                            >
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
                                                <button id="btn-logout" onClick={handleLogout}
                                                    style={{
                                                        width: '100%', padding: '0.75rem 1rem',
                                                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                                                        background: 'transparent', border: 'none', cursor: 'pointer',
                                                        color: 'var(--red)', fontSize: '0.875rem', fontWeight: 600, textAlign: 'left',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,56,100,0.06)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <LogOut size={15} /> Logout
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {showDropdown && <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setShowDropdown(false)} />}
                                </>
                            ) : (
                                <Link to="/login" id="nav-login" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Login</Link>
                            )}
                        </div>

                        {/* Hamburger (mobile only) */}
                        <button
                            id="nav-hamburger"
                            className="nav-mobile"
                            onClick={() => setMobileOpen(v => !v)}
                            style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: '8px', width: '38px', height: '38px',
                                display: 'none', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: 'var(--text-primary)',
                            }}
                        >
                            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 98, backdropFilter: 'blur(4px)' }}
                            onClick={closeMobile}
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            style={{
                                position: 'fixed', top: 0, right: 0, bottom: 0, width: '280px',
                                background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
                                zIndex: 99, display: 'flex', flexDirection: 'column', padding: '1rem',
                            }}
                        >
                            {/* Mobile user header */}
                            {user && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem', marginBottom: '1rem', marginTop: '60px' }}>
                                    <img src={user.photoURL || ''} alt={user.displayName}
                                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--accent)' }}
                                        onError={e => e.target.style.display = 'none'}
                                    />
                                    <div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.displayName}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                    </div>
                                </div>
                            )}
                            {!user && <div style={{ marginTop: '60px', marginBottom: '1rem' }} />}

                            {/* Mobile nav links */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                                {navItems.map(({ path, label, icon: Icon }) => {
                                    const active = location.pathname === path
                                    return (
                                        <Link key={path} to={path} onClick={closeMobile}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                padding: '0.75rem 1rem', borderRadius: '0.625rem', textDecoration: 'none',
                                                fontSize: '0.9375rem', fontWeight: active ? 700 : 500,
                                                color: active ? 'var(--cyan)' : 'var(--text-secondary)',
                                                background: active ? 'rgba(6,214,245,0.07)' : 'transparent',
                                                border: active ? '1px solid rgba(6,214,245,0.15)' : '1px solid transparent',
                                            }}
                                        >
                                            <Icon size={18} /> {label}
                                            {label === 'Library' && library.length > 0 && (
                                                <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>{library.length}</span>
                                            )}
                                        </Link>
                                    )
                                })}
                                {isAdmin && (
                                    <Link to="/admin" onClick={closeMobile}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            padding: '0.75rem 1rem', borderRadius: '0.625rem', textDecoration: 'none',
                                            fontSize: '0.9375rem', fontWeight: 600, color: 'var(--red)',
                                            background: 'rgba(255,56,100,0.06)', border: '1px solid rgba(255,56,100,0.15)',
                                        }}
                                    >
                                        <Shield size={18} /> Admin Panel
                                    </Link>
                                )}
                            </div>

                            {/* Bottom actions */}
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                {user ? (
                                    <button onClick={handleLogout}
                                        style={{
                                            width: '100%', padding: '0.75rem', borderRadius: '0.625rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                            background: 'rgba(255,56,100,0.08)', border: '1px solid rgba(255,56,100,0.2)',
                                            color: 'var(--red)', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
                                        }}
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                ) : (
                                    <Link to="/login" onClick={closeMobile} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                        Login
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <style>{`
                @media (max-width: 768px) {
                    .nav-desktop { display: none !important; }
                    .nav-mobile  { display: flex !important; }
                }
            `}</style>
        </>
    )
}
