import { usePermissions } from '@/shared/hooks/usePermissions'
import { Alert } from '@/shared/ui/Alert'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { useToast } from '@/shared/ui/Toast'
import { canDeleteUser } from '../rules/canManageUsers'
import { accountUserFullName } from '../types/account.types'
import type { AccountUser } from '../types/account.types'
import styles from './Modals.module.css'

export interface DeleteUserModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly accountUser: AccountUser | null
  readonly onConfirm: (accountUser: AccountUser) => void
}

/**
 * Baja de un subusuario.
 *
 * Igual que con los domicilios, el modal abre incluso cuando la regla deniega
 * para poder mostrar el motivo (no se puede eliminar al titular).
 */
export function DeleteUserModal({
  isOpen,
  onClose,
  accountUser,
  onConfirm,
}: DeleteUserModalProps) {
  const { user } = usePermissions()
  const { showToast } = useToast()

  if (accountUser === null) return null

  const result = canDeleteUser(user, accountUser)

  const handleConfirm = () => {
    if (!result.allowed) return

    onConfirm(accountUser)
    showToast('Usuario eliminado.', 'success')
    onClose()
  }

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Eliminar usuario"
      description="El usuario pierde el acceso a la cuenta. Esta acción no se puede deshacer."
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
        <span className={styles.detailStrong}>{accountUserFullName(accountUser)}</span>
        <br />
        {accountUser.email}
      </p>
    </ConfirmDialog>
  )
}
