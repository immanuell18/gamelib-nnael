import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutGrid, List, Search, Gamepad2, Trophy, Pause, BookmarkPlus, X,
    Star, Clock, FileText, ChevronDown, Trash2, Edit3, CheckCircle
} from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'
import GameDetailModal from '../components/GameDetailModal'
import toast from 'react-hot-toast'

const STATUS_TABS = [
    { key: 'all', label: 'All', icon: '🎮', badge: null },
    { key: 'playing', label: 'Playing', icon: '🎮', badge: 'badge-playing' },
    { key: 'completed', label: 'Completed', icon: '🏆', badge: 'badge-completed' },
    { key: 'on-hold', label: 'On Hold', icon: '⏸️', badge: 'badge-onhold' },
    { key: 'wishlist', label: 'Wishlist', icon: '📝', badge: 'badge-wishlist' },
    { key: 'dropped', label: 'Dropped', icon: '❌', badge: 'badge-dropped' },
]

const STATUS_COLOR = {
    playing: 'var(--green)',
    completed: 'var(--accent-light)',
    'on-hold': 'var(--yellow)',
    wishlist: 'var(--blue)',
    dropped: 'var(--red)',
}

function QuickEditRow({ entry, onEdit, onRemove, onStatusChange }) {
    const [open, setOpen] = useState(false)

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.875rem 1rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '0.875rem',
                transition: 'border-color 0.2s',
            }}
            whileHover={{ borderColor: 'var(--border-light)' }}
        >
            {/* Cover */}
            <img
                src={entry.background_image || 'https://placehold.co/80x45/111118/5a5a7a?text=No+Img'}
                alt={entry.title}
                style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                onError={e => { e.target.src = 'https://placehold.co/80x45/111118/5a5a7a?text=No+Img' }}
            />

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{entry.title}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', alignItems: 'center' }}>
                    {entry.genres.slice(0, 2).map((g, i) => (
                        <span key={i} style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{g}</span>
                    ))}
                    {entry.released && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>· {entry.released.split('-')[0]}</span>
                    )}
                </div>
            </div>

            {/* Status Dropdown */}
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setOpen(!open)}
                    style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '999px',
                        border: `1px solid ${STATUS_COLOR[entry.status]}40`,
                        background: `${STATUS_COLOR[entry.status]}15`,
                        color: STATUS_COLOR[entry.status],
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {STATUS_TABS.find(s => s.key === entry.status)?.icon} {STATUS_TABS.find(s => s.key === entry.status)?.label}
                    <ChevronDown size={12} />
                </button>
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.95 }}
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + 6px)',
                                right: 0,
                                zIndex: 50,
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.75rem',
                                padding: '0.375rem',
                                minWidth: '140px',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                            }}
                        >
                            {STATUS_TABS.filter(s => s.key !== 'all').map(s => (
                                <button
                                    key={s.key}
                                    onClick={() => { onStatusChange(entry.id, s.key); setOpen(false) }}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem 0.625rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: entry.status === s.key ? 'rgba(124,58,237,0.12)' : 'transparent',
                                        color: entry.status === s.key ? 'var(--accent-light)' : 'var(--text-secondary)',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                    }}
                                >
                                    {s.icon} {s.label}
                                    {entry.status === s.key && <CheckCircle size={12} style={{ marginLeft: 'auto', color: 'var(--accent-light)' }} />}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', minWidth: '50px' }}>
                {entry.personal_rating ? (
                    <>
                        <Star size={13} fill="var(--yellow)" color="var(--yellow)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--yellow)', fontWeight: 700 }}>{entry.personal_rating}</span>
                    </>
                ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                )}
            </div>

            {/* Hours */}
            <div style={{ minWidth: '50px', textAlign: 'center' }}>
                {entry.play_hours > 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{entry.play_hours}h</span>
                ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.375rem' }}>
                <button
                    onClick={() => onEdit(entry)}
                    style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        border: '1px solid var(--border)', background: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                    }}
                    title="Edit"
                >
                    <Edit3 size={14} />
                </button>
                <button
                    onClick={() => onRemove(entry.id, entry.title)}
                    style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)',
                        color: 'var(--red)', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                    }}
                    title="Remove"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </motion.div>
    )
}

