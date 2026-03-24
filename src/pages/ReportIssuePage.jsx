import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, MapPin, Sparkles, X, Loader2, Navigation } from 'lucide-react'
import { toast } from 'sonner'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { useAuth } from '../context/AuthContext'
import { useIssues } from '../context/IssueContext'
import { ISSUE_CATEGORIES } from '../utils/constants'

// Leaflet marker fix
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function LocationMarker({ position, setPosition, setAddress }) {
  const map = useMap()
  
  useEffect(() => {
    if (position) map.flyTo(position, map.getZoom())
  }, [position, map])

  useMapEvents({
    async click(e) {
      const lat = e.latlng.lat
      const lng = e.latlng.lng
      setPosition([lat, lng])
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        const data = await res.json()
        if (data && data.display_name) {
           setAddress(data.display_name)
        }
      } catch (err) {
        console.error('Reverse geocode failed', err)
      }
    },
  })

  return position === null ? null : <Marker position={position}></Marker>
}

export default function ReportIssuePage() {
  const { user } = useAuth()
  const { createIssue } = useIssues()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: ISSUE_CATEGORIES[0],
    location: '',
    lat: null,
    lng: null,
    image: null,
  })

  const handleAutoCategorize = () => {
    if (!form.description) {
      toast.error('Please enter a description first')
      return
    }
    setAiLoading(true)
    setTimeout(() => {
      const desc = form.description.toLowerCase()
      let suggestedCategory = ISSUE_CATEGORIES[0]
      if (desc.includes('road') || desc.includes('pothole') || desc.includes('traffic')) suggestedCategory = 'Infrastructure'
      else if (desc.includes('water') || desc.includes('pipe') || desc.includes('leak')) suggestedCategory = 'Water Supply'
      else if (desc.includes('light') || desc.includes('power') || desc.includes('electric')) suggestedCategory = 'Electricity'
      else if (desc.includes('trash') || desc.includes('garbage') || desc.includes('waste')) suggestedCategory = 'Waste Management'
      
      setForm(prev => ({ ...prev, category: suggestedCategory }))
      setAiLoading(false)
      toast.success(`AI categorized as ${suggestedCategory}`)
    }, 1500)
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setForm(p => ({ ...p, lat: latitude, lng: longitude }))
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          const data = await res.json()
          if (data && data.display_name) {
            setForm(p => ({ ...p, location: data.display_name }))
            toast.success('Location found using GPS')
          }
        } catch (err) {
          toast.error('Failed to get address. Please adjust map manually.')
        } finally {
          setGpsLoading(false)
        }
      },
      (error) => {
        setGpsLoading(false)
        let errMsg = 'Failed to retrieve location'
        if (error.code === 1) errMsg = 'Location permission denied'
        toast.error(errMsg)
      },
      { enableHighAccuracy: true }
    )
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setForm(p => ({ ...p, image: file }))
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setForm(p => ({ ...p, image: null }))
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.lat || !form.lng) {
      toast.error('Please select an exact location on the map')
      return
    }
    setLoading(true)
    
    try {
      await createIssue(form, user.uid)
      toast.success('Issue submitted successfully')
      navigate('/home')
    } catch (err) {
      toast.error('Failed to submit issue', { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Report an Issue</h1>
        <p className="mt-2 text-muted-foreground hidden sm:block">
          Help improve your community by reporting local issues. Use GPS to pinpoint the exact location.
        </p>
      </div>

      <Card className="p-6 md:p-8 glass-card border-border/50 relative overflow-hidden shadow-soft">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />

        <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Issue Title <span className="text-destructive">*</span></label>
            <Input 
              placeholder="E.g., Large pothole on Main St..." 
              value={form.title} 
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} 
              required 
              className="bg-background/50 focus:bg-background"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2 relative">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Description <span className="text-destructive">*</span></label>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAutoCategorize} disabled={aiLoading || !form.description} className="h-8 text-xs text-primary gap-1.5">
                    {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Auto-categorize
                  </Button>
                </div>
                <Textarea 
                  placeholder="Describe the issue in detail..." 
                  value={form.description} 
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} 
                  required 
                  className="min-h-[120px] bg-background/50 focus:bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Category <span className="text-destructive">*</span></label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm transition-colors cursor-pointer"
                  value={form.category} 
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  required
                >
                  {ISSUE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Photo Evidence</label>
                <AnimatePresence mode="wait">
                  {previewUrl ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative rounded-xl border border-border bg-muted/30 p-2 overflow-hidden aspect-video group">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button type="button" variant="destructive" size="sm" onClick={removeImage} className="gap-2 border-none">
                          <X className="w-4 h-4" /> Remove
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-all group">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-background rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-all">
                          <Camera className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-sm font-medium">Click to upload image</p>
                      </div>
                      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-4 flex flex-col">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Location <span className="text-destructive">*</span></label>
                  <Button type="button" variant="outline" size="sm" onClick={handleGetLocation} disabled={gpsLoading} className="h-8 gap-1.5 text-xs text-blue-600 border-blue-600/20 hover:bg-blue-50/50 dark:hover:bg-blue-900/20">
                    {gpsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                    Use GPS
                  </Button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Auto-filled or Search..." 
                    value={form.location} 
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))} 
                    required 
                    readOnly
                    className="pl-9 bg-background/50 focus:bg-background cursor-not-allowed text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 min-h-[300px] border border-border rounded-xl overflow-hidden relative z-0 shadow-inner">
                <MapContainer center={[28.6139, 77.2090]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker 
                    position={form.lat && form.lng ? [form.lat, form.lng] : null} 
                    setPosition={([lat, lng]) => setForm(p => ({ ...p, lat, lng }))}
                    setAddress={(address) => setForm(p => ({ ...p, location: address }))}
                  />
                </MapContainer>
                {(!form.lat || !form.lng) && (
                   <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-[400] flex items-center justify-center p-4 cursor-pointer" onClick={handleGetLocation}>
                     <div className="bg-background shadow-glow p-4 rounded-xl text-center max-w-xs pointer-events-none">
                        <MapPin className="w-8 h-8 text-primary mx-auto mb-2 animate-bounce" />
                        <p className="font-semibold text-sm">Location Required</p>
                        <p className="text-xs text-muted-foreground mt-1">Click the 'Use GPS' button or click on the map to pin a location.</p>
                     </div>
                   </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <Button type="submit" variant="premium" className="w-full h-12 text-base font-semibold" disabled={loading}>
              {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</> : 'Submit Issue'}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}
