import type { CurrentUser } from '@/core/auth/currentUser'
import { Alert } from '@/shared/ui/Alert'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { useToast } from '@/shared/ui/Toast'
import { canRescueShipment } from '../rules/canRescueShipment'
import type { Shipment } from '../types/shipment.types'

export interface RescueShipmentModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onConfirm: (shipment: Shipment) => void
  readonly shipment: Shipment | null
  readonly user: CurrentUser
}

/**
 * Rescate de un envío pagado antes de la imposición.
 *
 * Se explica qué pasa con el dinero: el envío vuelve a pendientes y el importe
 * queda como saldo, no se pierde. Es la duda que aparece siempre en la demo.
 */
export function RescueShipmentModal({
  isOpen,
  onClose,
  onConfirm,
  shipment,
  user,
}: RescueShipmentModalProps) {
  const { showToast } = useToast()

  if (shipment === null) return null

  const access = canRescueShipment(user, shipment)

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => {
        onConfirm(shipment)
        onClose()
        showToast('Rescatamos el envío. Lo encontrás en envíos pendientes.', 'success')
      }}
      title="Rescatar envío"
      description={
        access.allowed
          ? `El envío ${shipment.orderNumber ?? shipment.id} vuelve a envíos pendientes y el importe pagado queda disponible como saldo en tu cuenta.`
          : undefined
      }
      confirmLabel="Rescatar envío"
      cancelLabel="Volver"
      confirmDisabled={!access.allowed}
    >
      {!access.allowed && (
        <Alert tone="danger" title="No podés rescatar este envío">
          {access.reason}
        </Alert>
      )}
    </ConfirmDialog>
  )
}
