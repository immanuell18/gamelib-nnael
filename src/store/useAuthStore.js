import { create } from 'zustand'
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signInWithCredential,
    signOut,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '../firebase'

const ADMIN_EMAILS = ['ellrz1718@gmail.com']

function isCapacitor() {
    return typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()
}

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
        console.warn('[Auth] Firestore sync failed:', err.code)
        return { isAdmin: ADMIN_EMAILS.includes(firebaseUser.email), profile: null }
    }
}

const useAuthStore = create((set) => ({
    user: null,
    userProfile: null,
    isAdmin: false,
    loading: true,

    initAuth: () => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
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
            if (isCapacitor()) {
                // Native Android: Google account picker bottom sheet
                const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
                const result = await FirebaseAuthentication.signInWithGoogle()
                if (!result.credential?.idToken) throw new Error('No ID token received')
                const credential = GoogleAuthProvider.credential(result.credential.idToken)
                await signInWithCredential(auth, credential)
            } else {
                // Web: popup biasa
                await signInWithPopup(auth, googleProvider)
            }
            return { success: true }
        } catch (err) {
            console.error('[Auth] loginWithGoogle error:', err.code, err.message)
            return { success: false, error: err.message }
        }
    },

    logout: async () => {
        try {
            if (isCapacitor()) {
                const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
                await FirebaseAuthentication.signOut()
            }
        } catch (_) { }
        await signOut(auth)
        set({ user: null, userProfile: null, isAdmin: false })
    },
}))

export default useAuthStore
