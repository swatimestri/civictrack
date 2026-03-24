import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import { Badge } from './ui/badge'
import { MapPin } from 'lucide-react'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const generateMockCoord = (centerLat, centerLng, offset = 0.05) => {
  return [
    centerLat + (Math.random() - 0.5) * offset,
    centerLng + (Math.random() - 0.5) * offset
  ]
}

export default function InteractiveMap({ issues }) {
  const defaultCenter = [28.6139, 77.2090] // Example: New Delhi Center
  const [markers, setMarkers] = useState([])

  useEffect(() => {
    const newMarkers = issues.map(issue => {
      const position = issue.lat && issue.lng 
        ? [issue.lat, issue.lng]
        : generateMockCoord(defaultCenter[0], defaultCenter[1], 0.1)
        
      return { ...issue, position }
    })
    setMarkers(newMarkers)
  }, [issues])

  return (
    <div className="h-full min-h-[400px] w-full rounded-xl overflow-hidden shadow-sm border border-border z-0 relative">
      <MapContainer center={defaultCenter} zoom={11} style={{ height: '100%', width: '100%', minHeight: '400px' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((issue) => (
          <Marker key={issue.id} position={issue.position}>
            <Popup className="premium-popup">
              <div className="space-y-2 p-1 max-w-[200px]">
                <img src={issue.imageUrl || 'https://placehold.co/400x300?text=No+Image'} alt="Issue" className="w-full h-24 object-cover rounded-md" />
                <h4 className="font-semibold text-sm line-clamp-1">{issue.title}</h4>
                <div className="flex gap-2 text-xs text-muted-foreground items-center">
                  <Badge variant="outline" className="text-[10px] px-1 py-0">{issue.category}</Badge>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {issue.upvotes || 0}</span>
                </div>
                <Link to={`/issues/${issue.id}`} className="block text-center w-full bg-primary text-primary-foreground py-1 rounded text-xs hover:bg-primary/90 transition-colors">
                  View Detail
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
