import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth, db, firebaseInitError } from '../services/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return () => {}
    }
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function signup(email, password) {
    if (!auth || !db) throw new Error(firebaseInitError || 'Firebase is not configured correctly.')
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const userRef = doc(db, 'users', result.user.uid)
    const existing = await getDoc(userRef)
    if (!existing.exists()) {
      await setDoc(userRef, {
        uid: result.user.uid,
        email: result.user.email,
        createdAt: serverTimestamp(),
      })
    }
    return result.user
  }

  async function login(email, password) {
    if (!auth) throw new Error(firebaseInitError || 'Firebase is not configured correctly.')
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  }

  function logout() {
    if (!auth) return Promise.resolve()
    return signOut(auth)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      signup,
      login,
      logout,
      firebaseInitError,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
