import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import type { Branch } from '../mocks/branches.mocks'
import styles from './BranchMap.module.css'

export interface BranchMapProps {
  /** Sucursales de la provincia elegida: el mapa cubre esas ubicaciones. */
  readonly branches: readonly Branch[]
  /** Id de la sucursal seleccionada; centra el mapa y muestra el popup. */
  readonly selectedBranchId?: string
  readonly className?: string
}

const FALLBACK_BBOX = '-58.57,-34.68,-58.33,-34.54'
const MIN_SPAN = 0.05

interface GeoPoint {
  readonly lat: number
  readonly lng: number
}

function osmEmbedUrl(points: readonly GeoPoint[], marker?: GeoPoint): string {
  const lats = points.map((point) => point.lat)
  const lngs = points.map((point) => point.lng)
  let minLat = Math.min(...lats)
  let maxLat = Math.max(...lats)
  let minLng = Math.min(...lngs)
  let maxLng = Math.max(...lngs)

  const latPad = Math.max((maxLat - minLat) * 0.3, MIN_SPAN / 2)
  const lngPad = Math.max((maxLng - minLng) * 0.3, MIN_SPAN / 2)
  minLat -= latPad
  maxLat += latPad
  minLng -= lngPad
  maxLng += lngPad

  const bbox = `${minLng},${minLat},${maxLng},${maxLat}`
  const markerQuery =
    marker === undefined ? '' : `&marker=${encodeURIComponent(`${marker.lat},${marker.lng}`)}`

  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik${markerQuery}`
}

/**
 * Mapa de sucursales con iframe OpenStreetMap (sin API key).
 * El recuadro sigue la provincia / sucursal del selector. El popup se
 * superpone al iframe.
 */
export function BranchMap({ branches, selectedBranchId, className }: BranchMapProps) {
  const [popupDismissed, setPopupDismissed] = useState(false)

  const selectedBranch = branches.find((b) => b.id === selectedBranchId)

  useEffect(() => {
    setPopupDismissed(false)
  }, [selectedBranchId])

  const embedSrc = useMemo(() => {
    if (selectedBranch !== undefined) {
      return osmEmbedUrl([selectedBranch], selectedBranch)
    }
    if (branches.length > 0) {
      return osmEmbedUrl(branches)
    }
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(FALLBACK_BBOX)}&layer=mapnik`
  }, [branches, selectedBranch])

  const showPopup = !popupDismissed && selectedBranch !== undefined

  return (
    <div className={cn(styles.root, className)}>
      <iframe
        key={embedSrc}
        src={embedSrc}
        className={styles.mapIframe}
        title="Mapa de sucursales de origen"
        loading="lazy"
        referrerPolicy="no-referrer"
        aria-label="Mapa de sucursales de origen"
      />

      {showPopup && (
        <div className={styles.popup} role="tooltip">
          <button
            type="button"
            className={styles.popupClose}
            onClick={() => setPopupDismissed(true)}
            aria-label="Cerrar"
          >
            ×
          </button>
          <div className={styles.popupName}>{selectedBranch.name.toUpperCase()}</div>
          <div className={styles.popupAddress}>{selectedBranch.address}</div>
          <div className={styles.popupHours}>{selectedBranch.hours}</div>
        </div>
      )}
    </div>
  )
}
