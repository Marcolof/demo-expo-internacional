/**
 * Permisos independientes del rol.
 *
 * DECISIÓN DE ARQUITECTURA
 * El acceso no se modela solamente con roles. Cada rol arranca con un preset de
 * permisos (`ROLE_PERMISSIONS`), pero la barra de demo puede activar o
 * desactivar permisos sueltos para mostrarle a Desarrollo casos que no
 * corresponden a ningún rol "puro" — por ejemplo un operador que puede pagar
 * pero no cancelar.
 */

import type { Role } from './roles'

export type Permission =
  | 'ACCOUNT_VIEW'
  | 'ACCOUNT_EDIT'
  | 'ADDRESS_CREATE'
  | 'ADDRESS_EDIT'
  | 'ADDRESS_DELETE'
  | 'USERS_MANAGE'
  | 'SHIPMENT_CREATE'
  | 'SHIPMENT_EDIT'
  | 'SHIPMENT_PAY'
  | 'SHIPMENT_CANCEL'
  | 'SHIPMENT_RESCUE'
  | 'BALANCE_VIEW'
  | 'BALANCE_TOP_UP'
  | 'RECEIPTS_VIEW'
  | 'DIGITAL_COMMUNICATIONS_ACCESS'

export const PERMISSIONS: readonly Permission[] = [
  'ACCOUNT_VIEW',
  'ACCOUNT_EDIT',
  'ADDRESS_CREATE',
  'ADDRESS_EDIT',
  'ADDRESS_DELETE',
  'USERS_MANAGE',
  'SHIPMENT_CREATE',
  'SHIPMENT_EDIT',
  'SHIPMENT_PAY',
  'SHIPMENT_CANCEL',
  'SHIPMENT_RESCUE',
  'BALANCE_VIEW',
  'BALANCE_TOP_UP',
  'RECEIPTS_VIEW',
  'DIGITAL_COMMUNICATIONS_ACCESS',
]

/** Nombre visible del permiso, para el `FeatureFlagSwitcher` y el inspector. */
export const PERMISSION_LABELS: Record<Permission, string> = {
  ACCOUNT_VIEW: 'Ver cuenta',
  ACCOUNT_EDIT: 'Editar cuenta',
  ADDRESS_CREATE: 'Crear domicilio',
  ADDRESS_EDIT: 'Editar domicilio',
  ADDRESS_DELETE: 'Eliminar domicilio',
  USERS_MANAGE: 'Administrar usuarios',
  SHIPMENT_CREATE: 'Crear envío',
  SHIPMENT_EDIT: 'Editar envío',
  SHIPMENT_PAY: 'Pagar envío',
  SHIPMENT_CANCEL: 'Cancelar envío',
  SHIPMENT_RESCUE: 'Rescatar envío',
  BALANCE_VIEW: 'Ver saldo',
  BALANCE_TOP_UP: 'Recargar saldo',
  RECEIPTS_VIEW: 'Ver comprobantes',
  DIGITAL_COMMUNICATIONS_ACCESS: 'Acceder a Comunicaciones Digitales',
}

/** Preset de permisos por rol. Es el punto de partida, no la última palabra. */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  ACCOUNT_OWNER: PERMISSIONS,

  OPERATOR_WITH_PAYMENT: [
    'ACCOUNT_VIEW',
    'ADDRESS_CREATE',
    'ADDRESS_EDIT',
    'SHIPMENT_CREATE',
    'SHIPMENT_EDIT',
    'SHIPMENT_PAY',
    'SHIPMENT_CANCEL',
    'BALANCE_VIEW',
    'RECEIPTS_VIEW',
  ],

  OPERATOR_WITHOUT_PAYMENT: [
    'ACCOUNT_VIEW',
    'ADDRESS_CREATE',
    'ADDRESS_EDIT',
    'SHIPMENT_CREATE',
    'SHIPMENT_EDIT',
    'BALANCE_VIEW',
  ],

  READ_ONLY: ['ACCOUNT_VIEW', 'BALANCE_VIEW', 'RECEIPTS_VIEW'],
}

/** Permisos efectivos de un rol, como `Set` para consultas O(1). */
export function permissionsForRole(role: Role): ReadonlySet<Permission> {
  return new Set(ROLE_PERMISSIONS[role])
}
