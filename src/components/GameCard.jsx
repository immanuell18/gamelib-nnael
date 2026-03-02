import { motion } from 'framer-motion'
import { Star, Plus, Check, Clock, Bookmark, BookmarkCheck, Trophy, Pause } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
    playing: { label: 'Playing', color: 'var(--green)', badge: 'badge-playing', icon: '🎮' },
    completed: { label: 'Completed', color: 'var(--accent-light)', badge: 'badge-completed', icon: '🏆' },
    'on-hold': { label: 'On Hold', color: 'var(--yellow)', badge: 'badge-onhold', icon: '⏸️' },
    wishlist: { label: 'Wishlist', color: 'var(--blue)', badge: 'badge-wishlist', icon: '📝' },
    dropped: { label: 'Dropped', color: 'var(--red)', badge: 'badge-dropped', icon: '❌' },
}

const IMG_FALLBACK = 'https://placehold.co/400x225/111118/5a5a7a?text=No+Image'

export default function GameCard({ game, index = 0, onOpenDetail }) {
    const addGame = useGameStore(s => s.addGame)
    const isInLibrary = useGameStore(s => s.isInLibrary)
    const updateStatus = useGameStore(s => s.updateStatus)

    const libraryEntry = isInLibrary(game.id || game.rawg_id)
    const inLibrary = !!libraryEntry

    const handleAddToLibrary = (e) => {
        e.stopPropagation()
        const added = addGame(game, 'wishlist')
        if (added) {
            toast.success(`"${game.name}" ditambahkan ke Wishlist!`, {
                icon: '📝',
                style: {
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                },
            })
        } else {
            toast.error('Game sudah ada di library!', {
                style: {
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                },
            })
        }
    }

    const rating = game.rating || 0
    const ratingPercent = (rating / 5) * 100

    return (
        <motion.div
            id={`game-card-${game.id || game.rawg_id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            onClick={() => onOpenDetail?.(game)}
            style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '1rem',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                position: 'relative',
            }}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={inLibrary ? 'glow-border' : ''}
        >
            {/* Game Cover Image */}
            <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                <img
                    src={game.background_image || IMG_FALLBACK}
                    alt={game.name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                    }}
                    onError={e => { e.target.src = IMG_FALLBACK }}
                    onMouseEnter={e => { e.target.style.transform = 'scale(1.05)' }}
                    onMouseLeave={e => { e.target.style.transform = 'scale(1)' }}
                />

                {/* Gradient overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.2) 50%, transparent 100%)',
                }} />

                {/* Top badges */}
                <div style={{ position: 'absolute', top: '0.625rem', left: '0.625rem', right: '0.625rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {inLibrary && libraryEntry?.status && (
                        <span className={`badge ${STATUS_CONFIG[libraryEntry.status]?.badge}`}>
                            {STATUS_CONFIG[libraryEntry.status]?.icon} {STATUS_CONFIG[libraryEntry.status]?.label}
                        </span>
                    )}
                    {game.metacritic && (
                        <span style={{
                            marginLeft: 'auto',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: game.metacritic >= 75 ? 'rgba(34,197,94,0.8)' : game.metacritic >= 50 ? 'rgba(234,179,8,0.8)' : 'rgba(239,68,68,0.8)',
                            color: 'white',
                            backdropFilter: 'blur(4px)',
                        }}>
                            {game.metacritic}
                        </span>
                    )}
                </div>

                {/* RAWG Rating */}
                {rating > 0 && (
                    <div style={{
                        position: 'absolute',
                        bottom: '0.625rem',
                        left: '0.625rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                    }}>
                        <Star size={12} fill="var(--yellow)" color="var(--yellow)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--yellow)' }}>
                            {rating.toFixed(1)}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <h3 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    lineHeight: 1.3,
                    letterSpacing: '-0.01em',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}>
                    {game.name || game.title}
                </h3>

                {/* Genres */}
                {(game.genres?.length > 0 || game.genres?.[0]) && (
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {(game.genres || []).slice(0, 2).map((g, i) => (
                            <span key={i} style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-muted)',
                                background: 'var(--bg-secondary)',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '999px',
                                border: '1px solid var(--border)',
                            }}>
                                {typeof g === 'string' ? g : g.name}
                            </span>
                        ))}
                        {game.released && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                {game.released?.split('-')[0]}
                            </span>
                        )}
                    </div>
                )}

                {/* Personal rating if in library */}
                {inLibrary && libraryEntry?.personal_rating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: 'auto' }}>
                        <Star size={12} fill="var(--accent-light)" color="var(--accent-light)" />
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-light)', fontWeight: 600 }}>
                            My Rating: {libraryEntry.personal_rating}/10
                        </span>
                    </div>
                )}

                {/* Add button */}
                <motion.button
                    id={`add-btn-${game.id || game.rawg_id}`}
                    onClick={handleAddToLibrary}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                        marginTop: 'auto',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        border: inLibrary ? '1px solid rgba(124,58,237,0.4)' : '1px solid var(--border)',
                        background: inLibrary ? 'rgba(124,58,237,0.1)' : 'var(--bg-secondary)',
                        color: inLibrary ? 'var(--accent-light)' : 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.375rem',
                        transition: 'all 0.2s ease',
                    }}
                >
                    {inLibrary ? <Check size={14} /> : <Plus size={14} />}
                    {inLibrary ? 'In Library' : 'Add to Library'}
                </motion.button>
            </div>
        </motion.div>
    )
}
