/**
 * Datos simulados del dominio Envíos.
 *
 * Nada de esto sale de una API: son constantes locales. Las provincias y sus
 * códigos de letra son los mismos que expone el HTML de referencia.
 */

import type { Provincia, SelectOption } from '@/core/types/common'
import type { Shipment } from '../types/shipment.types'

/** Provincias argentinas con el código de letra que usa MiCorreo. */
export const PROVINCIAS: readonly Provincia[] = [
  { code: 'B', name: 'BUENOS AIRES' },
  { code: 'C', name: 'CAPITAL FEDERAL' },
  { code: 'K', name: 'CATAMARCA' },
  { code: 'H', name: 'CHACO' },
  { code: 'U', name: 'CHUBUT' },
  { code: 'X', name: 'CORDOBA' },
  { code: 'W', name: 'CORRIENTES' },
  { code: 'E', name: 'ENTRE RIOS' },
  { code: 'P', name: 'FORMOSA' },
  { code: 'Y', name: 'JUJUY' },
  { code: 'L', name: 'LA PAMPA' },
  { code: 'F', name: 'LA RIOJA' },
  { code: 'M', name: 'MENDOZA' },
  { code: 'N', name: 'MISIONES' },
  { code: 'Q', name: 'NEUQUEN' },
  { code: 'R', name: 'RIO NEGRO' },
  { code: 'A', name: 'SALTA' },
  { code: 'J', name: 'SAN JUAN' },
  { code: 'D', name: 'SAN LUIS' },
  { code: 'Z', name: 'SANTA CRUZ' },
  { code: 'S', name: 'SANTA FE' },
  { code: 'G', name: 'SANTIAGO DEL ESTERO' },
  { code: 'V', name: 'TIERRA DEL FUEGO' },
  { code: 'T', name: 'TUCUMAN' },
]

export const PROVINCE_OPTIONS: readonly SelectOption[] = PROVINCIAS.map((provincia) => ({
  value: provincia.code,
  label: provincia.name,
}))

export interface Branch {
  readonly code: string
  readonly name: string
  readonly provinceCode: string
  readonly postalCode: string
  /** Sólo las sucursales con asiento aduanero admiten internacional > 2 kg. */
  readonly hasCustomsOffice: boolean
}

/** Sucursales de imposición. */
export const BRANCHES: readonly Branch[] = [
  { code: 'X3001', name: 'CORDOBA CENTRO', provinceCode: 'X', postalCode: '5000', hasCustomsOffice: true },
  { code: 'X3002', name: 'CORDOBA NUEVA CORDOBA', provinceCode: 'X', postalCode: '5004', hasCustomsOffice: false },
  { code: 'X3003', name: 'CORDOBA ALTA CORDOBA', provinceCode: 'X', postalCode: '5008', hasCustomsOffice: false },
  { code: 'C1001', name: 'CABA RETIRO', provinceCode: 'C', postalCode: '1001', hasCustomsOffice: true },
  { code: 'C1002', name: 'CABA CENTRO', provinceCode: 'C', postalCode: '1004', hasCustomsOffice: false },
  { code: 'B2001', name: 'LA PLATA CENTRO', provinceCode: 'B', postalCode: '1900', hasCustomsOffice: false },
  { code: 'S4001', name: 'ROSARIO CENTRO', provinceCode: 'S', postalCode: '2000', hasCustomsOffice: true },
  { code: 'M5001', name: 'MENDOZA CENTRO', provinceCode: 'M', postalCode: '5500', hasCustomsOffice: true },
  { code: 'K3332', name: 'CATAMARCA CENTRO', provinceCode: 'K', postalCode: '4700', hasCustomsOffice: false },
]

/** Sucursales de una provincia, para poblar el select dependiente. */
export function branchesByProvince(provinceCode: string): readonly SelectOption[] {
  return BRANCHES.filter((branch) => branch.provinceCode === provinceCode).map((branch) => ({
    value: branch.code,
    label: `${branch.name} (${branch.postalCode})`,
  }))
}

/** Domicilios de origen guardados en la cuenta. */
export const SAVED_ORIGIN_ADDRESSES: readonly SelectOption[] = [
  { value: '5008', label: 'Benjamín Matienzo 5548, Córdoba, CORDOBA' },
  { value: '5000', label: 'Av. Colón 1250, Córdoba, CORDOBA' },
  { value: '1425', label: 'Av. Santa Fe 3253, CABA, CAPITAL FEDERAL' },
]

