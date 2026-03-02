import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Filter, SlidersHorizontal, Gamepad2 } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import GameCard from '../components/GameCard'
import SkeletonCard from '../components/SkeletonCard'
import GameDetailModal from '../components/GameDetailModal'
import { searchGames, getPopularGames } from '../services/rawgApi'

const GENRES = [
    { slug: 'action', label: '⚔️ Action' },
    { slug: 'rpg', label: '🧙 RPG' },
    { slug: 'adventure', label: '🗺️ Adventure' },
    { slug: 'strategy', label: '♟️ Strategy' },
    { slug: 'sports', label: '⚽ Sports' },
    { slug: 'puzzle', label: '🧩 Puzzle' },
    { slug: 'shooter', label: '🔫 Shooter' },
    { slug: 'simulation', label: '🏙️ Simulation' },
    { slug: 'racing', label: '🏎️ Racing' },
    { slug: 'horror', label: '👻 Horror' },
]

export default function SearchPage() {
    const {
        searchResults, searchQuery, isSearching, searchError,
        setSearchResults, setSearchQuery, setIsSearching, setSearchError, clearSearch
    } = useGameStore()

    const [query, setQuery] = useState(searchQuery)
    const [selectedGame, setSelectedGame] = useState(null)
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [selectedGenre, setSelectedGenre] = useState(null)
    const [initialGames, setInitialGames] = useState([])
    const [loadingInitial, setLoadingInitial] = useState(true)
    const searchRef = useRef(null)
    const debounceRef = useRef(null)

    // Load popular games on mount
    useEffect(() => {
        const load = async () => {
            try {
                const data = await getPopularGames(1, 20)
                setInitialGames(data.results || [])
            } catch (e) {
                console.error(e)
            } finally {
                setLoadingInitial(false)
            }
        }
        load()
    }, [])

    const doSearch = useCallback(async (q, p = 1) => {
        if (!q.trim()) {
            clearSearch()
            setPage(1)
            setTotalCount(0)
            return
        }
        setIsSearching(true)
        setSearchError(null)
        try {
            const data = await searchGames(q, p)
            if (p === 1) {
                setSearchResults(data.results || [])
            } else {
                setSearchResults([...searchResults, ...(data.results || [])])
            }
            setTotalCount(data.count || 0)
            setPage(p)
        } catch (err) {
            setSearchError('Gagal mengambil data. Cek API key kamu!')
        } finally {
            setIsSearching(false)
        }
    }, [searchResults])

    const handleInput = (e) => {
        const val = e.target.value
        setQuery(val)
        setSearchQuery(val)
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => doSearch(val, 1), 600)
    }

    const handleClear = () => {
        setQuery('')
        clearSearch()
        setPage(1)
        setTotalCount(0)
        searchRef.current?.focus()
    }

    const handleLoadMore = () => {
        doSearch(query, page + 1)
    }

    const displayedGames = query.trim() ? searchResults : initialGames
    const showSkeleton = isSearching && page === 1

    return (
        <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
            {/* Search Header */}
            <div style={{
                padding: '3rem 0 2rem',
                background: 'linear-gradient(to bottom, rgba(124,58,237,0.08), transparent)',
                borderBottom: '1px solid var(--border)',
            }}>
                <div className="page-container">
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}
                    >
                        Discover Games 🔍
                    </motion.h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Search from millions of games powered by RAWG
                    </p>

                    {/* Search Box */}
                    <div style={{ position: 'relative', maxWidth: '640px' }}>
                        <Search
                            size={18}
                            color="var(--text-muted)"
                            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                        />
                        <input
                            id="game-search-input"
                            ref={searchRef}
                            type="text"
                            value={query}
                            onChange={handleInput}
                            placeholder="Cari game... (e.g. Elden Ring, Cyberpunk)"
                            className="input"
                            style={{ paddingLeft: '2.75rem', paddingRight: '3rem', fontSize: '1rem', height: '52px' }}
                        />
                        {query && (
                            <button
                                id="search-clear-btn"
                                onClick={handleClear}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Genre filters */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        <button
                            id="genre-all"
                            onClick={() => { setSelectedGenre(null); handleClear() }}
                            style={{
                                padding: '0.375rem 0.875rem',
                                borderRadius: '999px',
                                border: !selectedGenre ? '1px solid var(--accent)' : '1px solid var(--border)',
                                background: !selectedGenre ? 'rgba(124,58,237,0.15)' : 'var(--bg-card)',
                                color: !selectedGenre ? 'var(--accent-light)' : 'var(--text-secondary)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            All
                        </button>
                        {GENRES.map(g => (
                            <button
                                key={g.slug}
                                id={`genre-${g.slug}`}
                                onClick={() => {
                                    setSelectedGenre(g.slug)
                                    setQuery(g.label.replace(/[^\w\s]/g, '').trim())
                                    doSearch(g.slug, 1)
                                }}
                                style={{
                                    padding: '0.375rem 0.875rem',
                                    borderRadius: '999px',
                                    border: selectedGenre === g.slug ? '1px solid var(--accent)' : '1px solid var(--border)',
                                    background: selectedGenre === g.slug ? 'rgba(124,58,237,0.15)' : 'var(--bg-card)',
                                    color: selectedGenre === g.slug ? 'var(--accent-light)' : 'var(--text-secondary)',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                {g.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="page-container" style={{ padding: '2rem 1.5rem 5rem' }}>
                {/* Status bar */}
                {query && !isSearching && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                        {searchResults.length > 0
                            ? `Menampilkan ${searchResults.length} dari ${totalCount.toLocaleString()} hasil untuk "${query}"`
                            : `Tidak ada hasil untuk "${query}"`
                        }
                    </p>
                )}

                {!query && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                        🔥 Game populer & rating tinggi
                    </p>
                )}

                {/* Error state */}
                {searchError && (
                    <div style={{
                        padding: '1.25rem',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '0.75rem',
                        color: 'var(--red)',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem',
                    }}>
                        ⚠️ {searchError}
                    </div>
                )}

                {/* Grid */}
                {showSkeleton ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                        {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                            {displayedGames.map((g, i) => (
                                <GameCard key={`${g.id}-${i}`} game={g} index={i % 20} onOpenDetail={setSelectedGame} />
                            ))}
                        </div>

                        {/* Load More */}
                        {query && searchResults.length < totalCount && (
                            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                                <motion.button
                                    id="load-more-btn"
                                    onClick={handleLoadMore}
                                    disabled={isSearching}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn-ghost"
                                    style={{ padding: '0.75rem 2rem', fontSize: '0.9rem' }}
                                >
                                    {isSearching ? 'Loading...' : 'Load More'}
                                </motion.button>
                            </div>
                        )}

                        {/* Empty */}
                        {displayedGames.length === 0 && !isSearching && query && (
                            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😔</div>
                                <p style={{ color: 'var(--text-secondary)' }}>Tidak ada game yang ditemukan</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {selectedGame && (
                <GameDetailModal game={selectedGame} onClose={() => setSelectedGame(null)} />
            )}
        </div>
    )
}
