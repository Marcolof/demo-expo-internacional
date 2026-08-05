/**
 * Tipos del dominio "Mi Cuenta".
 *
 * Sólo lo que pertenece a este módulo: el perfil de la cuenta, los domicilios
 * guardados y los subusuarios. Lo transversal vive en `core/types/common`.
 */

import type { Permission } from '@/core/auth/permissions'
import type { Role } from '@/core/auth/roles'
import type { Id, IsoDate } from '@/core/types/common'

/** Tipo de cuenta. Define si la facturación va a nombre de una persona o de una empresa. */
export type AccountType = 'CONSUMIDOR_FINAL' | 'EMPRESA'

export interface AccountProfile {
  readonly id: Id
  readonly firstName: string
  readonly lastName: string
  readonly email: string
  readonly phone: string
  readonly cuit: string
  readonly businessName: string
  readonly accountType: AccountType
  /** CUIT habilitado para envíos al exterior en ARCA. */
  readonly arcaEnabledForExport: boolean
}

export interface Address {
  readonly id: Id
  readonly alias: string
  readonly street: string
  readonly number: string
  readonly floor?: string
  readonly apartment?: string
  readonly city: string
  readonly province: string
  readonly postalCode: string
  readonly observations?: string
  readonly isFavorite: boolean
}

export interface AccountUser {
  readonly id: Id
  readonly firstName: string
  readonly lastName: string
  readonly email: string
  readonly role: Role
  readonly permissions: readonly Permission[]
  readonly isOwner: boolean
  readonly createdAt: IsoDate
}

/** Nombre visible del tipo de cuenta. */
export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CONSUMIDOR_FINAL: 'Consumidor final',
  EMPRESA: 'Empresa',
}

/** Nombre completo del titular, para el encabezado del perfil. */
export function profileFullName(profile: AccountProfile): string {
  return `${profile.firstName} ${profile.lastName}`
}

/** Nombre completo de un subusuario, para la grilla y los modales. */
export function accountUserFullName(user: AccountUser): string {
  return `${user.firstName} ${user.lastName}`
}

/**
 * Domicilio en una línea, como lo muestran las tarjetas y el resumen del envío.
 *
 * Los tramos ausentes se omiten en vez de dejar comas vacías, así un domicilio
 * sin piso ni departamento no se ve roto:
 * `"Benjamín Matienzo 5548, Piso 2 Dpto B, Córdoba, CORDOBA (5008)"`
 */
export function formatAddress(address: Address): string {
  const unit = [
    address.floor !== undefined && address.floor !== '' ? `Piso ${address.floor}` : null,
    address.apartment !== undefined && address.apartment !== ''
      ? `Dpto ${address.apartment}`
      : null,
  ]
    .filter((part): part is string => part !== null)
    .join(' ')

  const parts = [
    `${address.street} ${address.number}`.trim(),
    unit === '' ? null : unit,
    address.city === '' ? null : address.city,
    address.postalCode === ''
      ? address.province
      : `${address.province} (${address.postalCode})`,
  ]

  return parts.filter((part): part is string => part !== null && part !== '').join(', ')
}
