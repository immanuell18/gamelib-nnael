import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Search, TrendingUp, Gamepad2, ArrowRight, Zap } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import GameCard from '../components/GameCard'
import SkeletonCard from '../components/SkeletonCard'
import GameDetailModal from '../components/GameDetailModal'
import { getPopularGames } from '../services/rawgApi'

const StatCard = ({ icon, label, value, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '1rem',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
        }}
    >
        <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `${color}20`,
            border: `1px solid ${color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
        }}>
            <span style={{ fontSize: '1.375rem' }}>{icon}</span>
        </div>
        <div>
            <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{label}</div>
        </div>
    </motion.div>
)

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
        [...library]
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 4)
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
            {/* ── Hero Section ── */}
            <section style={{
                padding: '5rem 0 4rem',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, transparent 60%)',
                borderBottom: '1px solid var(--border)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', top: '-20%', right: '-5%',
                    width: '500px', height: '500px',
                    background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div className="page-container">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ maxWidth: '700px' }}
                    >
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.375rem 0.875rem',
                            background: 'rgba(124,58,237,0.12)',
                            border: '1px solid rgba(124,58,237,0.3)',
                            borderRadius: '999px', marginBottom: '1.5rem',
                        }}>
                            <Zap size={14} color="var(--accent-light)" />
                            <span style={{ fontSize: '0.8rem', color: 'var(--accent-light)', fontWeight: 600 }}>
                                Personal Game Tracker
                            </span>
                        </div>

                        <h1 style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                            fontWeight: 900,
                            lineHeight: 1.1,
                            letterSpacing: '-0.04em',
                            color: 'var(--text-primary)',
                            marginBottom: '1.25rem',
                        }}>
                            Track Every Game<br />
                            <span className="gradient-text">You've Ever Played</span>
                        </h1>

                        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '560px' }}>
                            Discover games, track your progress, rate your favorites, and build the ultimate personal gaming diary powered by RAWG.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <Link to="/search" id="hero-search-btn" className="btn-primary" style={{ padding: '0.875rem 1.75rem', fontSize: '0.9375rem' }}>
                                <Search size={18} /> Discover Games
                            </Link>
                            <Link to="/library" id="hero-library-btn" className="btn-ghost" style={{ padding: '0.875rem 1.75rem', fontSize: '0.9375rem' }}>
                                <Gamepad2 size={18} /> My Library
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section style={{ padding: '3rem 0' }}>
                <div className="page-container">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="section-title"
                        style={{ marginBottom: '1.25rem' }}
                    >
                        Your Journey 🎯
                    </motion.h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.875rem' }}>
                        <StatCard icon="🎮" label="Currently Playing" value={stats.playing} color="var(--green)" delay={0.1} />
                        <StatCard icon="🏆" label="Completed" value={stats.completed} color="var(--accent)" delay={0.15} />
                        <StatCard icon="⏸️" label="On Hold" value={stats.onHold} color="var(--yellow)" delay={0.2} />
                        <StatCard icon="📝" label="Wishlist" value={stats.wishlist} color="var(--blue)" delay={0.25} />
                        <StatCard icon="🕐" label="Total Hours" value={`${stats.totalHours}h`} color="var(--orange)" delay={0.3} />
                        <StatCard icon="⭐" label="Avg My Rating" value={stats.avgRating || '—'} color="var(--yellow)" delay={0.35} />
                    </div>
                </div>
            </section>

            {/* ── Recent Activity ── */}
            {recentGames.length > 0 && (
                <section style={{ padding: '0 0 3rem' }}>
                    <div className="page-container">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <h2 className="section-title">Recent Activity 🕹️</h2>
                            <Link to="/library" className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.375rem 0.875rem' }}>
                                View All <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
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

            {/* ── Trending Games ── */}
            <section style={{ padding: '0 0 5rem' }}>
                <div className="page-container">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <TrendingUp size={22} color="var(--accent-light)" />
                            <h2 className="section-title">Trending Games 🔥</h2>
                        </div>
                        <Link to="/search" className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.375rem 0.875rem' }}>
                            See More <ArrowRight size={14} />
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
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
