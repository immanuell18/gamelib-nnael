import { create } from 'zustand'
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'

const ADMIN_EMAILS = ['ellrz1718@gmail.com']

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
        // Cek dulu kalau ada pending redirect result
        getRedirectResult(auth)
            .then(async (result) => {
                if (result?.user) {
                    // Ada hasil dari redirect login
                    const { isAdmin, profile } = await buildUserState(result.user)
                    set({ user: result.user, userProfile: profile, isAdmin, loading: false })
                }
            })
            .catch(() => {
                // Tidak ada redirect / error — biarkan onAuthStateChanged yang handle
            })

        // onAuthStateChanged selalu handle semua kasus auth
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

    // ── Login: popup dulu, kalau diblokir → redirect ────────
    loginWithGoogle: async () => {
        try {
            // Coba popup dulu (lebih reliable, langsung tahu hasilnya)
            await signInWithPopup(auth, googleProvider)
            return { success: true }
        } catch (err) {
            // Kalau popup diblokir browser → fallback ke redirect
            if (
                err.code === 'auth/popup-blocked' ||
                err.code === 'auth/popup-closed-by-user' ||
                err.code === 'auth/cancelled-popup-request'
            ) {
                try {
                    await signInWithRedirect(auth, googleProvider)
                    return { success: true }
                } catch (redirectErr) {
                    return { success: false, error: redirectErr.message }
                }
            }
            console.error('Login error:', err.code, err.message)
            return { success: false, error: err.message }
        }
    },

    logout: async () => {
        await signOut(auth)
        set({ user: null, userProfile: null, isAdmin: false })
    },
}))

export default useAuthStore
