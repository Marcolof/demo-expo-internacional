/**
 * País de destino para envíos internacionales.
 * `shippingAvailable` indica si Correo Argentino opera envíos a ese destino.
 * Cuando es `false`, la UI muestra el error del Figma node 8040:123767.
 *
 * Fuente de verdad de la maqueta para restricciones de **servicio** (sin vuelo /
 * sin operador). Las restricciones de **contenido** viven en
 * `country-restrictions.mocks.ts` y solo aplican si el país tiene servicio.
 *
 * Países del Select general (`@/shared/lib/countries`) no listados aquí se
 * consideran con servicio disponible.
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

/** Códigos ISO con `shippingAvailable: false` en la maqueta. */
export const COUNTRIES_WITHOUT_SHIPPING: ReadonlySet<string> = new Set(
  DESTINATION_COUNTRIES_DATA.filter((c) => !c.shippingAvailable).map((c) => c.value),
)

export function isCountryShippingAvailable(iso2: string): boolean {
  if (iso2 === '' || iso2 === '-1') return true
  return !COUNTRIES_WITHOUT_SHIPPING.has(iso2.toUpperCase())
}
