/**
 * Datos simulados de Mi Saldo.
 *
 * Todo lo que se ve en las pantallas sale de acá. Los escenarios
 * (`scenarios/balance.scenarios.ts`) sólo combinan estas piezas: así se agrega
 * un caso nuevo sin duplicar la lista de movimientos.
 */

import type { Money } from '@/core/types/common'
import type { AccountBalance, BalanceMovement, Receipt } from '../types/balance.types'

/** Atajo para no repetir `currency` en cada importe. */
function ars(amount: number): Money {
  return { amount, currency: 'ARS' }
}

/** Cuenta con saldo y cuenta corriente habilitada (caso típico corporativo). */
export const accountBalanceMock: AccountBalance = {
  available: ars(184_320.55),
  pending: ars(27_480.0),
  lastUpdatedAt: '2026-08-04T09:15:00-03:00',
  hasCurrentAccount: true,
  creditLimit: ars(1_500_000),
}

/** Misma cuenta sin un peso: sirve para mostrar el aviso de saldo insuficiente. */
export const zeroAccountBalanceMock: AccountBalance = {
  available: ars(0),
  pending: ars(0),
  lastUpdatedAt: '2026-08-04T09:15:00-03:00',
  hasCurrentAccount: false,
}

/**
 * Movimientos ordenados del más reciente al más antiguo, que es como los
 * espera la grilla. `balanceAfter` acompaña la corrida hacia atrás.
 */
export const balanceMovementsMock: readonly BalanceMovement[] = [
  {
    id: 'mov-012',
    date: '2026-08-04T09:15:00-03:00',
    kind: 'PAGO_ENVIO',
    description: 'Pago envío CD1204587AR — Encomienda Clásica a Rosario',
    amount: ars(-8_940.45),
    balanceAfter: ars(184_320.55),
  },
  {
    id: 'mov-011',
    date: '2026-08-03T16:42:00-03:00',
    kind: 'RECARGA',
    description: 'Recarga con tarjeta de crédito Visa **** 4417',
    amount: ars(150_000),
    balanceAfter: ars(193_261.0),
  },
  {
    id: 'mov-010',
    date: '2026-08-01T11:08:00-03:00',
    kind: 'PAGO_ENVIO',
    description: 'Pago envío CD1198342AR — Paquetería Internacional a Brasil',
    amount: ars(-62_150.0),
    balanceAfter: ars(43_261.0),
  },
  {
    id: 'mov-009',
    date: '2026-07-29T10:20:00-03:00',
    kind: 'DEVOLUCION',
    description: 'Devolución por envío cancelado CD1195028AR',
    amount: ars(12_400.0),
    balanceAfter: ars(105_411.0),
  },
  {
    id: 'mov-008',
    date: '2026-07-28T15:55:00-03:00',
    kind: 'PAGO_ENVIO',
    description: 'Pago envío CD1194771AR — Encomienda Clásica a Córdoba',
    amount: ars(-7_310.0),
    balanceAfter: ars(93_011.0),
  },
  {
    id: 'mov-007',
    date: '2026-07-24T09:02:00-03:00',
    kind: 'AJUSTE',
    description: 'Ajuste por diferencia de peso en envío CD1191203AR',
    amount: ars(-1_875.5),
    balanceAfter: ars(100_321.0),
  },
  {
    id: 'mov-006',
    date: '2026-07-21T18:30:00-03:00',
    kind: 'RECARGA',
    description: 'Recarga por transferencia bancaria — Banco Nación',
    amount: ars(80_000),
    balanceAfter: ars(102_196.5),
  },
  {
    id: 'mov-005',
    date: '2026-07-17T12:14:00-03:00',
    kind: 'PAGO_ENVIO',
    description: 'Pago envío CD1187640AR — Paquetería Internacional a Chile',
    amount: ars(-45_780.0),
    balanceAfter: ars(22_196.5),
  },
  {
    id: 'mov-004',
    date: '2026-07-14T08:47:00-03:00',
    kind: 'PAGO_ENVIO',
    description: 'Pago envío CD1185119AR — Encomienda Clásica a Mendoza',
    amount: ars(-9_620.0),
    balanceAfter: ars(67_976.5),
  },
  {
    id: 'mov-003',
    date: '2026-07-09T17:05:00-03:00',
    kind: 'RECARGA',
    description: 'Recarga con tarjeta de débito Maestro **** 8802',
    amount: ars(60_000),
    balanceAfter: ars(77_596.5),
  },
  {
    id: 'mov-002',
    date: '2026-07-06T13:39:00-03:00',
    kind: 'PAGO_ENVIO',
    description: 'Pago envío CD1181455AR — Encomienda Clásica a La Plata',
    amount: ars(-6_150.0),
    balanceAfter: ars(17_596.5),
  },
  {
    id: 'mov-001',
    date: '2026-07-01T10:00:00-03:00',
    kind: 'RECARGA',
    description: 'Recarga inicial del período',
    amount: ars(23_746.5),
    balanceAfter: ars(23_746.5),
  },
]

