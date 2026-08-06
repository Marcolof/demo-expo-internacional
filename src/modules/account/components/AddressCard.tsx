import type { ActionResult } from '@/core/types/common'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { formatAddress } from '../types/account.types'
import type { Address } from '../types/account.types'
import styles from './AddressCard.module.css'

export interface AddressCardProps {
  readonly address: Address
  /** Resultado de `canEditAddress`: si deniega, el botón queda inhabilitado con el motivo. */
  readonly editResult: ActionResult
  /**
   * Sólo el PERMISO de borrado. La regla de negocio (no se borra el favorito) la
   * explica el modal: si acá se inhabilitara el botón, el usuario nunca vería el
   * motivo del bloqueo.
   */
  readonly canDelete: boolean
  readonly canSetFavorite: boolean
  readonly onEdit: (address: Address) => void
  readonly onDelete: (address: Address) => void
  readonly onSetFavorite: (address: Address) => void
}

/** Tarjeta de un domicilio guardado, con sus tres acciones. */
export function AddressCard({
  address,
  editResult,
  canDelete,
  canSetFavorite,
  onEdit,
  onDelete,
  onSetFavorite,
}: AddressCardProps) {
  const editReason = editResult.allowed ? undefined : editResult.reason

  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <h3 className={styles.alias}>{address.alias}</h3>
        {address.isFavorite && <Badge tone="success">Favorito</Badge>}
      </header>

      <p className={styles.address}>{formatAddress(address)}</p>

      {address.observations !== undefined && address.observations !== '' && (
        <p className={styles.observations}>{address.observations}</p>
      )}

      <footer className={styles.actions}>
        <Button
          variant="secondary"
          size="sm"
          disabled={!editResult.allowed}
          title={editReason}
          onClick={() => {
            onEdit(address)
          }}
        >
          Editar
        </Button>

        <Button
          variant="secondary"
          size="sm"
          disabled={!canDelete}
          title={canDelete ? undefined : 'No tenés permiso para eliminar domicilios.'}
          onClick={() => {
            onDelete(address)
          }}
        >
          Eliminar
        </Button>

        {!address.isFavorite && (
          <Button
            variant="link"
            size="sm"
            disabled={!canSetFavorite}
            title={canSetFavorite ? undefined : 'No tenés permiso para editar domicilios.'}
            onClick={() => {
              onSetFavorite(address)
            }}
          >
            Marcar como favorito
          </Button>
        )}
      </footer>
    </article>
  )
}
