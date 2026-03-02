import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Search, TrendingUp, Gamepad2, ArrowRight, Zap, Trophy, Clock, Star } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import GameCard from '../components/GameCard'
import SkeletonCard from '../components/SkeletonCard'
import GameDetailModal from '../components/GameDetailModal'
import { getPopularGames } from '../services/rawgApi'

/* ── Stat Card ─────────────────────────────────────────── */
const StatCard = ({ icon, label, value, color, delay, accent = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -3, scale: 1.02 }}
        style={{
            background: 'var(--bg-card)',
            border: `1px solid ${accent ? 'rgba(6,214,245,0.2)' : 'var(--border)'}`,
            borderRadius: '0.875rem',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'default',
            transition: 'box-shadow 0.3s ease',
        }}
    >
        {/* Corner accent */}
        <div style={{
            position: 'absolute', top: 0, right: 0,
            width: '60px', height: '60px',
            background: `radial-gradient(circle at top right, ${color}25, transparent 70%)`,
        }} />
        <div style={{
            width: '44px', height: '44px',
            borderRadius: '10px',
            background: `${color}15`,
            border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            fontSize: '1.25rem',
        }}>
            {icon}
        </div>
        <div>
            <div style={{
                fontSize: '1.75rem',
                fontWeight: 900,
                fontFamily: 'Outfit, sans-serif',
                color: 'var(--text-primary)',
                lineHeight: 1,
                letterSpacing: '-0.03em',
            }}>
                {value}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>
                {label}
            </div>
        </div>
    </motion.div>
)

/* ── Floating particle ─────────────────────────────────── */
const Particle = ({ style }) => (
    <div style={{
        position: 'absolute',
        width: '2px',
        height: '2px',
        borderRadius: '50%',
        background: 'var(--cyan)',
        opacity: 0.4,
        ...style,
    }} />
)