/**
 * Comprobantes de la cuenta. Son 14 a propósito: la grilla tiene que mostrar
 * el paginador (página de 10).
 */
export const receiptsMock: readonly Receipt[] = [
  {
    id: 'rcp-014',
    number: '0001-00012478',
    type: 'FACTURA_A',
    issuedAt: '2026-08-04',
    total: ars(8_940.45),
    relatedShipmentId: 'shp-1204587',
  },
  {
    id: 'rcp-013',
    number: '0001-00012455',
    type: 'RECIBO',
    issuedAt: '2026-08-03',
    total: ars(150_000),
  },
  {
    id: 'rcp-012',
    number: '0001-00012431',
    type: 'FACTURA_E',
    issuedAt: '2026-08-01',
    total: ars(62_150.0),
    relatedShipmentId: 'shp-1198342',
  },
  {
    id: 'rcp-011',
    number: '0001-00012398',
    type: 'NOTA_CREDITO',
    issuedAt: '2026-07-29',
    total: ars(12_400.0),
    relatedShipmentId: 'shp-1195028',
  },
  {
    id: 'rcp-010',
    number: '0001-00012376',
    type: 'FACTURA_A',
    issuedAt: '2026-07-28',
    total: ars(7_310.0),
    relatedShipmentId: 'shp-1194771',
  },
  {
    id: 'rcp-009',
    number: '0001-00012344',
    type: 'FACTURA_A',
    issuedAt: '2026-07-24',
    total: ars(1_875.5),
    relatedShipmentId: 'shp-1191203',
  },
  {
    id: 'rcp-008',
    number: '0001-00012319',
    type: 'RECIBO',
    issuedAt: '2026-07-21',
    total: ars(80_000),
  },
  {
    id: 'rcp-007',
    number: '0001-00012287',
    type: 'FACTURA_E',
    issuedAt: '2026-07-17',
    total: ars(45_780.0),
    relatedShipmentId: 'shp-1187640',
  },
  {
    id: 'rcp-006',
    number: '0001-00012260',
    type: 'FACTURA_A',
    issuedAt: '2026-07-14',
    total: ars(9_620.0),
    relatedShipmentId: 'shp-1185119',
  },
  {
    id: 'rcp-005',
    number: '0001-00012234',
    type: 'RECIBO',
    issuedAt: '2026-07-09',
    total: ars(60_000),
  },
  {
    id: 'rcp-004',
    number: '0001-00012201',
    type: 'FACTURA_B',
    issuedAt: '2026-07-06',
    total: ars(6_150.0),
    relatedShipmentId: 'shp-1181455',
  },
  {
    id: 'rcp-003',
    number: '0001-00012177',
    type: 'FACTURA_A',
    issuedAt: '2026-06-30',
    total: ars(18_430.0),
    relatedShipmentId: 'shp-1178904',
  },
  {
    id: 'rcp-002',
    number: '0001-00012140',
    type: 'NOTA_CREDITO',
    issuedAt: '2026-06-24',
    total: ars(3_280.0),
    relatedShipmentId: 'shp-1176332',
  },
  {
    id: 'rcp-001',
    number: '0001-00012108',
    type: 'FACTURA_A',
    issuedAt: '2026-06-18',
    total: ars(11_990.0),
    relatedShipmentId: 'shp-1174015',
  },
]
