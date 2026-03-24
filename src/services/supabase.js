import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const rawBucket = import.meta.env.VITE_SUPABASE_BUCKET || 'issue-images'
const supabaseBucket = rawBucket.trim().toLowerCase()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export async function uploadIssueImageToSupabase(file) {
  if (!supabase) {
    throw new Error('Supabase Storage is not configured.')
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const filePath = `issue-images/${Date.now()}-${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(supabaseBucket)
    .upload(filePath, file, { cacheControl: '3600', upsert: false })

  if (uploadError) {
    if (uploadError.message?.toLowerCase().includes('bucket not found')) {
      throw new Error(
        `Supabase bucket "${supabaseBucket}" was not found. Create it in Storage or set VITE_SUPABASE_BUCKET correctly.`
      )
    }
    const lowerMessage = uploadError.message?.toLowerCase() || ''
    if (lowerMessage.includes('row-level security') || lowerMessage.includes('new row violates row-level security policy')) {
      throw new Error(
        `Supabase Storage policy blocks upload for bucket "${supabaseBucket}". Run Storage INSERT/SELECT policies for this bucket in Supabase SQL Editor.`
      )
    }
    throw uploadError
  }

  const { data: signedData, error: signedError } = await supabase.storage.from(supabaseBucket).createSignedUrl(filePath, 31536000)
  if (!signedError && signedData?.signedUrl) {
    return signedData.signedUrl
  }

  const { data } = supabase.storage.from(supabaseBucket).getPublicUrl(filePath)
  return data.publicUrl
}

export async function getSignedUrlFromStorageUrl(storageUrl) {
  if (!supabase || !storageUrl) return null
  const publicSegment = '/storage/v1/object/public/'
  const signedSegment = '/storage/v1/object/sign/'
  const matchedSegment = storageUrl.includes(publicSegment) ? publicSegment : storageUrl.includes(signedSegment) ? signedSegment : ''
  if (!matchedSegment) return null

  const rawPath = storageUrl.split(matchedSegment)[1] || ''
  const [bucket, ...parts] = rawPath.split('?')[0].split('/')
  const objectPath = parts.join('/')
  if (!bucket || !objectPath) return null

  const decodedPath = decodeURIComponent(objectPath)
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(decodedPath, 31536000)
  if (error) return null
  return data?.signedUrl || null
}
