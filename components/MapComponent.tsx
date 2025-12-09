'use client'

import { Location } from '@/types'

interface MapComponentProps {
  currentLocation: Location | null
  homeLocation: Location | null
  tripPath?: Location[]
  onMapClick?: (location: Location) => void
}

export default function MapComponent({
  currentLocation,
  homeLocation,
  tripPath = [],
  onMapClick,
}: MapComponentProps) {
  // TODO: Implement map component with Google Maps
  return (
    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Map component coming soon</p>
    </div>
  )
}
