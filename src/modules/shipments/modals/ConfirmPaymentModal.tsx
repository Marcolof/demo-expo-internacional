import type { CurrentUser } from '@/core/auth/currentUser'
import { formatMoney } from '@/shared/lib/formatCurrency'
import { Alert } from '@/shared/ui/Alert'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { useToast } from '@/shared/ui/Toast'
import { canPayShipment } from '../rules/canPayShipment'
import { POSTAL_SERVICE_LABELS } from '../types/shipment.types'
import type { Shipment } from '../types/shipment.types'

export interface ConfirmPaymentModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onConfirm: (shipment: Shipment) => void
  readonly shipment: Shipment | null
  readonly user: CurrentUser
}

/**
 * Confirmación de pago.
 *
 * Incluye la aclaración de recotización del requerimiento: los importes pueden
 * actualizarse al momento de pagar.
 */
export function ConfirmPaymentModal({
  isOpen,
  onClose,
  onConfirm,
  shipment,
  user,
}: ConfirmPaymentModalProps) {
  const { showToast } = useToast()

  if (shipment === null) return null

  const access = canPayShipment(user, shipment)
  const price = shipment.price

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={() => {
        onConfirm(shipment)
        onClose()
        showToast('Pago simulado con éxito. El envío queda pagado.', 'success')
      }}
      title="Confirmar pago"
      description={
        access.allowed && price !== undefined
          ? `Vas a pagar ${formatMoney(price)} por el envío ${shipment.orderNumber ?? shipment.id}${shipment.service !== undefined ? ` (${POSTAL_SERVICE_LABELS[shipment.service]})` : ''}.`
          : undefined
      }
      confirmLabel="Pagar"
      cancelLabel="Cancelar"
      confirmDisabled={!access.allowed}
    >
      {access.allowed ? (
        <Alert tone="info">
          Los importes pueden actualizarse al momento de pagar. Este importe no incluye tributos
          o gestiones externas que puedan corresponder según el país de destino.
        </Alert>
      ) : (
        <Alert tone="danger" title="No podés pagar este envío">
          {access.reason}
        </Alert>
      )}
    </ConfirmDialog>
  )
}
