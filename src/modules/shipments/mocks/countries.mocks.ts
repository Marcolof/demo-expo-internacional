/**
 * País de destino para envíos internacionales.
 * `shippingAvailable` indica si Correo Argentino opera envíos a ese destino.
 * Cuando es `false`, la UI muestra el error del Figma node 8040:123767.
 */
export interface DestinationCountry {
  readonly value: string
  readonly label: string
  readonly shippingAvailable: boolean
}

export const DESTINATION_COUNTRIES_DATA: readonly DestinationCountry[] = [
  { value: 'BR', label: 'Brasil',          shippingAvailable: true  },
  { value: 'CL', label: 'Chile',           shippingAvailable: true  },
  { value: 'UY', label: 'Uruguay',         shippingAvailable: true  },
  { value: 'PY', label: 'Paraguay',        shippingAvailable: true  },
  { value: 'US', label: 'Estados Unidos',  shippingAvailable: true  },
  { value: 'ES', label: 'España',          shippingAvailable: true  },
  { value: 'MX', label: 'México',          shippingAvailable: true  },
  { value: 'RU', label: 'Rusia',           shippingAvailable: false },
  { value: 'CU', label: 'Cuba',            shippingAvailable: false },
  { value: 'KP', label: 'Corea del Norte', shippingAvailable: false },
]
