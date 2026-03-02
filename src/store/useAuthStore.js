import { create } from 'zustand'
import {
    onAuthStateChanged,
    signInWithRedirect,
    getRedirectResult,
    signOut,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'

const ADMIN_EMAILS = ['ellrz1718@gmail.com']
// localStorage (bukan sessionStorage!) agar tidak terhapus waktu navigasi redirect
const REDIRECT_KEY = 'gl_redirect_pending'

async function buildUserState(firebaseUser) {
    const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email)
    const userRef = doc(db, 'users', firebaseUser.uid)
    const snap = await getDoc(userRef)
    if (!snap.exists()) {
        await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: isAdmin ? 'admin' : 'user',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
        })
    } else {
        await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true })
    }
    const profile = (await getDoc(userRef)).data()
    return { isAdmin, profile }
}

const useAuthStore = create((set) => ({
    user: null,
    userProfile: null,
    isAdmin: false,
    loading: true,

    initAuth: () => {
        const pendingRedirect = localStorage.getItem(REDIRECT_KEY) === '1'

        if (pendingRedirect) {
            // ── Balik dari Google redirect, proses hasilnya ──
            getRedirectResult(auth)
                .then(async (result) => {
                    localStorage.removeItem(REDIRECT_KEY)
                    if (result?.user) {
                        const { isAdmin, profile } = await buildUserState(result.user)
                        set({ user: result.user, userProfile: profile, isAdmin, loading: false })
                    } else {
                        // Redirect selesai tapi tidak ada user (dibatalkan user)
                        set({ loading: false })
                    }
                })
                .catch((err) => {
                    console.error('[Auth] getRedirectResult error:', err.code)
                    localStorage.removeItem(REDIRECT_KEY)
                    set({ loading: false })
                })
            // Abaikan onAuthStateChanged selama redirect sedang diproses
            return onAuthStateChanged(auth, () => { })
        }

        // ── Normal: cek auth dari localStorage Firebase ──────
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const { isAdmin, profile } = await buildUserState(firebaseUser)
                set({ user: firebaseUser, userProfile: profile, isAdmin, loading: false })
            } else {
                set({ user: null, userProfile: null, isAdmin: false, loading: false })
            }
        })
        return unsub
    },

    loginWithGoogle: async () => {
        try {
            localStorage.setItem(REDIRECT_KEY, '1')
            await signInWithRedirect(auth, googleProvider)
            return { success: true }
        } catch (err) {
            localStorage.removeItem(REDIRECT_KEY)
            console.error('Login error:', err)
            return { success: false, error: err.message }
        }
    },

    logout: async () => {
        localStorage.removeItem(REDIRECT_KEY)
        await signOut(auth)
        set({ user: null, userProfile: null, isAdmin: false })
    },
}))

export default useAuthStore