/** Medidas guardadas por el usuario ("Medidas frecuentes"). */
export interface FrequentMeasure {
  readonly id: string
  readonly alias: string
  readonly lengthCm: number
  readonly widthCm: number
  readonly heightCm: number
  readonly isDefault: boolean
}

export const FREQUENT_MEASURES: readonly FrequentMeasure[] = [
  { id: '102927', alias: 'Caja chica', lengthCm: 30, widthCm: 20, heightCm: 10, isDefault: true },
  { id: '102928', alias: 'Caja mediana', lengthCm: 50, widthCm: 40, heightCm: 30, isDefault: false },
  { id: '102929', alias: 'Sobre documentación', lengthCm: 35, widthCm: 25, heightCm: 2, isDefault: false },
]

export const FREQUENT_MEASURE_OPTIONS: readonly SelectOption[] = FREQUENT_MEASURES.map(
  (measure) => ({ value: measure.id, label: measure.alias }),
)

/** Países habilitados para envíos internacionales salientes. */
export const DESTINATION_COUNTRIES: readonly SelectOption[] = [
  { value: 'BR', label: 'Brasil' },
  { value: 'CL', label: 'Chile' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'PY', label: 'Paraguay' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'ES', label: 'España' },
  { value: 'IT', label: 'Italia' },
  { value: 'CN', label: 'China' },
]

// --- Envíos ----------------------------------------------------------------

const ARS = (amount: number) => ({ amount, currency: 'ARS' } as const)

export const SHIPMENT_PENDING_EDITABLE: Shipment = {
  id: 'shp-001',
  orderNumber: 'ORD-10045',
  scope: 'NACIONAL',
  status: 'COTIZADO',
  createdAt: '2026-08-01T10:15:00Z',
  originKind: 'PICKUP',
  deliveryKind: 'DOMICILIO',
  origin: {
    name: 'Loforte Encomiendas SRL',
    addressLine: 'Benjamín Matienzo 5548, Córdoba, CORDOBA',
    city: 'Córdoba',
    province: 'CORDOBA',
    postalCode: '5008',
  },
  destination: {
    name: 'Ana Beltrán',
    email: 'ana.beltran@ejemplo.com.ar',
    phone: '11 4567-8901',
    addressLine: 'Av. Santa Fe 3253, Piso 4 Dpto B',
    city: 'CABA',
    province: 'CAPITAL FEDERAL',
    postalCode: '1425',
  },
  measures: { lengthCm: 30, widthCm: 20, heightCm: 10, weightKg: 1.5 },
  declaredValue: ARS(45000),
  service: 'PAQAR_CLASICO',
  price: ARS(8750),
}

export const SHIPMENT_PAID_PREIMPOSITION: Shipment = {
  id: 'shp-002',
  orderNumber: 'ORD-10046',
  trackingCode: 'CD123456789AR',
  scope: 'NACIONAL',
  status: 'PAGADO',
  createdAt: '2026-07-28T14:02:00Z',
  paidAt: '2026-07-28T14:20:00Z',
  documentationExpiresAt: '2026-08-27T14:20:00Z',
  originKind: 'SUCURSAL',
  deliveryKind: 'SUCURSAL',
  origin: {
    name: 'Loforte Encomiendas SRL',
    addressLine: 'CORDOBA CENTRO',
    branchCode: 'X3001',
    branchName: 'CORDOBA CENTRO',
    province: 'CORDOBA',
    postalCode: '5000',
  },
  destination: {
    name: 'Martín Ruiz',
    email: 'martin.ruiz@ejemplo.com.ar',
    phone: '341 555-1234',
    addressLine: 'ROSARIO CENTRO',
    branchCode: 'S4001',
    branchName: 'ROSARIO CENTRO',
    city: 'Rosario',
    province: 'SANTA FE',
    postalCode: '2000',
  },
  measures: { lengthCm: 50, widthCm: 40, heightCm: 30, weightKg: 6 },
  declaredValue: ARS(120000),
  service: 'PAQAR_EXPRESO',
  price: ARS(19400),
}

