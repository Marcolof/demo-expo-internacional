export interface ShipmentDetailOrigen {
  readonly branchName: string
  readonly province: string
  readonly address: string
  readonly postalCode: string
  readonly phone: string
}

export interface ShipmentDetailDestino {
  readonly recipientName: string
  readonly phone: string
  readonly email: string
  readonly address: string
  readonly postalCode: string
  readonly city: string
  readonly region: string
  readonly countryLabel: string
  readonly countryIso: string
}

export interface ShipmentDetailPaquete {
  readonly serviceLabel: string
  readonly productType: string
  readonly parcelCount: string
  readonly weightLabel: string
  readonly lengthLabel: string
  readonly widthLabel: string
  readonly heightLabel: string
  readonly contentValueLabel: string
  readonly currency: string
}

/** Vista de solo lectura del modal «Detalles del envío internacional». */
export interface InternationalShipmentDetail {
  readonly origen: ShipmentDetailOrigen
  readonly destino: ShipmentDetailDestino
  readonly paquete: ShipmentDetailPaquete
  /** Datos de listado (Mis envíos). Ausente en Factura E. */
  readonly resumen?: ShipmentDetailResumen
}

/** Fila de Mis envíos, lo mínimo para armar el detalle. */
export interface EnvioDetailSource {
  readonly id: string
  readonly nOrden: string
  readonly origen: string
  readonly destinatario: string
  readonly destino: string
  readonly detalles: string
  readonly usuario: string
  readonly estado: string
  readonly scope: 'nacional' | 'internacional'
  readonly fecha?: string
  readonly seguimiento?: string
  readonly direccion?: string
}

export interface ShipmentDetailResumen {
  readonly orderNumber: string
  readonly status: string
  readonly extras: readonly ShipmentDetailResumenExtra[]
}

export interface ShipmentDetailResumenExtra {
  readonly label: string
  readonly value: string
}
