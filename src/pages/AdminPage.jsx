import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import { Users, Gamepad2, Trophy, Clock, BarChart3, Search, RefreshCw } from 'lucide-react'

const STATUS_COLORS = {
    playing: { bg: 'var(--green-dim)', color: 'var(--green)', label: 'Playing', icon: 'bi-controller' },
    completed: { bg: 'rgba(124,58,237,0.1)', color: 'var(--accent-light)', label: 'Completed', icon: 'bi-trophy-fill' },
    'on-hold': { bg: 'var(--yellow-dim)', color: 'var(--yellow)', label: 'On Hold', icon: 'bi-pause-circle-fill' },
    wishlist: { bg: 'rgba(67,97,238,0.12)', color: '#6b8cff', label: 'Wishlist', icon: 'bi-bookmark-fill' },
    dropped: { bg: 'rgba(255,56,100,0.1)', color: 'var(--red)', label: 'Dropped', icon: 'bi-x-circle-fill' },
}

export default function AdminPage() {
    const [users, setUsers] = useState([])
    const [libraries, setLibraries] = useState({}) // { uid: [games] }
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [expandedUser, setExpandedUser] = useState(null)
    const [lastRefresh, setLastRefresh] = useState(new Date())

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch all users
            const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('lastLogin', 'desc')))
            const usersData = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
            setUsers(usersData)

            // Fetch library for each user
            const libMap = {}
            await Promise.all(usersData.map(async (user) => {
                const gamesSnap = await getDocs(collection(db, 'library', user.uid, 'games'))
                libMap[user.uid] = gamesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
            }))
            setLibraries(libMap)
        } catch (err) {
            console.error('Failed to fetch admin data:', err)
        } finally {
            setLoading(false)
            setLastRefresh(new Date())
        }
    }

    useEffect(() => { fetchData() }, [])

    // ── Global stats ─────────────────────────────────────────
    const globalStats = useMemo(() => {
        const allGames = Object.values(libraries).flat()
        return {
            totalUsers: users.length,
            totalGames: allGames.length,
            totalCompleted: allGames.filter(g => g.status === 'completed').length,
            totalHours: allGames.reduce((a, g) => a + (g.play_hours || 0), 0),
        }
    }, [users, libraries])

    // ── Top 5 most tracked games ──────────────────────────────
    const topGames = useMemo(() => {
        const map = {}
        Object.values(libraries).flat().forEach(g => {
            if (!map[g.rawg_id]) map[g.rawg_id] = { title: g.title, count: 0, image: g.background_image }
            map[g.rawg_id].count++
        })
        return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5)
    }, [libraries])

    const filteredUsers = users.filter(u =>
        u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{
                padding: '2.5rem 0 2rem',
                background: 'linear-gradient(to bottom, rgba(124,58,237,0.08), transparent)',
                borderBottom: '1px solid var(--border)',
            }}>
                <div className="page-container">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.75rem', background: 'rgba(255,56,100,0.1)', border: '1px solid rgba(255,56,100,0.3)', borderRadius: '4px', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--red)', fontWeight: 700, letterSpacing: '0.08em', fontFamily: 'Orbitron, monospace' }}>ADMIN PANEL</span>
                            </div>
                            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                User Management <i className="bi bi-shield-fill" style={{ color: 'var(--red)', fontSize: '1.25rem' }} />
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                Last updated: {lastRefresh.toLocaleTimeString()}
                            </p>
                        </div>
                        <button
                            onClick={fetchData}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.125rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                        >
                            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="page-container" style={{ padding: '2rem 1.5rem 5rem' }}>
                {/* Global stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                    {[
                        { icon: <Users size={20} />, val: globalStats.totalUsers, label: 'Total Users', color: 'var(--cyan)' },
                        { icon: <Gamepad2 size={20} />, val: globalStats.totalGames, label: 'Games Tracked', color: 'var(--accent-light)' },
                        { icon: <Trophy size={20} />, val: globalStats.totalCompleted, label: 'Games Completed', color: 'var(--green)' },
                        { icon: <Clock size={20} />, val: `${globalStats.totalHours}h`, label: 'Total Hours Logged', color: 'var(--orange)' },
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem', padding: '1.25rem' }}>
                            <div style={{ color: s.color, marginBottom: '0.75rem' }}>{s.icon}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.val}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
                    {/* User list */}
                    <div>
                        {/* Search */}
                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                            <Search size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input"
                                placeholder="Cari user..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading users...</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {filteredUsers.map((user, i) => {
                                    const games = libraries[user.uid] || []
                                    const playing = games.filter(g => g.status === 'playing').length
                                    const done = games.filter(g => g.status === 'completed').length
                                    const hours = games.reduce((a, g) => a + (g.play_hours || 0), 0)
                                    const expanded = expandedUser === user.uid

                                    return (
                                        <motion.div key={user.uid} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem', overflow: 'hidden' }}>
                                            {/* User row */}
                                            <div
                                                onClick={() => setExpandedUser(expanded ? null : user.uid)}
                                                style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                                            >
                                                <img src={user.photoURL || 'https://placehold.co/40x40/111120/4a4a6a?text=U'} alt={user.displayName}
                                                    style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--border)', flexShrink: 0 }}
                                                    onError={e => e.target.src = 'https://placehold.co/40x40/111120/4a4a6a?text=U'} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        {user.displayName || 'Unknown'}
                                                        {user.role === 'admin' && (
                                                            <span style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem', background: 'rgba(255,56,100,0.15)', color: 'var(--red)', border: '1px solid rgba(255,56,100,0.3)', borderRadius: '3px', fontWeight: 700 }}>ADMIN</span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '1.5rem', flexShrink: 0 }}>
                                                    {[
                                                        { val: games.length, label: 'games' },
                                                        { val: playing, label: 'playing' },
                                                        { val: done, label: 'done' },
                                                        { val: `${hours}h`, label: 'hours' },
                                                    ].map(s => (
                                                        <div key={s.label} style={{ textAlign: 'center' }}>
                                                            <div style={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)', fontSize: '1rem' }}>{s.val}</div>
                                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{s.label}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{expanded ? '▲' : '▼'}</span>
                                            </div>

                                            {/* Expanded game list */}
                                            {expanded && games.length > 0 && (
                                                <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 1.25rem', background: 'var(--bg-secondary)' }}>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.625rem', fontWeight: 600 }}>GAME LIBRARY</p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                                                        {games.map(g => (
                                                            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                <img src={g.background_image || ''} alt={g.title}
                                                                    style={{ width: '48px', height: '27px', objectFit: 'cover', borderRadius: '4px', background: 'var(--bg-card)', flexShrink: 0 }}
                                                                    onError={e => e.target.style.display = 'none'} />
                                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</span>
                                                                <span style={{
                                                                    fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '3px',
                                                                    background: STATUS_COLORS[g.status]?.bg || 'var(--bg-card)',
                                                                    color: STATUS_COLORS[g.status]?.color || 'var(--text-muted)',
                                                                }}>
                                                                    {STATUS_COLORS[g.status]?.label || g.status}
                                                                </span>
                                                                {g.personal_rating && (
                                                                    <span style={{ fontSize: '0.7rem', color: 'var(--yellow)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                                        <i className="bi bi-star-fill" style={{ fontSize: '0.6rem' }} /> {g.personal_rating}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {expanded && games.length === 0 && (
                                                <div style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.25rem', background: 'var(--bg-secondary)', textAlign: 'center' }}>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Belum ada game di library</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )
                                })}
                                {filteredUsers.length === 0 && (
                                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Tidak ada user ditemukan</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Top games */}
                    <div>
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem', padding: '1.25rem', position: 'sticky', top: '80px' }}>
                            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <BarChart3 size={16} color="var(--accent-light)" /> Most Tracked Games
                            </h3>
                            {topGames.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Belum ada data</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {topGames.map((g, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.7rem', color: 'var(--text-muted)', width: '16px', textAlign: 'center' }}>#{i + 1}</span>
                                            <img src={g.image} alt={g.title} style={{ width: '40px', height: '24px', objectFit: 'cover', borderRadius: '3px', background: 'var(--bg-secondary)', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</p>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--cyan)' }}>{g.count} user{g.count > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
