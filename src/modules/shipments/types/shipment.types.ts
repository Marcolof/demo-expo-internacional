/**
 * Tipos del dominio Envíos.
 *
 * Los estados salen del requerimiento funcional de Paquetería Internacional
 * (sección "Estados conceptuales"). Los nombres finales deben alinearse con
 * MiCorreo y los sistemas postales: si cambian, se cambian acá y nada más.
 */

import type { Id, IsoDate, Money } from '@/core/types/common'

export type ShipmentStatus =
  | 'BORRADOR'
  | 'PENDIENTE'
  | 'PENDIENTE_DE_COTIZACION'
  | 'COTIZADO'
  | 'PENDIENTE_DE_PAGO'
  | 'PAGADO'
  | 'CANCELADO'
  | 'CADUCADO'
  | 'EN_IMPOSICION'
  | 'ADMITIDO'
  | 'OBSERVADO'
  | 'EN_TRANSITO'
  | 'ENTREGADO'
  | 'ERROR'

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  BORRADOR: 'Borrador',
  PENDIENTE: 'Pendiente',
  PENDIENTE_DE_COTIZACION: 'Pendiente de cotización',
  COTIZADO: 'Cotizado',
  PENDIENTE_DE_PAGO: 'Pendiente de pago',
  PAGADO: 'Pagado',
  CANCELADO: 'Cancelado',
  CADUCADO: 'Caducado',
  EN_IMPOSICION: 'En imposición',
  ADMITIDO: 'Admitido',
  OBSERVADO: 'Observado',
  EN_TRANSITO: 'En tránsito',
  ENTREGADO: 'Entregado',
  ERROR: 'Error',
}

/** Nacional o internacional. La maqueta arranca por nacional (el HTML de referencia). */
export type ShipmentScope = 'NACIONAL' | 'INTERNACIONAL'

/** Finalidad. Sólo aplica a internacional. */
export type ShipmentPurpose = 'COMMERCIAL' | 'NON_COMMERCIAL'

/** Productos nacionales del HTML de referencia. */
export type NationalProduct = 'PAQAR_HOY' | 'PAQAR_EXPRESO' | 'PAQAR_CLASICO'

/** Servicios postales internacionales documentados en el requerimiento. */
export type InternationalService =
  | 'EMS_PAQUETERIA'
  | 'ENCOMIENDA_INTERNACIONAL'
  | 'PEQUENO_PAQUETE'
  | 'EMS_DOCUMENTACION'

export type PostalService = NationalProduct | InternationalService

export const POSTAL_SERVICE_LABELS: Record<PostalService, string> = {
  PAQAR_HOY: 'PAQ.AR Hoy',
  PAQAR_EXPRESO: 'PAQ.AR Expreso',
  PAQAR_CLASICO: 'PAQ.AR Clásico',
  EMS_PAQUETERIA: 'EMS Paquetería',
  ENCOMIENDA_INTERNACIONAL: 'Encomienda Internacional',
  PEQUENO_PAQUETE: 'Pequeño Paquete',
  EMS_DOCUMENTACION: 'EMS Documentación',
}

/** Plazos de entrega, tal como los declara el requerimiento. */
export const POSTAL_SERVICE_DELIVERY_TIMES: Record<PostalService, string> = {
  PAQAR_HOY: 'En el día*',
  PAQAR_EXPRESO: 'De 1 a 3 días hábiles*',
  PAQAR_CLASICO: 'De 2 a 5 días hábiles*',
  EMS_PAQUETERIA: 'Entrega estimada entre 2 y 8 días hábiles, según el destino.',
  ENCOMIENDA_INTERNACIONAL: 'Entrega estimada entre 7 y 20 días hábiles, según el destino.',
  PEQUENO_PAQUETE: 'Entrega estimada entre 7 y 20 días hábiles, según el destino.',
  EMS_DOCUMENTACION: 'Entrega estimada entre 2 y 7 días hábiles, según el destino.',
}

/** Modalidad de entrega en destino. */
export type DeliveryKind = 'DOMICILIO' | 'SUCURSAL'

/** Modalidad de origen. Pick Up no aplica a internacional en la etapa 1. */
export type OriginKind = 'PICKUP' | 'SUCURSAL'

export interface PackageMeasures {
  readonly lengthCm: number
  readonly widthCm: number
  readonly heightCm: number
  readonly weightKg: number
  /** Calculado por el sistema, no lo ingresa el usuario: L × A × Al / 6000. */
  readonly volumetricWeightKg?: number
}

export interface ShipmentParty {
  readonly name: string
  readonly email?: string
  readonly phone?: string
  /** Domicilio armado en una línea, listo para grillas y resúmenes. */
  readonly addressLine: string
  readonly city?: string
  readonly province?: string
  readonly postalCode?: string
  /** Sucursal de imposición o de retiro, cuando corresponde. */
  readonly branchCode?: string
  readonly branchName?: string
}

export interface Shipment {
  readonly id: Id
  /** Número de orden que el usuario puede cargar a mano. */
  readonly orderNumber?: string
  readonly trackingCode?: string
  readonly scope: ShipmentScope
  readonly purpose?: ShipmentPurpose
  readonly status: ShipmentStatus
  readonly createdAt: IsoDate
  readonly paidAt?: IsoDate
  readonly origin: ShipmentParty
  readonly destination: ShipmentParty
  readonly originKind: OriginKind
  readonly deliveryKind: DeliveryKind
  readonly measures: PackageMeasures
  readonly declaredValue: Money
  readonly service?: PostalService
  readonly price?: Money
  /** Sólo internacional comercial. Se registra la decisión del usuario. */
  readonly customsRepresentationAccepted?: boolean
  /** Vencimiento de la documentación del envío pagado (30 días). */
  readonly documentationExpiresAt?: IsoDate
}

/**
 * Origen operativo que se muestra en grillas y resúmenes.
 * Normalización del requerimiento: en internacional el origen ES la sucursal de
 * imposición, no el domicilio del remitente.
 */
export function shipmentOriginLabel(shipment: Shipment): string {
  if (shipment.originKind === 'SUCURSAL') {
    const branch = shipment.origin.branchName ?? shipment.origin.branchCode
    if (branch !== undefined) return `SUC: ${branch}`
  }
  return shipment.origin.addressLine
}

/** Destino que se muestra en grillas. Internacional = país + provincia/estado. */
export function shipmentDestinationLabel(shipment: Shipment): string {
  const { destination } = shipment
  if (shipment.deliveryKind === 'SUCURSAL') {
    const branch = destination.branchName ?? destination.branchCode
    if (branch !== undefined) return `SUC: ${branch}`
  }
  const parts = [destination.city, destination.province].filter(
    (part): part is string => part !== undefined && part !== '',
  )
  return parts.length > 0 ? parts.join(', ') : destination.addressLine
}

/** Peso volumétrico documentado para EMS: largo × ancho × alto / 6000. */
export function volumetricWeightKg(measures: PackageMeasures): number {
  return (measures.lengthCm * measures.widthCm * measures.heightCm) / 6000
}
