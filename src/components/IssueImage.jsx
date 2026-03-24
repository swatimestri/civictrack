import { ImageOff } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getSignedUrlFromStorageUrl } from '../services/supabase'

export default function IssueImage({ src, alt, className = '', fallbackClassName = '' }) {
  const [activeSrc, setActiveSrc] = useState(src || '')
  const [triedSigned, setTriedSigned] = useState(false)
  const [failed, setFailed] = useState(false)

  const fallbackClasses = useMemo(
    () => `flex h-full w-full items-center justify-center gap-2 text-sm text-slate-500 ${fallbackClassName}`,
    [fallbackClassName],
  )

  async function handleImageError() {
    if (!activeSrc || triedSigned) {
      setFailed(true)
      return
    }

    setTriedSigned(true)
    const signedUrl = await getSignedUrlFromStorageUrl(activeSrc)
    if (signedUrl) {
      setActiveSrc(signedUrl)
      return
    }
    setFailed(true)
  }

  if (!activeSrc || failed) {
    return (
      <div className={fallbackClasses}>
        <ImageOff className="h-4 w-4" />
        <span>No image available</span>
      </div>
    )
  }

  return <img src={activeSrc} alt={alt} className={className} loading="lazy" onError={handleImageError} />
}
