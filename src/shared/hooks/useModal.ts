/**
 * Estado de un modal, con el "payload" que lo abre.
 *
 * Los modales de la maqueta casi siempre necesitan saber SOBRE QUÉ operan
 * (qué envío se cancela, qué domicilio se borra). En vez de dos estados
 * sueltos (`isOpen` + `selected`), este hook los mantiene juntos.
 *
 *   const cancel = useModal<Shipment>()
 *   cancel.open(shipment)
 *   {cancel.isOpen && <CancelShipmentModal shipment={cancel.payload} … />}
 */

import { useCallback, useState } from 'react'

export interface UseModalResult<TPayload> {
  readonly isOpen: boolean
  /** Dato con el que se abrió. `null` mientras está cerrado. */
  readonly payload: TPayload | null
  readonly open: (payload: TPayload) => void
  readonly close: () => void
}

export function useModal<TPayload = void>(): UseModalResult<TPayload> {
  const [payload, setPayload] = useState<TPayload | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback((next: TPayload) => {
    setPayload(next)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    // El payload se conserva hasta el próximo `open` para que la animación de
    // cierre no vea el contenido desaparecer de golpe.
  }, [])

  return { isOpen, payload, open, close }
}
