/**
 * Datos de demostración de "Mi Cuenta".
 *
 * Todo es ficticio pero verosímil (domicilios de Córdoba, CABA y Rosario). Los
 * escenarios de `scenarios/account.scenarios.ts` se arman combinando estas
 * constantes: acá no hay ninguna variante de caso de uso.
 */

import { PERMISSIONS, ROLE_PERMISSIONS } from '@/core/auth/permissions'
import type { Permission } from '@/core/auth/permissions'
import { ROLE_LABELS, ROLES } from '@/core/auth/roles'
import type { Provincia, SelectOption } from '@/core/types/common'
import type { AccountProfile, AccountUser, Address } from '../types/account.types'

/**
 * Provincias tal como las expone el HTML de referencia: el `value` del original
 * es una letra, pero los domicilios guardan el NOMBRE, así que las opciones del
 * `Select` usan el nombre como valor. El código se conserva porque es el que
 * viaja al backend real.
 */
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

/** Opciones del desplegable de provincia. */
export const PROVINCE_OPTIONS: readonly SelectOption[] = PROVINCIAS.map((provincia) => ({
  value: provincia.name,
  label: provincia.name,
}))

/** Opciones del desplegable de rol del formulario de usuario. */
export const ROLE_OPTIONS: readonly SelectOption[] = ROLES.map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}))

/**
 * Permisos que el titular puede otorgar de a uno, por encima del preset del rol.
 *
 * No se listan los 15: `ACCOUNT_VIEW` y `ACCOUNT_EDIT` no se delegan y
 * `SHIPMENT_CREATE` / `SHIPMENT_EDIT` ya vienen con cualquier rol operativo.
 */
export const ASSIGNABLE_PERMISSIONS: readonly Permission[] = [
  'ADDRESS_CREATE',
  'ADDRESS_EDIT',
  'ADDRESS_DELETE',
  'SHIPMENT_PAY',
  'SHIPMENT_CANCEL',
  'SHIPMENT_RESCUE',
  'BALANCE_TOP_UP',
  'RECEIPTS_VIEW',
  'DIGITAL_COMMUNICATIONS_ACCESS',
]

export const MOCK_PROFILE: AccountProfile = {
  id: 'acc-001',
  firstName: 'Marco',
  lastName: 'Loforte',
  email: 'marco.loforte@ejemplo.com.ar',
  phone: '+54 9 351 512-3456',
  cuit: '30-71234567-1',
  businessName: 'Loforte Encomiendas SRL',
  accountType: 'EMPRESA',
  arcaEnabledForExport: true,
}

export const MOCK_ADDRESSES: readonly Address[] = [
  {
    id: 'dom-001',
    alias: 'Depósito Córdoba',
    street: 'Benjamín Matienzo',
    number: '5548',
    floor: '2',
    apartment: 'B',
    city: 'Córdoba',
    province: 'CORDOBA',
    postalCode: '5008',
    observations: 'Entregar en recepción. Portón sobre calle lateral.',
    isFavorite: false,
  },
  {
    id: 'dom-002',
    alias: 'Casa',
    street: 'Av. Rafael Núñez',
    number: '4650',
    city: 'Córdoba',
    province: 'CORDOBA',
    postalCode: '5009',
    isFavorite: false,
  },
  {
    id: 'dom-003',
    alias: 'Oficina Buenos Aires',
    street: 'Av. Corrientes',
    number: '1386',
    floor: '7',
    apartment: 'A',
    city: 'Ciudad Autónoma de Buenos Aires',
    province: 'CAPITAL FEDERAL',
    postalCode: '1043',
    observations: 'Recepción abierta de 9 a 18.',
    isFavorite: false,
  },
  {
    id: 'dom-004',
    alias: 'Sucursal Rosario',
    street: 'Córdoba',
    number: '1147',
    city: 'Rosario',
    province: 'SANTA FE',
    postalCode: '2000',
    isFavorite: false,
  },
]

export const MOCK_USERS: readonly AccountUser[] = [
  {
    id: 'usr-001',
    firstName: 'Marco',
    lastName: 'Loforte',
    email: 'marco.loforte@ejemplo.com.ar',
    role: 'ACCOUNT_OWNER',
    permissions: PERMISSIONS,
    isOwner: true,
    createdAt: '2024-03-11',
  },
  {
    id: 'usr-002',
    firstName: 'Carla',
    lastName: 'Giménez',
    email: 'carla.gimenez@ejemplo.com.ar',
    role: 'OPERATOR_WITH_PAYMENT',
    permissions: ROLE_PERMISSIONS.OPERATOR_WITH_PAYMENT,
    isOwner: false,
    createdAt: '2025-02-04',
  },
  {
    id: 'usr-003',
    firstName: 'Diego',
    lastName: 'Ferreyra',
    email: 'diego.ferreyra@ejemplo.com.ar',
    role: 'OPERATOR_WITHOUT_PAYMENT',
    permissions: [...ROLE_PERMISSIONS.OPERATOR_WITHOUT_PAYMENT, 'RECEIPTS_VIEW'],
    isOwner: false,
    createdAt: '2025-06-18',
  },
  {
    id: 'usr-004',
    firstName: 'Lucía',
    lastName: 'Sosa',
    email: 'lucia.sosa@ejemplo.com.ar',
    role: 'READ_ONLY',
    permissions: ROLE_PERMISSIONS.READ_ONLY,
    isOwner: false,
    createdAt: '2026-01-22',
  },
]

/** Marca un domicilio como favorito y desmarca el resto: sólo puede haber uno. */
export function withFavoriteAddress(
  addresses: readonly Address[],
  favoriteId: string,
): readonly Address[] {
  return addresses.map((address) => ({ ...address, isFavorite: address.id === favoriteId }))
}
