/**
 * Usuario activo de la maqueta.
 *
 * No hay autenticación real. El usuario se elige desde el `UserSwitcher` de la
 * barra de demo, y sus permisos se derivan del rol pero pueden sobreescribirse
 * uno por uno (`permissionOverrides`) para armar casos borde.
 */

import type { Id } from '../types/common'
import type { Permission } from './permissions'
import { permissionsForRole } from './permissions'
import type { Role } from './roles'

export interface CurrentUser {
  readonly id: Id
  readonly firstName: string
  readonly lastName: string
  readonly email: string
  /** CUIT del titular. Los subusuarios heredan el de la cuenta. */
  readonly cuit: string
  readonly role: Role
  /** Nombre de la cuenta a la que pertenece (para subusuarios). */
  readonly accountName: string
  /**
   * Sobreescrituras puntuales de permisos. `true` agrega, `false` quita,
   * ausente = lo que dicte el rol. Sólo la barra de demo escribe acá.
   */
  readonly permissionOverrides: Readonly<Partial<Record<Permission, boolean>>>
}

/** Inicial que se muestra en el círculo del header (`.letra-circulo`). */
export function userInitial(user: CurrentUser): string {
  return user.firstName.charAt(0).toUpperCase()
}

/** Nombre completo, como se arma en el resumen del envío. */
export function userFullName(user: CurrentUser): string {
  return `${user.firstName} ${user.lastName}`
}

/**
 * Permisos efectivos = preset del rol + overrides de la demo.
 * Es la única función que decide qué puede hacer el usuario.
 */
export function effectivePermissions(user: CurrentUser): ReadonlySet<Permission> {
  const result = new Set(permissionsForRole(user.role))

  for (const [permission, enabled] of Object.entries(user.permissionOverrides)) {
    if (enabled === true) {
      result.add(permission as Permission)
    } else if (enabled === false) {
      result.delete(permission as Permission)
    }
  }

  return result
}

/** Usuarios disponibles en el `UserSwitcher`. Uno por rol. */
export const DEMO_USERS: readonly CurrentUser[] = [
  {
    id: 'usr-001',
    firstName: 'Marco',
    lastName: 'Loforte',
    email: 'marco.loforte@ejemplo.com.ar',
    cuit: '20-12345678-9',
    role: 'ACCOUNT_OWNER',
    accountName: 'Loforte Encomiendas SRL',
    permissionOverrides: {},
  },
  {
    id: 'usr-002',
    firstName: 'Carla',
    lastName: 'Giménez',
    email: 'carla.gimenez@ejemplo.com.ar',
    cuit: '20-12345678-9',
    role: 'OPERATOR_WITH_PAYMENT',
    accountName: 'Loforte Encomiendas SRL',
    permissionOverrides: {},
  },
  {
    id: 'usr-003',
    firstName: 'Diego',
    lastName: 'Ferreyra',
    email: 'diego.ferreyra@ejemplo.com.ar',
    cuit: '20-12345678-9',
    role: 'OPERATOR_WITHOUT_PAYMENT',
    accountName: 'Loforte Encomiendas SRL',
    permissionOverrides: {},
  },
  {
    id: 'usr-004',
    firstName: 'Lucía',
    lastName: 'Sosa',
    email: 'lucia.sosa@ejemplo.com.ar',
    cuit: '20-12345678-9',
    role: 'READ_ONLY',
    accountName: 'Loforte Encomiendas SRL',
    permissionOverrides: {},
  },
]

/**
 * Usuario por defecto: el titular. Coincide con "Hola, Marco" del HTML de
 * referencia, para que la primera pantalla se vea igual que el original.
 */
export const DEFAULT_USER: CurrentUser = DEMO_USERS[0] as CurrentUser

/** Busca un usuario de demo por id. Devuelve `undefined` si no existe. */
export function findDemoUser(id: Id): CurrentUser | undefined {
  return DEMO_USERS.find((user) => user.id === id)
}
