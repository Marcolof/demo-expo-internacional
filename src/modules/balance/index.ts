/**
 * API pública del módulo Mi Saldo.
 * La maqueta no expone pantallas de este módulo; quedan escenarios y tipos.
 */

export { BalanceCard } from './components/BalanceCard'
export type { BalanceCardProps } from './components/BalanceCard'
export { ReceiptTable } from './components/ReceiptTable'
export type { ReceiptTableProps } from './components/ReceiptTable'
export { ConfirmTopUpModal } from './modals/ConfirmTopUpModal'
export type { ConfirmTopUpModalProps } from './modals/ConfirmTopUpModal'

export { balanceScenarios } from './scenarios/balance.scenarios'
export type { BalanceScenarioData } from './scenarios/balance.scenarios'

export {
  MAX_TOP_UP_AMOUNT,
  MIN_TOP_UP_AMOUNT,
  canTopUpBalance,
  validateTopUpAmount,
} from './rules/canTopUpBalance'
export { canViewReceipts } from './rules/canViewReceipts'

export type {
  AccountBalance,
  BalanceMovement,
  MovementKind,
  Receipt,
  ReceiptType,
  TopUpMethod,
} from './types/balance.types'
export {
  MOVEMENT_KIND_LABELS,
  RECEIPT_TYPE_LABELS,
  TOP_UP_METHOD_LABELS,
} from './types/balance.types'
