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

// Simpan user ke Firestore — kalau gagal, tetap login!
async function syncUserToFirestore(firebaseUser) {
    try {
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
    } catch (err) {
        // Firestore gagal → tetap return isAdmin berdasarkan email
        console.warn('[Auth] Firestore sync failed (user still logged in):', err.code)
        return { isAdmin: ADMIN_EMAILS.includes(firebaseUser.email), profile: null }
    }
}

const useAuthStore = create((set) => ({
    user: null,
    userProfile: null,
    isAdmin: false,
    loading: true,

    initAuth: () => {
        // Cek redirect result (untuk mobile yang popup jadi redirect)
        getRedirectResult(auth)
            .then(async (result) => {
                if (result?.user) {
                    const { isAdmin, profile } = await syncUserToFirestore(result.user)
                    set({ user: result.user, userProfile: profile, isAdmin, loading: false })
                }
            })
            .catch((err) => {
                // Bukan error fatal — biarkan onAuthStateChanged yang handle
                console.warn('[Auth] getRedirectResult:', err?.code)
            })

        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User berhasil login — sync ke Firestore (tapi kalau gagal tetap set user)
                const { isAdmin, profile } = await syncUserToFirestore(firebaseUser)
                set({ user: firebaseUser, userProfile: profile, isAdmin, loading: false })
            } else {
                set({ user: null, userProfile: null, isAdmin: false, loading: false })
            }
        })
        return unsub
    },

    loginWithGoogle: async () => {
        try {
            await signInWithPopup(auth, googleProvider)
            return { success: true }
        } catch (err) {
            // Popup diblokir → fallback ke redirect
            if (
                err.code === 'auth/popup-blocked' ||
                err.code === 'auth/popup-closed-by-user' ||
                err.code === 'auth/cancelled-popup-request'
            ) {
                try {
                    await signInWithRedirect(auth, googleProvider)
                    return { success: true }
                } catch (e2) {
                    return { success: false, error: e2.message }
                }
            }
            console.error('[Auth] loginWithGoogle error:', err.code)
            return { success: false, error: err.message }
        }
    },

    logout: async () => {
        await signOut(auth)
        set({ user: null, userProfile: null, isAdmin: false })
    },
}))

export default useAuthStore
