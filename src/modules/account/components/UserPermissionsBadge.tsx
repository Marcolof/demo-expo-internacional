import { PERMISSION_LABELS } from '@/core/auth/permissions'
import type { Permission } from '@/core/auth/permissions'
import { Badge } from '@/shared/ui/Badge'
import styles from './UserPermissionsBadge.module.css'

export interface UserPermissionsBadgeProps {
  readonly permissions: readonly Permission[]
  /** Cuántas píldoras se muestran antes de resumir el resto en "+N". */
  readonly maxVisible?: number
}

const DEFAULT_MAX_VISIBLE = 3

/**
 * Permisos de un usuario como píldoras.
 *
 * El titular tiene los 15 permisos: listarlos todos rompe el ancho de la fila,
 * así que se muestran los primeros y el resto se resume en "+N", con el detalle
 * completo en el `title`.
 */
export function UserPermissionsBadge({
  permissions,
  maxVisible = DEFAULT_MAX_VISIBLE,
}: UserPermissionsBadgeProps) {
  if (permissions.length === 0) {
    return <span className={styles.none}>Sin permisos</span>
  }

  const visible = permissions.slice(0, maxVisible)
  const hidden = permissions.slice(maxVisible)

  return (
    <span className={styles.list}>
      {visible.map((permission) => (
        <Badge key={permission} tone="neutral">
          {PERMISSION_LABELS[permission]}
        </Badge>
      ))}

      {hidden.length > 0 && (
        <span
          className={styles.more}
          title={hidden.map((permission) => PERMISSION_LABELS[permission]).join(', ')}
        >
          <Badge tone="info">{`+${String(hidden.length)}`}</Badge>
        </span>
      )}
    </span>
  )
}
