/**
 * Roles de demostración.
 *
 * El rol es sólo una ETIQUETA + un preset de permisos. El acceso nunca se
 * decide comparando roles dentro de un componente: se decide con los permisos
 * (ver `permissions.ts`) a través de las funciones de `access.ts` y de los
 * `rules/*` de cada módulo.
 */

export type Role =
  | 'ACCOUNT_OWNER'
  | 'OPERATOR_WITH_PAYMENT'
  | 'OPERATOR_WITHOUT_PAYMENT'
  | 'READ_ONLY'

export const ROLES: readonly Role[] = [
  'ACCOUNT_OWNER',
  'OPERATOR_WITH_PAYMENT',
  'OPERATOR_WITHOUT_PAYMENT',
  'READ_ONLY',
]

/** Nombre visible del rol. En español rioplatense, como el resto de la UI. */
export const ROLE_LABELS: Record<Role, string> = {
  ACCOUNT_OWNER: 'Titular de la cuenta',
  OPERATOR_WITH_PAYMENT: 'Operador con pago',
  OPERATOR_WITHOUT_PAYMENT: 'Operador sin pago',
  READ_ONLY: 'Sólo lectura',
}

/** Descripción corta para el `UserSwitcher` de la barra de demo. */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ACCOUNT_OWNER: 'Acceso total: cuenta, usuarios, envíos, saldo y pagos.',
  OPERATOR_WITH_PAYMENT: 'Crea y paga envíos, pero no administra usuarios.',
  OPERATOR_WITHOUT_PAYMENT: 'Crea envíos y los deja pendientes de pago.',
  READ_ONLY: 'Sólo consulta. No puede crear ni modificar nada.',
}
