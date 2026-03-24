import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore'
import { db } from '../services/firebase'

export function useComments(issueId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db || !issueId) return
    const q = query(
      collection(db, 'comments'),
      where('issueId', '==', issueId),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setComments(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [issueId])

  async function addComment(userId, userEmail, text) {
    if (!db) return
    await addDoc(collection(db, 'comments'), {
      issueId,
      userId,
      userEmail,
      text,
      createdAt: serverTimestamp()
    })

    try {
       const issueSnap = await getDoc(doc(db, 'issues', issueId))
       if (issueSnap.exists() && issueSnap.data().userId !== userId) {
          await addDoc(collection(db, 'notifications'), {
             userId: issueSnap.data().userId,
             message: `${userEmail.split('@')[0]} commented on your issue "${issueSnap.data().title}".`,
             type: 'comment',
             link: `/issues/${issueId}`,
             read: false,
             createdAt: serverTimestamp()
          })
       }
    } catch(err) {
       console.error("Failed to notify on comment", err)
    }
  }

  return { comments, loading, addComment }
}
