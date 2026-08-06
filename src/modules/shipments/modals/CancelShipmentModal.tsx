import type { CurrentUser } from '@/core/auth/currentUser'
import { Alert } from '@/shared/ui/Alert'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { useToast } from '@/shared/ui/Toast'
import { canCancelShipment } from '../rules/canCancelShipment'
import type { Shipment } from '../types/shipment.types'

export interface CancelShipmentModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onConfirm: (shipment: Shipment) => void
  readonly shipment: Shipment | null
  readonly user: CurrentUser
}

/**
 * Cancelación de un envío.
 *
 * Vuelve a consultar la regla al abrirse: si el estado cambió entre que se
 * pintó la grilla y se abrió el modal, el bloqueo se muestra acá con el motivo.
 */
export function CancelShipmentModal({
  isOpen,
  onClose,
  onConfirm,
  shipment,
  user,
}: CancelShipmentModalProps) {
  const { showToast } = useToast()

  if (shipment === null) return null

  const access = canCancelShipment(user, shipment)

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => {
        onConfirm(shipment)
        onClose()
        showToast(`Cancelamos el envío ${shipment.orderNumber ?? shipment.id}.`, 'success')
      }}
      title="Cancelar envío"
      description={
        access.allowed
          ? `¿Seguro que querés cancelar el envío ${shipment.orderNumber ?? shipment.id}? Esta acción no se puede deshacer.`
          : undefined
      }
      confirmLabel="Cancelar envío"
      cancelLabel="Volver"
      tone="danger"
      confirmDisabled={!access.allowed}
    >
      {!access.allowed && (
        <Alert tone="danger" title="No podés cancelar este envío">
          {access.reason}
        </Alert>
      )}
    </ConfirmDialog>
  )
}
