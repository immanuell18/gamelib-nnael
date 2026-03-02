import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Clock, Star, Target, TrendingUp, Gamepad2, BookOpen, BarChart3 } from 'lucide-react'
import useGameStore from '../store/useGameStore'

const STATUS_CONFIG = {
    playing: { label: 'Playing', color: '#22c55e', icon: '🎮' },
    completed: { label: 'Completed', color: '#9f5cf5', icon: '🏆' },
    'on-hold': { label: 'On Hold', color: '#eab308', icon: '⏸️' },
    wishlist: { label: 'Wishlist', color: '#3b82f6', icon: '📝' },
    dropped: { label: 'Dropped', color: '#ef4444', icon: '❌' },
}

function StatBox({ icon, label, value, sub, color = 'var(--accent)', delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div style={{
                position: 'absolute', top: 0, right: 0,
                width: '120px', height: '120px',
                background: `radial-gradient(circle at top right, ${color}18, transparent 70%)`,
                pointerEvents: 'none',
            }} />
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{icon}</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.04em' }}>
                {value}
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.375rem' }}>{label}</div>
            {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{sub}</div>}
        </motion.div>
    )
}

function DonutChart({ data, total }) {
    // Simple SVG donut chart
    const size = 160
    const radius = 60
    const circumference = 2 * Math.PI * radius
    const cx = size / 2
    const cy = size / 2
    const strokeWidth = 20
    let offset = 0

    if (total === 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '160px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Belum ada data</p>
            </div>
        )
    }

    const segments = data.filter(d => d.count > 0)

    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            {segments.map((seg, i) => {
                const pct = seg.count / total
                const dashArray = pct * circumference
                const dashOffset = -offset * circumference
                offset += pct

                return (
                    <circle
                        key={seg.key}
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${dashArray} ${circumference}`}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 0.5s ease' }}
                    />
                )
            })}
        </svg>
    )
}

function RatingBar({ label, value, max = 10, color }) {
    const pct = (value / max) * 100
    return (
        <div style={{ marginBottom: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {label}
                </span>
                <span style={{ fontSize: '0.8rem', color: color || 'var(--text-secondary)', fontWeight: 700, marginLeft: '0.5rem' }}>
                    {value}/10
                </span>
            </div>
            <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: '999px', background: color || 'var(--accent)' }}
                />
            </div>
        </div>
    )
}

export default function StatsPage() {
    const library = useGameStore(s => s.library)

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

    const chartData = useMemo(() =>
        Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
            key,
            label: cfg.label,
            color: cfg.color,
            count: library.filter(g => g.status === key).length,
        }))
        , [library])

    const topRated = useMemo(() =>
        library
            .filter(g => g.personal_rating)
            .sort((a, b) => b.personal_rating - a.personal_rating)
            .slice(0, 5)
        , [library])

    const mostPlayed = useMemo(() =>
        library
            .filter(g => g.play_hours > 0)
            .sort((a, b) => b.play_hours - a.play_hours)
            .slice(0, 5)
        , [library])

    const genreStats = useMemo(() => {
        const map = {}
        library.forEach(g => {
            g.genres.forEach(genre => {
                map[genre] = (map[genre] || 0) + 1
            })
        })
        return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8)
    }, [library])

    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0


    return (
        <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{
                padding: '3rem 0 2.5rem',
                background: 'linear-gradient(to bottom, rgba(124,58,237,0.08), transparent)',
                borderBottom: '1px solid var(--border)',
            }}>
                <div className="page-container">
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.375rem' }}
                    >
                        Your Stats 📊
                    </motion.h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Statistik lengkap perjalanan gaming kamu</p>
                </div>
            </div>

            <div className="page-container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
                {library.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ textAlign: 'center', padding: '6rem 0' }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '0.75rem' }}>Belum ada statistik</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Tambahkan game ke library untuk melihat statistik kamu</p>
                    </motion.div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                        {/* Top stats row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            <StatBox icon="🎮" label="Total Games" value={stats.total} delay={0.05} color="#7c3aed" />
                            <StatBox icon="🏆" label="Completed" value={stats.completed} sub={`${completionRate}% completion rate`} delay={0.1} color="#9f5cf5" />
                            <StatBox icon="🕐" label="Total Hours" value={`${stats.totalHours}h`} sub={`≈ ${Math.round(stats.totalHours / 24)} days`} delay={0.15} color="#f97316" />
                            <StatBox icon="⭐" label="Avg Rating" value={stats.avgRating || '—'} sub="out of 10" delay={0.2} color="#eab308" />
                            <StatBox icon="🎮" label="Playing Now" value={stats.playing} delay={0.25} color="#22c55e" />
                            <StatBox icon="📝" label="In Wishlist" value={stats.wishlist} delay={0.3} color="#3b82f6" />
                        </div>

                        {/* Middle: Donut + Status breakdown */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            {/* Donut chart */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.5rem' }}
                            >
                                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <BarChart3 size={18} color="var(--accent-light)" /> Status Distribution
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <DonutChart data={chartData} total={stats.total} />
                                        <div style={{
                                            position: 'absolute', top: '50%', left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            textAlign: 'center',
                                        }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
                                                {stats.total}
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>GAMES</div>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        {chartData.map(d => d.count > 0 && (
                                            <div key={d.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d.label}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{d.count}</span>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({Math.round((d.count / stats.total) * 100)}%)</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Genre breakdown */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 }}
                                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.5rem' }}
                            >
                                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    🎯 Top Genres
                                </h3>
                                {genreStats.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Belum ada data genre</p>
                                ) : (
                                    genreStats.map(([genre, count], i) => (
                                        <div key={genre} style={{ marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{genre}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{count}</span>
                                            </div>
                                            <div style={{ height: '5px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(count / (genreStats[0]?.[1] || 1)) * 100}%` }}
                                                    transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                                                    style={{
                                                        height: '100%',
                                                        borderRadius: '999px',
                                                        background: `hsl(${260 + i * 20}, 70%, ${60 - i * 3}%)`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        </div>

                        {/* Top rated + Most played */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            {/* Top Rated */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.5rem' }}
                            >
                                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    ⭐ Top Rated by You
                                </h3>
                                {topRated.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Belum ada game yang dirating</p>
                                ) : (
                                    topRated.map((g, i) => (
                                        <div key={g.id} style={{ marginBottom: i < topRated.length - 1 ? '1rem' : 0 }}>
                                            <RatingBar
                                                label={`${i + 1}. ${g.title}`}
                                                value={g.personal_rating}
                                                color={g.personal_rating >= 8 ? 'var(--green)' : g.personal_rating >= 5 ? 'var(--yellow)' : 'var(--red)'}
                                            />
                                        </div>
                                    ))
                                )}
                            </motion.div>

                            {/* Most Played */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.5rem' }}
                            >
                                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    🕐 Most Played
                                </h3>
                                {mostPlayed.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Belum ada data jam main</p>
                                ) : (
                                    mostPlayed.map((g, i) => (
                                        <div key={g.id} style={{ marginBottom: i < mostPlayed.length - 1 ? '1rem' : 0 }}>
                                            <RatingBar
                                                label={`${i + 1}. ${g.title}`}
                                                value={g.play_hours}
                                                max={mostPlayed[0]?.play_hours || 100}
                                                color="var(--orange)"
                                            />
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '-0.5rem' }}>
                                                {g.play_hours} jam dimainkan
                                            </div>
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        </div>

                        {/* Completion achievement */}
                        {stats.completed > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(159,92,245,0.08))',
                                    border: '1px solid rgba(124,58,237,0.3)',
                                    borderRadius: '1rem',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.25rem',
                                }}
                            >
                                <div style={{ fontSize: '3rem' }}>🏆</div>
                                <div>
                                    <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.375rem' }}>
                                        Gamer Sejati!
                                    </h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                        Kamu udah menyelesaikan <strong style={{ color: 'var(--accent-light)' }}>{stats.completed} game</strong> dari total {stats.total} game di library.
                                        Completion rate: <strong style={{ color: 'var(--accent-light)' }}>{completionRate}%</strong>
                                    </p>
                                </div>
                            </motion.div>
                        )}

                    </div>
                )}
            </div>
        </div>
    )
}