/* ── Main Component ────────────────────────────────────── */
export default function HomePage() {
    const library = useGameStore(s => s.library)
    const [popularGames, setPopularGames] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedGame, setSelectedGame] = useState(null)

    const stats = useMemo(() => {
        const playing = library.filter(g => g.status === 'playing').length
        const completed = library.filter(g => g.status === 'completed').length
        const onHold = library.filter(g => g.status === 'on-hold').length
        const wishlist = library.filter(g => g.status === 'wishlist').length
        const dropped = library.filter(g => g.status === 'dropped').length
        const totalHours = library.reduce((acc, g) => acc + (g.play_hours || 0), 0)
        const rated = library.filter(g => g.personal_rating)
        const avgRating = rated.length
            ? (rated.reduce((acc, g) => acc + g.personal_rating, 0) / rated.length).toFixed(1)
            : 0
        return { playing, completed, onHold, wishlist, dropped, totalHours, avgRating, total: library.length }
    }, [library])

    const recentGames = useMemo(() =>
        [...library].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 4)
        , [library])

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getPopularGames(1, 8)
                setPopularGames(data.results || [])
            } catch (err) {
                console.error('Failed to fetch popular games:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <div style={{ paddingTop: '64px' }}>

            {/* ══════════════════════════════════════════
                HERO SECTION
            ══════════════════════════════════════════ */}
            <section style={{
                padding: '5.5rem 0 4.5rem',
                position: 'relative',
                overflow: 'hidden',
                borderBottom: '1px solid var(--border)',
            }}>
                {/* Animated bg blobs */}
                <div style={{
                    position: 'absolute', top: '-10%', left: '40%',
                    width: '600px', height: '600px',
                    background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    animation: 'cyanPulse 4s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-20%', right: '-5%',
                    width: '400px', height: '400px',
                    background: 'radial-gradient(circle, rgba(6,214,245,0.08) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                {/* Floating particles */}
                {[
                    { top: '20%', left: '60%' }, { top: '60%', left: '75%' },
                    { top: '40%', left: '85%' }, { top: '15%', left: '90%' },
                    { top: '75%', left: '65%' },
                ].map((pos, i) => <Particle key={i} style={pos} />)}

                {/* Horizontal neon line */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: 0,
                    width: '40%',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(6,214,245,0.15))',
                }} />

                <div className="page-container">
                    <div style={{ maxWidth: '750px' }}>

                        {/* Tag pill */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.375rem 0.875rem',
                                background: 'rgba(6,214,245,0.06)',
                                border: '1px solid rgba(6,214,245,0.25)',
                                borderRadius: '4px',
                                marginBottom: '1.75rem',
                            }}
                        >
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 6px var(--cyan)' }} className="animate-cyan-pulse" />
                            <span style={{ fontSize: '0.75rem', color: 'var(--cyan)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Orbitron, monospace' }}>
                                Personal Game Tracker
                            </span>
                        </motion.div>

                        {/* Main heading */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            style={{
                                fontFamily: 'Outfit, sans-serif',
                                fontSize: 'clamp(2.75rem, 6.5vw, 5rem)',
                                fontWeight: 900,
                                lineHeight: 1.05,
                                letterSpacing: '-0.04em',
                                color: 'var(--text-primary)',
                                marginBottom: '1.25rem',
                            }}
                        >
                            Track Every<br />
                            Game You've{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #a78bfa 0%, #06d6f5 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>
                                Ever Played
                            </span>
                        </motion.h1>

                        {/* Sub */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            style={{
                                fontSize: '1.0625rem',
                                color: 'var(--text-secondary)',
                                lineHeight: 1.75,
                                marginBottom: '2.25rem',
                                maxWidth: '520px',
                            }}
                        >
                            Discover games, track your progress, rate your favorites, and build the ultimate personal gaming diary — powered by RAWG.
                        </motion.p>

                        {/* CTA buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                            style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}
                        >
                            <Link to="/search" id="hero-search-btn" className="btn-primary" style={{ padding: '0.875rem 1.875rem', fontSize: '0.9375rem', fontFamily: 'Outfit, sans-serif' }}>
                                <Search size={17} /> Discover Games
                            </Link>
                            <Link to="/library" id="hero-library-btn" className="btn-cyan" style={{ padding: '0.875rem 1.875rem', fontSize: '0.9375rem', fontFamily: 'Outfit, sans-serif' }}>
                                <Gamepad2 size={17} /> My Library
                            </Link>
                        </motion.div>

                        {/* Quick stats strip */}
                        {stats.total > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                style={{
                                    display: 'flex',
                                    gap: '1.5rem',
                                    marginTop: '2.5rem',
                                    paddingTop: '1.75rem',
                                    borderTop: '1px solid var(--border)',
                                }}
                            >
                                {[
                                    { val: stats.total, lbl: 'Total Games' },
                                    { val: `${stats.completed}`, lbl: 'Completed' },
                                    { val: `${stats.totalHours}h`, lbl: 'Hours Logged' },
                                ].map(({ val, lbl }) => (
                                    <div key={lbl}>
                                        <div style={{ fontSize: '1.375rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>{val}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{lbl}</div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                STATS GRID
            ══════════════════════════════════════════ */}
            <section style={{ padding: '3rem 0' }}>
                <div className="page-container">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '3px', height: '20px', background: 'linear-gradient(to bottom, var(--accent), var(--cyan))', borderRadius: '2px' }} />
                        <h2 className="section-title">Your Journey</h2>
                        <i className="bi bi-crosshair" style={{ color: 'var(--cyan)', fontSize: '1.1rem' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.875rem' }}>
                        <StatCard icon={<i className="bi bi-controller" />} label="Currently Playing" value={stats.playing} color="var(--green)" delay={0.05} />
                        <StatCard icon={<i className="bi bi-trophy-fill" />} label="Completed" value={stats.completed} color="var(--accent-light)" delay={0.1} accent />
                        <StatCard icon={<i className="bi bi-pause-circle" />} label="On Hold" value={stats.onHold} color="var(--yellow)" delay={0.15} />
                        <StatCard icon={<i className="bi bi-bookmark-fill" />} label="Wishlist" value={stats.wishlist} color="#6b8cff" delay={0.2} />
                        <StatCard icon={<i className="bi bi-clock-fill" />} label="Total Hours" value={`${stats.totalHours}h`} color="var(--orange)" delay={0.25} />
                        <StatCard icon={<i className="bi bi-star-fill" />} label="Avg Rating" value={stats.avgRating || '—'} color="var(--yellow)" delay={0.3} />
                    </div>
                </div>
            </section>

            {/* Neon divider */}
            <div className="page-container"><div className="neon-line" /></div>

            {/* Recent Activity */}
            {recentGames.length > 0 && (
                <section style={{ padding: '2.5rem 0' }}>
                    <div className="page-container">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '3px', height: '20px', background: 'linear-gradient(to bottom, var(--cyan), var(--accent))', borderRadius: '2px' }} />
                                <h2 className="section-title">Recent Activity <i className="bi bi-joystick" style={{ color: 'var(--cyan)', fontSize: '1.1rem', verticalAlign: 'middle' }} /></h2>
                            </div>
                            <Link to="/library" className="btn-ghost" style={{ fontSize: '0.8rem' }}>
                                View All <ArrowRight size={13} />
                            </Link>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
                            {recentGames.map((g, i) => (
                                <GameCard
                                    key={g.id}
                                    game={{ ...g, id: g.rawg_id }}
                                    index={i}
                                    onOpenDetail={() => setSelectedGame({ ...g, id: g.rawg_id })}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Trending Games */}
            <section style={{ padding: '2.5rem 0 5rem' }}>
                <div className="page-container">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '3px', height: '20px', background: 'linear-gradient(to bottom, var(--red), var(--orange))', borderRadius: '2px' }} />
                            <TrendingUp size={18} color="var(--orange)" />
                            <h2 className="section-title">Trending Games <i className="bi bi-fire" style={{ color: 'var(--orange)', fontSize: '1.1rem', verticalAlign: 'middle' }} /></h2>
                        </div>
                        <Link to="/search" className="btn-ghost" style={{ fontSize: '0.8rem' }}>
                            See More <ArrowRight size={13} />
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
                            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
                            {popularGames.map((g, i) => (
                                <GameCard key={g.id} game={g} index={i} onOpenDetail={setSelectedGame} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {selectedGame && (
                <GameDetailModal game={selectedGame} onClose={() => setSelectedGame(null)} />
            )}
        </div>
    )
}
