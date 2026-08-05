import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { useToast } from '@/shared/ui/Toast'
import { formatAddress } from '../types/account.types'
import type { Address } from '../types/account.types'
import styles from './Modals.module.css'

export interface SetFavoriteAddressModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly address: Address | null
  readonly onConfirm: (address: Address) => void
}

/**
 * Marca un domicilio como favorito.
 *
 * Se confirma porque la acción tiene un efecto lateral que no está a la vista:
 * el favorito anterior se desmarca.
 */
export function SetFavoriteAddressModal({
  isOpen,
  onClose,
  address,
  onConfirm,
}: SetFavoriteAddressModalProps) {
  const { showToast } = useToast()

  if (address === null) return null

  const handleConfirm = () => {
    onConfirm(address)
    showToast('Domicilio marcado como favorito.', 'success')
    onClose()
  }

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Marcar como favorito"
      description="Sólo un domicilio puede ser el favorito. Si ya tenés otro marcado, va a dejar de serlo."
      confirmLabel="Marcar como favorito"
      cancelLabel="Cancelar"
    >
      <p className={styles.detail}>
        <span className={styles.detailStrong}>{address.alias}</span>
        <br />
        {formatAddress(address)}
      </p>
    </ConfirmDialog>
  )
}
