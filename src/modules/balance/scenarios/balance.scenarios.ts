/**
 * Escenarios de Mi Saldo.
 *
 * Cada entrada es un estado navegable (`?scenario=zero-balance`). Los que
 * necesitan otro usuario o otros permisos lo declaran en `session`, así la
 * pantalla no sabe nada de la demo: sólo lee el usuario activo.
 */

import type { ScenarioRegistry } from '@/core/session/activeScenario'
import {
  accountBalanceMock,
  balanceMovementsMock,
  receiptsMock,
  zeroAccountBalanceMock,
} from '../mocks/balance.mocks'
import type { AccountBalance, BalanceMovement, Receipt } from '../types/balance.types'

export interface BalanceScenarioData {
  readonly balance: AccountBalance
  readonly movements: readonly BalanceMovement[]
  readonly receipts: readonly Receipt[]
}

export const balanceScenarios: ScenarioRegistry<BalanceScenarioData> = {
  default: {
    id: 'default',
    label: 'Saldo con movimientos',
    description:
      'Cuenta corporativa con saldo disponible, importe retenido y comprobantes emitidos. Es el estado de referencia del módulo.',
    data: {
      balance: accountBalanceMock,
      movements: balanceMovementsMock,
      receipts: receiptsMock,
    },
  },

  'operator-without-payment': {
    id: 'operator-without-payment',
    label: 'Operador sin permiso de pago',
    description:
      'Subusuario que ve el saldo pero no puede recargarlo ni pagar envíos. El botón de recarga queda deshabilitado con el motivo a la vista.',
    data: {
      balance: accountBalanceMock,
      movements: balanceMovementsMock,
      receipts: receiptsMock,
    },
    session: {
      userId: 'usr-003',
      permissionOverrides: { BALANCE_TOP_UP: false, SHIPMENT_PAY: false },
    },
  },

  'zero-balance': {
    id: 'zero-balance',
    label: 'Saldo en cero',
    description:
      'Cuenta sin saldo disponible ni importes retenidos. Sirve para mostrar el aviso de que hay que recargar antes de pagar un envío.',
    data: {
      balance: zeroAccountBalanceMock,
      movements: [],
      receipts: receiptsMock,
    },
  },

  'empty-receipts': {
    id: 'empty-receipts',
    label: 'Sin comprobantes',
    description:
      'Cuenta con saldo y movimientos pero sin comprobantes emitidos todavía: muestra el estado vacío de la grilla de comprobantes.',
    data: {
      balance: accountBalanceMock,
      movements: balanceMovementsMock,
      receipts: [],
    },
  },
}
