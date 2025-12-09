'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
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
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<{
    current: google.maps.Marker | null
    home: google.maps.Marker | null
  }>({ current: null, home: null })
  const [pathLine, setPathLine] = useState<google.maps.Polyline | null>(null)

  // Initialize map
  useEffect(() => {
