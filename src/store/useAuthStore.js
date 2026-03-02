import { create } from 'zustand'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'

// ── Ganti dengan email admin kamu ──────────────────────────
const ADMIN_EMAILS = ['ellrz1718@gmail.com']
// ───────────────────────────────────────────────────────────

const useAuthStore = create((set, get) => ({
    user: null,           // Firebase user object
    userProfile: null,    // Firestore user doc
    isAdmin: false,
    loading: true,        // true saat pertama kali cek auth state

    // ── Init: listen to auth state ──────────────────────────
    initAuth: () => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email)
                // Upsert user doc di Firestore
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
                set({ user: firebaseUser, userProfile: profile, isAdmin, loading: false })
            } else {
                set({ user: null, userProfile: null, isAdmin: false, loading: false })
            }
        })
        return unsub
    },

    // ── Google Sign In ──────────────────────────────────────
    loginWithGoogle: async () => {
        try {
            await signInWithPopup(auth, googleProvider)
            return { success: true }
        } catch (err) {
            console.error('Login error:', err)
            return { success: false, error: err.message }
        }
    },

    // ── Logout ──────────────────────────────────────────────
    logout: async () => {
        await signOut(auth)
        set({ user: null, userProfile: null, isAdmin: false })
    },
}))

export default useAuthStore
