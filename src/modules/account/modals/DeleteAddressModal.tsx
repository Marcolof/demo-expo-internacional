import { usePermissions } from '@/shared/hooks/usePermissions'
import { Alert } from '@/shared/ui/Alert'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { useToast } from '@/shared/ui/Toast'
import { canDeleteAddress } from '../rules/canDeleteAddress'
import { formatAddress } from '../types/account.types'
import type { Address } from '../types/account.types'
import styles from './Modals.module.css'

export interface DeleteAddressModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly address: Address | null
  readonly onConfirm: (address: Address) => void
}

/**
 * Baja de un domicilio.
 *
 * El modal se abre igual cuando la regla deniega: es la única forma de que el
 * usuario lea POR QUÉ no puede borrarlo (típicamente, porque es el favorito).
 *
 * `isBusy` es lo único que expone `ConfirmDialog` para inhabilitar el botón de
 * confirmar. También apaga Cancelar, así que el modal se cierra con la X, con
 * Escape o clickeando el fondo.
 */
export function DeleteAddressModal({
  isOpen,
  onClose,
  address,
  onConfirm,
}: DeleteAddressModalProps) {
  const { user } = usePermissions()
  const { showToast } = useToast()

  if (address === null) return null

  const result = canDeleteAddress(user, address)

  const handleConfirm = () => {
    if (!result.allowed) return

    onConfirm(address)
    showToast('Domicilio eliminado.', 'success')
    onClose()
  }

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Eliminar domicilio"
      description="Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      tone="danger"
      confirmDisabled={!result.allowed}
    >
      {!result.allowed && (
        <div className={styles.notice}>
          <Alert tone="warning" title="No se puede eliminar">
            {result.reason}
          </Alert>
        </div>
      )}

      <p className={styles.detail}>
        <span className={styles.detailStrong}>{address.alias}</span>
        <br />
        {formatAddress(address)}
      </p>
    </ConfirmDialog>
  )
}
