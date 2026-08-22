export interface FacturaERow {
  readonly id: string
  readonly destinatario: string
  readonly destino: string
  readonly nOrden: string
  readonly facturaE: string
  readonly montoUsd: number
  readonly divisa: string
  readonly tipoCambio: string
}

/** Filas mock iniciales de Facturación del envío (sesión, sin persistencia). */
export const FACTURA_E_SEED: readonly FacturaERow[] = [
  {
    id: 'fe-001',
    destinatario: 'Cliente S.A.',
    destino: 'Estados Unidos - Miami',
    nOrden: 'ORD-10050',
    facturaE: 'FE-0001-00012345',
    montoUsd: 1500,
    divisa: 'USD',
    tipoCambio: '1',
  },
  {
    id: 'fe-002',
    destinatario: 'Global Parts INC.',
    destino: 'Uruguay - Montevideo',
    nOrden: 'ORD-10051',
    facturaE: 'FE-0001-00012346',
    montoUsd: 1500,
    divisa: 'USD',
    tipoCambio: '1',
  },
  {
    id: 'fe-003',
    destinatario: 'Env. Int. S.A.',
    destino: 'Chile - Santiago',
    nOrden: 'ORD-10052',
    facturaE: 'FE-0001-00012347',
    montoUsd: 1500,
    divisa: 'USD',
    tipoCambio: '1',
  },
  {
    id: 'fe-004',
    destinatario: 'Expo INC.',
    destino: 'España - Madrid',
    nOrden: 'ORD-10053',
    facturaE: 'FE-0001-00012348',
    montoUsd: 1500,
    divisa: 'USD',
    tipoCambio: '1',
  },
]

/** Placeholder hasta copy legal definitivo (D-09). */
export const FACTURA_E_CUIT_LEGEND =
  'El CUIT debe coincidir con la factura según el Decreto… (texto pendiente de recibir). Completá los datos requeridos por envío.'
