import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { useToast } from '@/shared/ui/Toast'
import type { Shipment } from '../types/shipment.types'

export interface DuplicateShipmentModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onConfirm: (shipment: Shipment) => void
  readonly shipment: Shipment | null
}

/**
 * Duplicar un envío.
 *
 * Se aclara que la copia nace SIN cotización: cualquier cambio invalida el
 * precio, así que el duplicado siempre hay que volver a cotizarlo.
 */
export function DuplicateShipmentModal({
  isOpen,
  onClose,
  onConfirm,
  shipment,
}: DuplicateShipmentModalProps) {
  const { showToast } = useToast()

  if (shipment === null) return null

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => {
        onConfirm(shipment)
        onClose()
        showToast('Creamos una copia en envíos pendientes.', 'success')
      }}
      title="Duplicar envío"
      description={`Vamos a crear un envío nuevo con los datos de ${shipment.orderNumber ?? shipment.id}. La copia queda en envíos pendientes y sin cotizar.`}
      confirmLabel="Duplicar"
      cancelLabel="Cancelar"
    />
  )
}
