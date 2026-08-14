/**
 * Rangos geográficos para país de destino (supporting text bajo el Select).
 */

export type GeographicRangeId =
  | 'LIMITROFES'
  | 'RESTO_SUDAMERICA'
  | 'RESTO_AMERICA'
  | 'EUROPA'
  | 'RESTO_MUNDO'

export const GEOGRAPHIC_RANGE_LABELS: Record<GeographicRangeId, string> = {
  LIMITROFES: 'Países Limítrofes',
  RESTO_SUDAMERICA: 'Países del resto de Sudamérica',
  RESTO_AMERICA: 'Países del resto de América',
  EUROPA: 'Países de Europa',
  RESTO_MUNDO: 'Países del resto del Mundo',
}

const LIMITROFES = new Set(['BO', 'BR', 'CL', 'PY', 'UY'])

const RESTO_SUDAMERICA = new Set(['CO', 'EC', 'GY', 'PE', 'SR', 'VE', 'GF'])

const RESTO_AMERICA = new Set([
  'AG', 'AI', 'AW', 'BB', 'BM', 'BQ', 'BS', 'BZ', 'CA', 'CR', 'CU', 'CW', 'DM',
  'DO', 'GD', 'GL', 'GP', 'GT', 'HN', 'HT', 'JM', 'KN', 'KY', 'LC', 'MF', 'MQ',
  'MS', 'MX', 'NI', 'PA', 'PM', 'PR', 'SV', 'SX', 'TC', 'TT', 'US', 'VC', 'VG',
  'VI', 'AN',
])

const EUROPA = new Set([
  'AD', 'AL', 'AT', 'AX', 'BA', 'BE', 'BG', 'BY', 'CH', 'CY', 'CZ', 'DE', 'DK',
  'EE', 'ES', 'FI', 'FO', 'FR', 'GB', 'GG', 'GI', 'GR', 'HR', 'HU', 'IE', 'IM',
  'IS', 'IT', 'JE', 'LI', 'LT', 'LU', 'LV', 'MC', 'MD', 'ME', 'MK', 'MT', 'NL',
  'NO', 'PL', 'PT', 'RO', 'RS', 'RU', 'SE', 'SI', 'SJ', 'SK', 'SM', 'UA', 'VA',
  'XK',
])

export function getCountryGeographicRange(iso2: string): GeographicRangeId {
  const code = iso2.toUpperCase()
  if (LIMITROFES.has(code)) return 'LIMITROFES'
  if (RESTO_SUDAMERICA.has(code)) return 'RESTO_SUDAMERICA'
  if (RESTO_AMERICA.has(code)) return 'RESTO_AMERICA'
  if (EUROPA.has(code)) return 'EUROPA'
  return 'RESTO_MUNDO'
}

export function getCountryGeographicRangeLabel(iso2: string): string {
  return GEOGRAPHIC_RANGE_LABELS[getCountryGeographicRange(iso2)]
}
