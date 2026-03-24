import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { db, firebaseInitError } from '../services/firebase'
import { uploadIssueImageToSupabase } from '../services/supabase'

const IssueContext = createContext(null)

export function IssueProvider({ children }) {
  const [issues, setIssues] = useState([])
  const [loadingIssues, setLoadingIssues] = useState(true)
  const [firestoreError, setFirestoreError] = useState('')

  useEffect(() => {
    if (!db) {
      setLoadingIssues(false)
      setFirestoreError(firebaseInitError || 'Firestore is not configured correctly.')
      return () => {}
    }
    const q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'), limit(50))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
        setIssues(data)
        setLoadingIssues(false)
        setFirestoreError('')
      },
      (error) => {
        setLoadingIssues(false)
        setIssues([])
        if (error?.code === 'permission-denied') {
          setFirestoreError('Firestore permission denied. Update Firestore security rules in Firebase Console.')
        } else {
          setFirestoreError(error?.message || 'Unable to read issues from Firestore.')
        }
      },
    )
    return unsubscribe
  }, [])

  async function createIssue(formData, userId) {
    if (!db) throw new Error(firebaseInitError || 'Firestore is not configured correctly.')
    let imageUrl = ''
    if (formData.image) {
      imageUrl = await uploadIssueImageToSupabase(formData.image)
    }

    try {
      await addDoc(collection(db, 'issues'), {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        lat: formData.lat || null,
        lng: formData.lng || null,
        imageUrl,
        status: 'pending',
        upvotes: 0,
        userId,
        createdAt: serverTimestamp(),
      })
    } catch (error) {
      if (error?.code === 'permission-denied') {
        throw new Error('Firestore write blocked by security rules. Please update Firestore rules.')
      }
      throw error
    }

    return { success: true }
  }

  function getIssueById(issueId) {
    return issues.find((item) => item.id === issueId)
  }

  async function hasUserVoted(issueId, userId) {
    if (!db) return false
    const voteRef = doc(db, 'votes', `${issueId}_${userId}`)
    const voteSnap = await getDoc(voteRef)
    return voteSnap.exists()
  }

  async function upvoteIssue(issueId, userId) {
    if (!db) throw new Error(firebaseInitError || 'Firestore is not configured correctly.')
    const issueRef = doc(db, 'issues', issueId)
    const voteRef = doc(db, 'votes', `${issueId}_${userId}`)
    await runTransaction(db, async (transaction) => {
      const voteSnap = await transaction.get(voteRef)
      if (voteSnap.exists()) {
        throw new Error('Already upvoted')
      }

      const issueSnap = await transaction.get(issueRef)
      const currentUpvotes = issueSnap.data()?.upvotes || 0

      transaction.set(voteRef, {
        userId,
        issueId,
        createdAt: serverTimestamp(),
      })
      transaction.update(issueRef, { upvotes: currentUpvotes + 1 })
    })
  }

  async function updateIssueStatus(issueId, status) {
    if (!db) throw new Error(firebaseInitError || 'Firestore is not configured correctly.')
    const issueRef = doc(db, 'issues', issueId)
    await updateDoc(issueRef, { status })
    
    try {
      const snap = await getDoc(issueRef)
      if (snap.exists() && snap.data().userId) {
        await addDoc(collection(db, 'notifications'), {
          userId: snap.data().userId,
          message: `Your issue "${snap.data().title}" is now ${status.replace('_', ' ')}.`,
          type: 'status_update',
          link: `/issues/${issueId}`,
          read: false,
          createdAt: serverTimestamp()
        })
      }
    } catch(err) {
      console.error("Failed to send notification:", err)
    }
  }

  const value = useMemo(
    () => ({
      issues,
      loadingIssues,
      firestoreError,
      createIssue,
      getIssueById,
      hasUserVoted,
      upvoteIssue,
      updateIssueStatus,
    }),
    [issues, loadingIssues, firestoreError],
  )

  return <IssueContext.Provider value={value}>{children}</IssueContext.Provider>
}

export function useIssues() {
  const ctx = useContext(IssueContext)
  if (!ctx) {
    throw new Error('useIssues must be used inside IssueProvider')
  }
  return ctx
}
