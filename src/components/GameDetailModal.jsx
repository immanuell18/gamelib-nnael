import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Clock, FileText, Gamepad2, ExternalLink, CheckCircle, Pause, BookmarkPlus, Trash2, Save } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'
import toast from 'react-hot-toast'

const STATUSES = [
    { value: 'playing', label: '🎮 Playing', badge: 'badge-playing' },
    { value: 'completed', label: '🏆 Completed', badge: 'badge-completed' },
    { value: 'on-hold', label: '⏸️ On Hold', badge: 'badge-onhold' },
    { value: 'wishlist', label: '📝 Wishlist', badge: 'badge-wishlist' },
    { value: 'dropped', label: '❌ Dropped', badge: 'badge-dropped' },
]

const toastStyle = {
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
}

export default function GameDetailModal({ game, onClose }) {
    const addGame = useGameStore(s => s.addGame)
    const removeGame = useGameStore(s => s.removeGame)
    const updateGame = useGameStore(s => s.updateGame)
    const isInLibrary = useGameStore(s => s.isInLibrary)
    const { user } = useAuthStore()

    const rawgId = game?.id || game?.rawg_id
    const libraryEntry = isInLibrary(rawgId)
    const inLibrary = !!libraryEntry

    const [status, setStatus] = useState(libraryEntry?.status || 'wishlist')
    const [personalRating, setPersonalRating] = useState(libraryEntry?.personal_rating || '')
    const [playHours, setPlayHours] = useState(libraryEntry?.play_hours || '')
    const [notes, setNotes] = useState(libraryEntry?.notes || '')
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    if (!game) return null

    const handleAdd = async () => {
        if (!user) return
        const ok = await addGame(user.uid, game, status)
        if (ok) {
            toast.success(`"${game.name || game.title}" ditambahkan!`, { icon: '🎮', style: toastStyle })
        }
    }

    const handleSave = async () => {
        if (!user) return
        if (!inLibrary) {
            await addGame(user.uid, game, status)
        }
        const entry = isInLibrary(rawgId)
        if (entry) {
            await updateGame(user.uid, entry.id, {
                status,
                personal_rating: personalRating ? Number(personalRating) : null,
                play_hours: playHours ? Number(playHours) : 0,
                notes,
            })
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        toast.success('Saved!', { icon: '✅', style: toastStyle })
    }

    const handleRemove = async () => {
        if (libraryEntry && user) {
            await removeGame(user.uid, libraryEntry.id)
            toast.success('Dihapus dari library', { style: toastStyle })
            onClose()
        }
    }

    const title = game.name || game.title
    const image = game.background_image
    const genres = game.genres?.map(g => typeof g === 'string' ? g : g.name) || []

    return (
        <AnimatePresence>
            <motion.div
                id="game-detail-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                }}
            >
                <motion.div
                    id="game-detail-modal"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '1.25rem',
                        width: '100%',
                        maxWidth: '680px',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Hero image */}
                    <div style={{ position: 'relative', aspectRatio: '21/9', flexShrink: 0 }}>
                        {image ? (
                            <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: 'var(--bg-secondary)' }} />
                        )}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, var(--bg-card) 0%, rgba(22,22,31,0.5) 50%, transparent 100%)',
                        }} />
                        <button
                            id="modal-close-btn"
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'rgba(0,0,0,0.5)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'white',
                                backdropFilter: 'blur(4px)',
                            }}
                        >
                            <X size={18} />
                        </button>

                        {/* Title over image */}
                        <div style={{ position: 'absolute', bottom: '1rem', left: '1.25rem', right: '1.25rem' }}>
                            <h2 style={{
                                fontFamily: 'Outfit, sans-serif',
                                fontSize: '1.5rem',
                                fontWeight: 800,
                                color: 'white',
                                letterSpacing: '-0.025em',
                                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                            }}>{title}</h2>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                                {genres.slice(0, 3).map((g, i) => (
                                    <span key={i} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.1)', padding: '0.125rem 0.5rem', borderRadius: '999px' }}>
                                        {g}
                                    </span>
                                ))}
                                {game.released && (
                                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                                        📅 {game.released}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Scrollable content */}
                    <div style={{ overflow: 'auto', flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {/* Quick stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                            {[
                                { label: 'RAWG Rating', value: game.rating ? `${game.rating.toFixed(1)}/5` : 'N/A', icon: '⭐' },
                                { label: 'Metacritic', value: game.metacritic || 'N/A', icon: '🎯' },
                                { label: 'Platforms', value: game.platforms?.length ? `${game.platforms.length}` : 'N/A', icon: '🖥️' },
                            ].map(({ label, value, icon }) => (
                                <div key={label} style={{ background: 'var(--bg-secondary)', borderRadius: '0.75rem', padding: '0.75rem', textAlign: 'center', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{icon}</div>
                                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Status selector */}
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                                Status
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {STATUSES.map(s => (
                                    <button
                                        key={s.value}
                                        id={`status-${s.value}`}
                                        onClick={() => setStatus(s.value)}
                                        style={{
                                            padding: '0.375rem 0.75rem',
                                            borderRadius: '999px',
                                            border: status === s.value ? '1px solid var(--accent)' : '1px solid var(--border)',
                                            background: status === s.value ? 'rgba(124,58,237,0.15)' : 'var(--bg-secondary)',
                                            color: status === s.value ? 'var(--accent-light)' : 'var(--text-secondary)',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Personal rating & hours */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                    ⭐ My Rating (1–10)
                                </label>
                                <input
                                    id="personal-rating-input"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={personalRating}
                                    onChange={e => setPersonalRating(e.target.value)}
                                    placeholder="e.g. 8"
                                    className="input"
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                    🕐 Play Hours
                                </label>
                                <input
                                    id="play-hours-input"
                                    type="number"
                                    min="0"
                                    value={playHours}
                                    onChange={e => setPlayHours(e.target.value)}
                                    placeholder="e.g. 45"
                                    className="input"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                                📝 Personal Notes
                            </label>
                            <textarea
                                id="notes-input"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Tulis review singkat, kesan, atau catatan tentang game ini..."
                                className="input"
                                style={{ minHeight: '100px', resize: 'vertical', lineHeight: 1.6 }}
                            />
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <motion.button
                                id="save-to-library-btn"
                                onClick={handleSave}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-primary"
                                style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}
                            >
                                {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> {inLibrary ? 'Update Library' : 'Add to Library'}</>}
                            </motion.button>
                            {inLibrary && (
                                <motion.button
                                    id="remove-from-library-btn"
                                    onClick={handleRemove}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn-ghost"
                                    style={{ color: 'var(--red)', borderColor: 'rgba(239,68,68,0.3)' }}
                                >
                                    <Trash2 size={16} />
                                </motion.button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