export const SHIPMENT_IMPOSED: Shipment = {
  id: 'shp-003',
  orderNumber: 'ORD-10047',
  trackingCode: 'CD987654321AR',
  scope: 'NACIONAL',
  status: 'EN_IMPOSICION',
  createdAt: '2026-07-20T09:30:00Z',
  paidAt: '2026-07-20T09:45:00Z',
  documentationExpiresAt: '2026-08-19T09:45:00Z',
  originKind: 'SUCURSAL',
  deliveryKind: 'DOMICILIO',
  origin: {
    name: 'Loforte Encomiendas SRL',
    addressLine: 'CORDOBA CENTRO',
    branchCode: 'X3001',
    branchName: 'CORDOBA CENTRO',
    province: 'CORDOBA',
    postalCode: '5000',
  },
  destination: {
    name: 'Sofía Molina',
    email: 'sofia.molina@ejemplo.com.ar',
    phone: '261 444-9876',
    addressLine: 'San Martín 1420, Piso 2',
    city: 'Mendoza',
    province: 'MENDOZA',
    postalCode: '5500',
  },
  measures: { lengthCm: 40, widthCm: 30, heightCm: 20, weightKg: 3.2 },
  declaredValue: ARS(78000),
  service: 'PAQAR_HOY',
  price: ARS(24100),
}

export const SHIPMENT_INTERNATIONAL_COMMERCIAL: Shipment = {
  id: 'shp-004',
  orderNumber: 'ORD-10048',
  scope: 'INTERNACIONAL',
  purpose: 'COMMERCIAL',
  status: 'PENDIENTE_DE_COTIZACION',
  createdAt: '2026-08-03T16:40:00Z',
  originKind: 'SUCURSAL',
  deliveryKind: 'DOMICILIO',
  origin: {
    name: 'Loforte Encomiendas SRL',
    addressLine: 'CABA RETIRO',
    branchCode: 'C1001',
    branchName: 'CABA RETIRO',
    province: 'CAPITAL FEDERAL',
    postalCode: '1001',
  },
  destination: {
    name: 'Joana Ribeiro',
    email: 'joana.ribeiro@exemplo.com.br',
    phone: '+55 11 98765-4321',
    addressLine: 'Rua Augusta 1200, Apto 52',
    city: 'São Paulo',
    province: 'São Paulo',
    postalCode: '01304-001',
  },
  measures: { lengthCm: 35, widthCm: 25, heightCm: 15, weightKg: 4.5 },
  declaredValue: { amount: 320, currency: 'USD' },
  customsRepresentationAccepted: true,
}

export const SHIPMENT_DELIVERED: Shipment = {
  id: 'shp-005',
  orderNumber: 'ORD-10039',
  trackingCode: 'CD111222333AR',
  scope: 'NACIONAL',
  status: 'ENTREGADO',
  createdAt: '2026-07-05T11:00:00Z',
  paidAt: '2026-07-05T11:12:00Z',
  originKind: 'PICKUP',
  deliveryKind: 'DOMICILIO',
  origin: {
    name: 'Loforte Encomiendas SRL',
    addressLine: 'Benjamín Matienzo 5548, Córdoba, CORDOBA',
    city: 'Córdoba',
    province: 'CORDOBA',
    postalCode: '5008',
  },
  destination: {
    name: 'Pablo Herrera',
    email: 'pablo.herrera@ejemplo.com.ar',
    phone: '351 222-3344',
    addressLine: 'Bv. Illia 320',
    city: 'Córdoba',
    province: 'CORDOBA',
    postalCode: '5000',
  },
  measures: { lengthCm: 25, widthCm: 20, heightCm: 8, weightKg: 0.8 },
  declaredValue: ARS(22000),
  service: 'PAQAR_CLASICO',
  price: ARS(6200),
}

/** Listado completo de la grilla por defecto. */
export const ALL_SHIPMENTS: readonly Shipment[] = [
  SHIPMENT_PENDING_EDITABLE,
  SHIPMENT_PAID_PREIMPOSITION,
  SHIPMENT_IMPOSED,
  SHIPMENT_INTERNATIONAL_COMMERCIAL,
  SHIPMENT_DELIVERED,
]

/** Busca un envío por id entre todos los mocks conocidos. */
export function findShipment(id: string): Shipment | undefined {
  return ALL_SHIPMENTS.find((shipment) => shipment.id === id)
}