function GameGridCard({ entry, onEdit, onRemove, onStatusChange }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4 }}
            onClick={() => onEdit(entry)}
            style={{
                cursor: 'pointer',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '1rem',
                overflow: 'hidden',
                transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
        >
            {/* Image */}
            <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                <img
                    src={entry.background_image || 'https://placehold.co/400x225/111118/5a5a7a?text=No+Image'}
                    alt={entry.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.src = 'https://placehold.co/400x225/111118/5a5a7a?text=No+Image' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,15,0.85) 0%, transparent 60%)' }} />

                {/* Status badge top */}
                <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem' }}>
                    <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: `${STATUS_COLOR[entry.status]}25`,
                        color: STATUS_COLOR[entry.status],
                        border: `1px solid ${STATUS_COLOR[entry.status]}40`,
                    }}>
                        {STATUS_TABS.find(s => s.key === entry.status)?.icon} {STATUS_TABS.find(s => s.key === entry.status)?.label}
                    </span>
                </div>

                {/* Rating bottom */}
                {entry.personal_rating && (
                    <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Star size={11} fill="var(--yellow)" color="var(--yellow)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--yellow)' }}>{entry.personal_rating}/10</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: '0.75rem' }}>
                <p style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.4,
                    marginBottom: '0.375rem',
                }}>{entry.title}</p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {entry.play_hours > 0 ? (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={11} /> {entry.play_hours}h
                        </span>
                    ) : <span />}

                    <button
                        onClick={e => { e.stopPropagation(); onRemove(entry.id, entry.title) }}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-muted)', padding: '2px',
                            display: 'flex', alignItems: 'center',
                        }}
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

