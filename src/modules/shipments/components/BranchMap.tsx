import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import type { Branch } from '../mocks/branches.mocks'
import styles from './BranchMap.module.css'

/** Posiciones fijas para hasta 4 pins dentro del canvas del mapa. */
const PIN_POSITIONS: readonly { top: string; left: string }[] = [
  { top: '72%', left: '34%' },
  { top: '50%', left: '64%' },
  { top: '30%', left: '45%' },
  { top: '68%', left: '78%' },
]

function MapPin({ active }: { readonly active: boolean }) {
  const fill = active ? '#2563C5' : '#2A81CB'
  const size = active ? 28 : 24
  return (
    <svg
      width={size}
      height={Math.round(size * 1.5)}
      viewBox="0 0 24 36"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path
        d="M12 0C5.37 0 0 5.37 0 12c0 8.63 10.8 22.4 11.27 23.04a.94.94 0 0 0 1.46 0C13.2 34.4 24 20.63 24 12 24 5.37 18.63 0 12 0z"
        fill={fill}
        stroke="white"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="5" fill="white" />
    </svg>
  )
}

export interface BranchMapProps {
  /** Lista de sucursales a mostrar como pins (máx. 4). */
  readonly branches: readonly Branch[]
  /** Id de la sucursal seleccionada; muestra el popup de información. */
  readonly selectedBranchId?: string
  readonly className?: string
}

/**
 * Mapa estático de sucursales — Figma 8040-120500.
 *
 * Renderiza una grilla de calles CSS con hasta 4 pins de Leaflet-style.
 * La sucursal seleccionada muestra un popup con nombre, dirección y horario.
 * Sin dependencias externas: apto para la maqueta sin API keys.
 */
export function BranchMap({ branches, selectedBranchId, className }: BranchMapProps) {
  const [popupDismissed, setPopupDismissed] = useState(false)

  const visibleBranches = branches.slice(0, PIN_POSITIONS.length)
  const selectedBranch = visibleBranches.find((b) => b.id === selectedBranchId)

  // Cuando cambia la sucursal seleccionada, volver a mostrar el popup
  const showPopup = !popupDismissed && selectedBranch !== undefined

  return (
    <div className={cn(styles.root, className)}>
      {/* Fondo de mapa */}
      <div className={styles.mapBg} aria-hidden="true" />
      <div className={styles.park} aria-hidden="true" />
      <div className={styles.plaza} aria-hidden="true" />

      {/* Controles de zoom (decorativos) */}
      <div className={styles.zoomControls} aria-hidden="true">
        <button type="button" className={styles.zoomBtn} tabIndex={-1}>+</button>
        <button type="button" className={styles.zoomBtn} tabIndex={-1}>−</button>
      </div>

      {/* Pins */}
      {visibleBranches.map((branch, i) => {
        const pos = PIN_POSITIONS[i]
        const isActive = branch.id === selectedBranchId

        return (
          <div
            key={branch.id}
            className={cn(styles.pinWrap, isActive && styles.pinActive)}
            style={{ top: pos.top, left: pos.left }}
          >
            {/* Popup de información — sólo para el pin activo */}
            {isActive && showPopup && (
              <div className={styles.popup} role="tooltip">
                <button
                  type="button"
                  className={styles.popupClose}
                  onClick={() => setPopupDismissed(true)}
                  aria-label="Cerrar"
                >
                  ×
                </button>
                <div className={styles.popupName}>{branch.name.toUpperCase()}</div>
                <div className={styles.popupAddress}>{branch.address}</div>
                <div className={styles.popupHours}>{branch.hours}</div>
              </div>
            )}
            <MapPin active={isActive} />
          </div>
        )
      })}

      {/* Atribución Leaflet */}
      <div className={styles.attribution} aria-hidden="true">Leaflet</div>
    </div>
  )
}
