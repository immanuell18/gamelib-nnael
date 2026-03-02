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
const REDIRECT_KEY = 'gl_google_redirect'

// ── Helper: proses firebaseUser ke Firestore ──────────────
async function processUser(firebaseUser) {
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

    // ── Init ────────────────────────────────────────────────
    initAuth: () => {
        const pendingRedirect = sessionStorage.getItem(REDIRECT_KEY) === 'true'

        if (pendingRedirect) {
            // ── Kita baru balik dari Google redirect ─────────
            // Jangan set loading:false sampai redirect result selesai
            getRedirectResult(auth)
                .then(async (result) => {
                    sessionStorage.removeItem(REDIRECT_KEY)
                    if (result?.user) {
                        const { isAdmin, profile } = await processUser(result.user)
                        set({
                            user: result.user,
                            userProfile: profile,
                            isAdmin,
                            loading: false,
                        })
                    } else {
                        // Tidak ada user dari redirect (edge case)
                        set({ loading: false })
                    }
                })
                .catch((err) => {
                    console.error('Redirect result error:', err)
                    sessionStorage.removeItem(REDIRECT_KEY)
                    set({ loading: false })
                })

            // onAuthStateChanged tetap listen tapi JANGAN ubah state
            // saat pendingRedirect—biarkan getRedirectResult yang handle
            const unsub = onAuthStateChanged(auth, () => { })
            return unsub
        }

        // ── Normal flow (refresh, sudah pernah login) ────────
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const { isAdmin, profile } = await processUser(firebaseUser)
                set({ user: firebaseUser, userProfile: profile, isAdmin, loading: false })
            } else {
                set({ user: null, userProfile: null, isAdmin: false, loading: false })
            }
        })
        return unsub
    },

    // ── Google Sign In ───────────────────────────────────────
    loginWithGoogle: async () => {
        try {
            sessionStorage.setItem(REDIRECT_KEY, 'true')
            await signInWithRedirect(auth, googleProvider)
            return { success: true }
        } catch (err) {
            sessionStorage.removeItem(REDIRECT_KEY)
            console.error('Login error:', err)
            return { success: false, error: err.message }
        }
    },

    // ── Logout ───────────────────────────────────────────────
    logout: async () => {
        await signOut(auth)
        set({ user: null, userProfile: null, isAdmin: false })
    },
}))

export default useAuthStore
