export interface FacturaERow {
  readonly id: string
  readonly destinatario: string
  readonly destino: string
  readonly nOrden: string
  readonly facturaE: string
  readonly montoUsd: number
  readonly tipoCambioArs: number
}

/** Tipo de cambio de maqueta (ARS por USD), alineado al Figma de Facturación. */
export const FACTURA_E_DEMO_FX_ARS = 1530

/** Filas mock iniciales de Facturación del envío (sesión, sin persistencia). */
export const FACTURA_E_SEED: readonly FacturaERow[] = [
  {
    id: 'fe-001',
    destinatario: 'Pampa Grains S.A.',
    destino: 'Brasil - São Paulo',
    nOrden: 'ORD-0024871',
    facturaE: 'FE-0001-00087632',
    montoUsd: 245,
    tipoCambioArs: FACTURA_E_DEMO_FX_ARS,
  },
  {
    id: 'fe-002',
    destinatario: 'Latam Supplies SpA',
    destino: 'Chile - Santiago',
    nOrden: 'ORD-0024903',
    facturaE: 'FE-0001-00087640',
    montoUsd: 180,
    tipoCambioArs: FACTURA_E_DEMO_FX_ARS,
  },
  {
    id: 'fe-003',
    destinatario: 'Andes Dairy Co.',
    destino: 'Uruguay - Montevideo',
    nOrden: 'ORD-0024910',
    facturaE: 'FE-0001-00087651',
    montoUsd: 310,
    tipoCambioArs: FACTURA_E_DEMO_FX_ARS,
  },
  {
    id: 'fe-004',
    destinatario: 'Patagonia Meats Ltd.',
    destino: 'Colombia - Bogotá',
    nOrden: 'ORD-0024915',
    facturaE: 'FE-0001-00087658',
    montoUsd: 420,
    tipoCambioArs: FACTURA_E_DEMO_FX_ARS,
  },
]

export const FACTURA_E_CUIT_LEGEND =
  'El CUIT debe coincidir con la factura según el Decreto 604/2026'