export default function LibraryPage() {
    const library = useGameStore(s => s.library)
    const removeGame = useGameStore(s => s.removeGame)
    const updateGame = useGameStore(s => s.updateGame)
    const { user } = useAuthStore()

    const [activeTab, setActiveTab] = useState('all')
    const [view, setView] = useState('grid')
    const [searchText, setSearchText] = useState('')
    const [selectedGame, setSelectedGame] = useState(null)

    const toastStyle = { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }

    const handleRemove = async (docId, title) => {
        if (!user) return
        await removeGame(user.uid, docId)
        toast.success(`"${title}" dihapus`, { style: toastStyle })
    }

    const handleStatusChange = async (docId, newStatus) => {
        if (!user) return
        await updateGame(user.uid, docId, { status: newStatus })
    }

    const counts = useMemo(() => {
        const c = { all: library.length }
        STATUS_TABS.filter(s => s.key !== 'all').forEach(s => {
            c[s.key] = library.filter(g => g.status === s.key).length
        })
        return c
    }, [library])

    const filtered = useMemo(() => {
        let list = activeTab === 'all' ? library : library.filter(g => g.status === activeTab)
        if (searchText.trim()) {
            list = list.filter(g => g.title.toLowerCase().includes(searchText.toLowerCase()))
        }
        return list
    }, [library, activeTab, searchText])

    return (
        <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{
                padding: '3rem 0 0',
                background: 'linear-gradient(to bottom, rgba(124,58,237,0.07), transparent)',
                borderBottom: '1px solid var(--border)',
            }}>
                <div className="page-container">
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: '0.375rem', letterSpacing: '-0.03em' }}
                    >
                        My Library 📚
                    </motion.h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        {library.length} game tersimpan dalam koleksimu
                    </p>

                    {/* Filter tabs */}
                    <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', paddingBottom: '0' }}>
                        {STATUS_TABS.map(tab => (
                            <button
                                key={tab.key}
                                id={`lib-tab-${tab.key}`}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    padding: '0.625rem 1rem',
                                    borderRadius: '0.625rem 0.625rem 0 0',
                                    border: 'none',
                                    borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
                                    background: activeTab === tab.key ? 'rgba(124,58,237,0.1)' : 'transparent',
                                    color: activeTab === tab.key ? 'var(--accent-light)' : 'var(--text-secondary)',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {tab.icon} {tab.label}
                                {counts[tab.key] > 0 && (
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '1px 6px',
                                        borderRadius: '999px',
                                        background: activeTab === tab.key ? 'var(--accent)' : 'var(--bg-card)',
                                        color: activeTab === tab.key ? 'white' : 'var(--text-muted)',
                                        fontWeight: 700,
                                    }}>{counts[tab.key]}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="page-container" style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Search */}
                    <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '360px' }}>
                        <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                            id="library-search-input"
                            type="text"
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            placeholder="Filter library..."
                            className="input"
                            style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.875rem' }}
                        />
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.375rem' }}>
                        <button
                            id="view-grid-btn"
                            onClick={() => setView('grid')}
                            style={{
                                width: '36px', height: '36px', borderRadius: '8px',
                                border: view === 'grid' ? '1px solid var(--accent)' : '1px solid var(--border)',
                                background: view === 'grid' ? 'rgba(124,58,237,0.15)' : 'var(--bg-card)',
                                color: view === 'grid' ? 'var(--accent-light)' : 'var(--text-muted)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            id="view-list-btn"
                            onClick={() => setView('list')}
                            style={{
                                width: '36px', height: '36px', borderRadius: '8px',
                                border: view === 'list' ? '1px solid var(--accent)' : '1px solid var(--border)',
                                background: view === 'list' ? 'rgba(124,58,237,0.15)' : 'var(--bg-card)',
                                color: view === 'list' ? 'var(--accent-light)' : 'var(--text-muted)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="page-container" style={{ paddingBottom: '5rem' }}>
                {/* Empty state */}
                {library.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ textAlign: 'center', padding: '6rem 0' }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎮</div>
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                            Library masih kosong!
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Cari game favorit kamu di halaman Discover dan tambahkan ke library
                        </p>
                        <a href="/search" className="btn-primary" style={{ textDecoration: 'none' }}>
                            <Search size={16} /> Cari Game
                        </a>
                    </motion.div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
                        <p>Tidak ada game yang cocok dengan filter ini</p>
                    </div>
                ) : view === 'grid' ? (
                    <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        <AnimatePresence>
                            {filtered.map(entry => (
                                <GameGridCard
                                    key={entry.id}
                                    entry={entry}
                                    onEdit={(e) => setSelectedGame({ ...e, id: e.rawg_id, name: e.title })}
                                    onRemove={handleRemove}
                                    onStatusChange={handleStatusChange}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    /* List view */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {/* List header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.5rem 1rem',
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            gap: '1rem',
                        }}>
                            <div style={{ width: '80px', flexShrink: 0 }}>Cover</div>
                            <div style={{ flex: 1 }}>Title</div>
                            <div style={{ minWidth: '110px' }}>Status</div>
                            <div style={{ minWidth: '50px' }}>Rating</div>
                            <div style={{ minWidth: '50px' }}>Hours</div>
                            <div style={{ minWidth: '76px' }}>Actions</div>
                        </div>
                        <AnimatePresence>
                            {filtered.map(entry => (
                                <QuickEditRow
                                    key={entry.id}
                                    entry={entry}
                                    onEdit={(e) => setSelectedGame({ ...e, id: e.rawg_id, name: e.title })}
                                    onRemove={handleRemove}
                                    onStatusChange={handleStatusChange}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {selectedGame && (
                <GameDetailModal
                    game={selectedGame}
                    onClose={() => setSelectedGame(null)}
                />
            )}
        </div>
    )
}
