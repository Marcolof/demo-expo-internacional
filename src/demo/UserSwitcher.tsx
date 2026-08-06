import { DEMO_USERS } from '@/core/auth/currentUser'
import { ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS } from '@/core/auth/roles'
import type { Role } from '@/core/auth/roles'
import { PERMISSIONS, PERMISSION_LABELS, ROLE_PERMISSIONS } from '@/core/auth/permissions'
import type { Permission } from '@/core/auth/permissions'
import { useActiveUser } from '@/core/session/activeUser'
import { cn } from '@/shared/lib/cn'
import styles from './DemoToolbar.module.css'

/**
 * Cambia el usuario activo, su rol y sus permisos sueltos.
 *
 * Los permisos se muestran como tri-estado: si el valor coincide con el preset
 * del rol no hay override; al tocarlo se fija en `true`/`false` y queda
 * resaltado para que se vea que está forzado.
 */
export function UserSwitcher() {
  const { user, setUserById, setRole, setPermissionOverride } = useActiveUser()

  const rolePreset = new Set<Permission>(ROLE_PERMISSIONS[user.role])

  return (
    <div className={styles.section}>
      <p className={styles.sectionTitle}>Usuario y permisos</p>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Usuario activo</span>
        <select
          className={styles.select}
          value={user.id}
          onChange={(event) => setUserById(event.currentTarget.value)}
        >
          {DEMO_USERS.map((demoUser) => (
            <option key={demoUser.id} value={demoUser.id}>
              {demoUser.firstName} {demoUser.lastName} — {ROLE_LABELS[demoUser.role]}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Rol</span>
        <select
          className={styles.select}
          value={user.role}
          onChange={(event) => setRole(event.currentTarget.value as Role)}
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
        <span className={styles.hint}>{ROLE_DESCRIPTIONS[user.role]}</span>
      </label>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Permisos</span>
        <div className={styles.toggleList}>
          {PERMISSIONS.map((permission) => {
            const override = user.permissionOverrides[permission]
            const isOverridden = override !== undefined
            const isEnabled = override ?? rolePreset.has(permission)

            return (
              <label
                key={permission}
                className={cn(styles.toggle, isOverridden && styles.toggleOverridden)}
                title={
                  isOverridden
                    ? 'Forzado desde la demo. Tocalo de nuevo para devolverlo al rol.'
                    : 'Valor que dicta el rol.'
                }
              >
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => {
                    // Alterna entre "lo que dice el rol" y "lo contrario, forzado".
                    if (isOverridden) setPermissionOverride(permission, null)
                    else setPermissionOverride(permission, !rolePreset.has(permission))
                  }}
                />
                {PERMISSION_LABELS[permission]}
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}
