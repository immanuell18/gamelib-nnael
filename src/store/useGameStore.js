import { create } from 'zustand'
import {
    collection, doc, setDoc, deleteDoc,
    onSnapshot, serverTimestamp, query, orderBy,
} from 'firebase/firestore'
import { db } from '../firebase'

// ── Zustand store: library disimpan per user di Firestore ──
const useGameStore = create((set, get) => ({
    library: [],
    unsubLibrary: null,   // cleanup Firestore listener

    searchResults: [],
    searchQuery: '',
    isSearching: false,
    searchError: null,
    activeFilter: 'all',
    activeView: 'grid',

    // ── Subscribe to user's library realtime ────────────────
    subscribeLibrary: (uid) => {
        const prev = get().unsubLibrary
        if (prev) prev()   // cleanup previous listener

        const q = query(
            collection(db, 'library', uid, 'games'),
            orderBy('updated_at', 'desc')
        )
        const unsub = onSnapshot(q, (snap) => {
            const games = snap.docs.map(d => ({ id: d.id, ...d.data() }))
            set({ library: games })
        })
        set({ unsubLibrary: unsub })
    },

    // ── Unsubscribe (on logout) ──────────────────────────────
    unsubscribeLibrary: () => {
        const unsub = get().unsubLibrary
        if (unsub) unsub()
        set({ library: [], unsubLibrary: null })
    },

    // ── Add game ─────────────────────────────────────────────
    addGame: async (uid, game, status = 'wishlist') => {
        const existing = get().library.find(g => g.rawg_id === (game.id || game.rawg_id))
        if (existing) return false

        const docId = `rawg_${game.id || game.rawg_id}`
        const gameRef = doc(db, 'library', uid, 'games', docId)

        await setDoc(gameRef, {
            rawg_id: game.id || game.rawg_id,
            title: game.name || game.title,
            background_image: game.background_image || null,
            genres: game.genres?.map(g => typeof g === 'string' ? g : g.name) || [],
            rating: game.rating || 0,
            metacritic: game.metacritic || null,
            released: game.released || null,
            platforms: game.platforms?.map(p => p.platform?.name || p) || [],
            status,
            personal_rating: null,
            play_hours: 0,
            notes: '',
            added_at: serverTimestamp(),
            updated_at: serverTimestamp(),
        })
        return true
    },

    // ── Remove game ──────────────────────────────────────────
    removeGame: async (uid, docId) => {
        await deleteDoc(doc(db, 'library', uid, 'games', docId))
    },

    // ── Update game ──────────────────────────────────────────
    updateGame: async (uid, docId, updates) => {
        await setDoc(
            doc(db, 'library', uid, 'games', docId),
            { ...updates, updated_at: serverTimestamp() },
            { merge: true }
        )
    },

    // ── Check if in library ──────────────────────────────────
    isInLibrary: (rawgId) => {
        return get().library.find(g => g.rawg_id === rawgId) || null
    },

    // ── Search state ─────────────────────────────────────────
    setSearchResults: (r) => set({ searchResults: r }),
    setSearchQuery: (q) => set({ searchQuery: q }),
    setIsSearching: (v) => set({ isSearching: v }),
    setSearchError: (e) => set({ searchError: e }),
    clearSearch: () => set({ searchResults: [], searchQuery: '', searchError: null }),
    setActiveFilter: (f) => set({ activeFilter: f }),
    setActiveView: (v) => set({ activeView: v }),
}))

export default useGameStore
