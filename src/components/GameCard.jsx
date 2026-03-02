import { motion } from 'framer-motion'
import { Star, Plus, Check, LogIn } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
    playing: { label: 'Playing', badge: 'badge-playing', icon: 'bi-controller' },
    completed: { label: 'Completed', badge: 'badge-completed', icon: 'bi-trophy-fill' },
    'on-hold': { label: 'On Hold', badge: 'badge-onhold', icon: 'bi-pause-circle-fill' },
    wishlist: { label: 'Wishlist', badge: 'badge-wishlist', icon: 'bi-bookmark-fill' },
    dropped: { label: 'Dropped', badge: 'badge-dropped', icon: 'bi-x-circle-fill' },
}

const IMG_FALLBACK = 'https://placehold.co/400x225/111120/4a4a6a?text=No+Image'

export default function GameCard({ game, index = 0, onOpenDetail }) {
    const navigate = useNavigate()
    const user = useAuthStore(s => s.user)
    const addGame = useGameStore(s => s.addGame)
    const isInLibrary = useGameStore(s => s.isInLibrary)

    const libraryEntry = isInLibrary(game.id || game.rawg_id)
    const inLibrary = !!libraryEntry

    const toastStyle = {
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        fontSize: '0.875rem',
    }

    const handleAdd = async (e) => {
        e.stopPropagation()
        if (!user) {
            toast('Login dulu untuk tambah game! 👆', { icon: '🔒', style: toastStyle })
            navigate('/login')
            return
        }
        const added = await addGame(user.uid, game, 'wishlist')
        if (added) {
            toast.success(`"${game.name}" ditambahkan!`, { icon: '📝', style: toastStyle })
        } else {
            toast('Sudah ada di library!', { icon: '✅', style: toastStyle })
        }
    }

    const rating = game.rating || 0

    return (
        <motion.div
            id={`game-card-${game.id || game.rawg_id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.045, duration: 0.3 }}
            onClick={() => onOpenDetail?.(game)}
            whileHover={{ y: -5 }}
            style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-card)',
                border: inLibrary ? '1px solid rgba(6,214,245,0.3)' : '1px solid var(--border)',
                borderRadius: '0.875rem',
                overflow: 'hidden',
                transition: 'border-color 0.3s, box-shadow 0.3s',
                boxShadow: inLibrary ? '0 0 20px rgba(6,214,245,0.08)' : 'none',
                position: 'relative',
            }}
        >
            {/* Image */}
            <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                <motion.img
                    src={game.background_image || IMG_FALLBACK}
                    alt={game.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.4 }}
                    onError={e => { e.target.src = IMG_FALLBACK }}
                />

                {/* Gradient */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.3) 50%, transparent 100%)',
                }} />

                {/* Top badges */}
                <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', right: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {inLibrary && libraryEntry?.status && (
                        <span className={`badge ${STATUS_CONFIG[libraryEntry.status]?.badge}`}>
                            <i className={`bi ${STATUS_CONFIG[libraryEntry.status]?.icon}`} style={{ fontSize: '0.7rem' }} /> {STATUS_CONFIG[libraryEntry.status]?.label}
                        </span>
                    )}
                    {game.metacritic && (
                        <span style={{
                            marginLeft: 'auto',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            fontFamily: 'Orbitron, monospace',
                            background: game.metacritic >= 75 ? 'rgba(16,245,160,0.85)' : game.metacritic >= 50 ? 'rgba(255,214,10,0.85)' : 'rgba(255,56,100,0.85)',
                            color: '#050508',
                        }}>
                            {game.metacritic}
                        </span>
                    )}
                </div>

                {/* RAWG rating */}
                {rating > 0 && (
                    <div style={{
                        position: 'absolute', bottom: '0.5rem', left: '0.625rem',
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                    }}>
                        <Star size={11} fill="var(--yellow)" color="var(--yellow)" />
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--yellow)' }}>
                            {rating.toFixed(1)}
                        </span>
                    </div>
                )}

                {/* In-library cyan indicator */}
                {inLibrary && (
                    <div style={{
                        position: 'absolute', top: 0, right: 0,
                        width: '3px', height: '100%',
                        background: 'linear-gradient(to bottom, var(--cyan), var(--accent))',
                        opacity: 0.8,
                    }} />
                )}
            </div>

            {/* Content */}
            <div style={{ padding: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    lineHeight: 1.35,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    letterSpacing: '-0.01em',
                }}>
                    {game.name || game.title}
                </h3>

                {/* Genres + Year */}
                {(game.genres?.length > 0) && (
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {(game.genres || []).slice(0, 2).map((g, i) => (
                            <span key={i} style={{
                                fontSize: '0.65rem',
                                color: 'var(--text-muted)',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid var(--border)',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '3px',
                                fontWeight: 500,
                            }}>
                                {typeof g === 'string' ? g : g.name}
                            </span>
                        ))}
                        {game.released && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                {game.released.split('-')[0]}
                            </span>
                        )}
                    </div>
                )}

                {/* Personal rating */}
                {inLibrary && libraryEntry?.personal_rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star size={11} fill="var(--cyan)" color="var(--cyan)" />
                        <span style={{ fontSize: '0.7rem', color: 'var(--cyan)', fontWeight: 700 }}>
                            My Rating: {libraryEntry.personal_rating}/10
                        </span>
                    </div>
                )}

                {/* Add button */}
                <motion.button
                    id={`add-btn-${game.id || game.rawg_id}`}
                    onClick={handleAdd}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                        marginTop: 'auto',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: inLibrary ? '1px solid rgba(6,214,245,0.3)' : '1px solid var(--border)',
                        background: inLibrary ? 'rgba(6,214,245,0.06)' : 'rgba(255,255,255,0.03)',
                        color: inLibrary ? 'var(--cyan)' : 'var(--text-secondary)',
                        fontSize: '0.775rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.375rem',
                        transition: 'all 0.2s ease',
                        fontFamily: 'Outfit, sans-serif',
                        letterSpacing: '0.01em',
                    }}
                >
                    {inLibrary ? <Check size={13} /> : <Plus size={13} />}
                    {inLibrary ? 'In Library' : 'Add to Library'}
                </motion.button>
            </div>
        </motion.div>
    )
}
