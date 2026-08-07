import { useEffect, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import type { Branch } from '../mocks/branches.mocks'
import styles from './BranchMap.module.css'

export interface BranchMapProps {
  /** Lista de sucursales (se usa solo para mostrar info del popup). */
  readonly branches: readonly Branch[]
  /** Id de la sucursal seleccionada; muestra el popup de información. */
  readonly selectedBranchId?: string
  readonly className?: string
}

/**
 * Mapa de sucursales con iframe OpenStreetMap (sin API key).
 * El popup con info de la sucursal seleccionada se superpone al iframe.
 */
export function BranchMap({ branches, selectedBranchId, className }: BranchMapProps) {
  const [popupDismissed, setPopupDismissed] = useState(false)

  const selectedBranch = branches.find((b) => b.id === selectedBranchId)

  // Reabre el popup cada vez que cambia la sucursal seleccionada
  useEffect(() => {
    setPopupDismissed(false)
  }, [selectedBranchId])

  const showPopup = !popupDismissed && selectedBranch !== undefined

  return (
    <div className={cn(styles.root, className)}>
      <iframe
        src="https://www.openstreetmap.org/export/embed.html?bbox=-58.57%2C-34.68%2C-58.33%2C-34.54&layer=mapnik"
        className={styles.mapIframe}
        title="Mapa de área de sucursales"
        loading="lazy"
        referrerPolicy="no-referrer"
        aria-label="Mapa del área de sucursales de origen"
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
