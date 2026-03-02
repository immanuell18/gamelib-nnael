import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useGameStore = create(
    persist(
        (set, get) => ({
            // === USER LIBRARY ===
            library: [], // { id, rawg_id, title, background_image, genres, rating, metacritic, released, platforms, status, personal_rating, play_hours, notes, added_at, updated_at }

            // === SEARCH STATE ===
            searchResults: [],
            searchQuery: '',
            isSearching: false,
            searchError: null,

            // === UI STATE ===
            activeFilter: 'all', // 'all' | 'playing' | 'completed' | 'on-hold' | 'wishlist' | 'dropped'
            activeView: 'grid', // 'grid' | 'list'

            // === LIBRARY ACTIONS ===
            addGame: (game, status = 'wishlist') => {
                const existing = get().library.find(g => g.rawg_id === game.id)
                if (existing) return false

                const newEntry = {
                    id: `game_${Date.now()}`,
                    rawg_id: game.id,
                    title: game.name,
                    background_image: game.background_image,
                    genres: game.genres?.map(g => g.name) || [],
                    rating: game.rating || 0,
                    metacritic: game.metacritic || null,
                    released: game.released || null,
                    platforms: game.platforms?.map(p => p.platform.name) || [],
                    status,
                    personal_rating: null,
                    play_hours: 0,
                    notes: '',
                    added_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }

                set(state => ({ library: [...state.library, newEntry] }))
                return true
            },

            removeGame: (id) => {
                set(state => ({ library: state.library.filter(g => g.id !== id) }))
            },

            updateGame: (id, updates) => {
                set(state => ({
                    library: state.library.map(g =>
                        g.id === id
                            ? { ...g, ...updates, updated_at: new Date().toISOString() }
                            : g
                    )
                }))
            },

            updateStatus: (id, status) => {
                set(state => ({
                    library: state.library.map(g =>
                        g.id === id
                            ? { ...g, status, updated_at: new Date().toISOString() }
                            : g
                    )
                }))
            },

            isInLibrary: (rawg_id) => {
                return get().library.find(g => g.rawg_id === rawg_id) || null
            },

            // === SEARCH ACTIONS ===
            setSearchResults: (results) => set({ searchResults: results }),
            setSearchQuery: (query) => set({ searchQuery: query }),
            setIsSearching: (val) => set({ isSearching: val }),
            setSearchError: (err) => set({ searchError: err }),
            clearSearch: () => set({ searchResults: [], searchQuery: '', searchError: null }),

            // === FILTER ACTIONS ===
            setActiveFilter: (filter) => set({ activeFilter: filter }),
            setActiveView: (view) => set({ activeView: view }),

            // NOTE: Computed selectors are intentionally removed from store.
            // Use useMemo in components to avoid Zustand getSnapshot infinite loop.
        }),
        {
            name: 'gamelib-storage',
            partialize: (state) => ({ library: state.library }),
        }
    )
)

export default useGameStore
