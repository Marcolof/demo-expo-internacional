/**
 * Superficie pública del módulo "Mi Cuenta".
 * La maqueta no expone pantallas de este módulo; quedan escenarios y tipos.
 */

export { accountScenarios } from './scenarios/account.scenarios'
export type { AccountScenarioData } from './scenarios/account.scenarios'

export type { AccountProfile, AccountUser, AccountType, Address } from './types/account.types'
export { formatAddress } from './types/account.types'

export { canEditAddress } from './rules/canEditAddress'
export { canDeleteAddress } from './rules/canDeleteAddress'
export {
  canCreateUser,
  canDeleteUser,
  canEditUser,
  canManageUsers,
} from './rules/canManageUsers'
