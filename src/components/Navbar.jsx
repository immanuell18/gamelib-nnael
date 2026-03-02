import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, Search, LayoutGrid, BarChart3, Home } from 'lucide-react'
import useGameStore from '../store/useGameStore'

const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/search', label: 'Discover', icon: Search },
    { path: '/library', label: 'Library', icon: LayoutGrid },
    { path: '/stats', label: 'Stats', icon: BarChart3 },
]

export default function Navbar() {
    const location = useLocation()
    const library = useGameStore(s => s.library)

    return (
        <nav
            id="navbar"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                height: '64px',
            }}
            className="glass-strong"
        >
            <div className="page-container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Logo */}
                <Link to="/" id="nav-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, #7c3aed, #9f5cf5)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
                    }}>
                        <Gamepad2 size={20} color="white" />
                    </div>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
                        Game<span className="gradient-text">Lib</span>
                    </span>
                </Link>

                {/* Nav Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {navItems.map(({ path, label, icon: Icon }) => {
                        const active = location.pathname === path
                        return (
                            <Link
                                key={path}
                                to={path}
                                id={`nav-${label.toLowerCase()}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    padding: '0.5rem 0.875rem',
                                    borderRadius: '0.625rem',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: active ? 600 : 500,
                                    color: active ? 'var(--accent-light)' : 'var(--text-secondary)',
                                    background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                }}
                                onMouseEnter={e => {
                                    if (!active) {
                                        e.currentTarget.style.color = 'var(--text-primary)'
                                        e.currentTarget.style.background = 'var(--bg-card-hover)'
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!active) {
                                        e.currentTarget.style.color = 'var(--text-secondary)'
                                        e.currentTarget.style.background = 'transparent'
                                    }
                                }}
                            >
                                <Icon size={16} />
                                {label}
                                {label === 'Library' && library.length > 0 && (
                                    <span style={{
                                        background: 'var(--accent)',
                                        color: 'white',
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        padding: '0 5px',
                                        borderRadius: '999px',
                                        minWidth: '18px',
                                        height: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        {library.length}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
