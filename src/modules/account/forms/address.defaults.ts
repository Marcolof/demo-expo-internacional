/** Valores iniciales del formulario de domicilio. */

import type { Address } from '../types/account.types'
import type { AddressFormValues } from './address.schema'

export const EMPTY_ADDRESS_FORM: AddressFormValues = {
  alias: '',
  street: '',
  number: '',
  floor: '',
  apartment: '',
  city: '',
  province: '',
  postalCode: '',
  observations: '',
}

/** Lleva un `Address` al formulario. Los opcionales ausentes viajan como `''`. */
export function addressToForm(address: Address): AddressFormValues {
  return {
    alias: address.alias,
    street: address.street,
    number: address.number,
    floor: address.floor ?? '',
    apartment: address.apartment ?? '',
    city: address.city,
    province: address.province,
    postalCode: address.postalCode,
    observations: address.observations ?? '',
  }
}

/**
 * Cambia un campo del formulario.
 *
 * Se copia a un objeto mutable en vez de usar `{ ...values, [field]: value }`:
 * con una clave de tipo unión, el spread con propiedad computada ensancha el
 * tipo y deja de coincidir con `AddressFormValues`.
 */
export function applyAddressField(
  values: AddressFormValues,
  field: keyof AddressFormValues,
  value: string,
): AddressFormValues {
  const next: { -readonly [K in keyof AddressFormValues]: string } = { ...values }
  next[field] = value
  return next
}

/**
 * Vuelta del formulario al dominio. Los campos vacíos se omiten en vez de
 * guardarse como `''`, para que `formatAddress` no arme comas de más.
 */
export function formToAddress(
  values: AddressFormValues,
  base: { readonly id: string; readonly isFavorite: boolean },
): Address {
  const optional = (value: string): string | undefined =>
    value.trim() === '' ? undefined : value.trim()

  return {
    id: base.id,
    isFavorite: base.isFavorite,
    alias: values.alias.trim(),
    street: values.street.trim(),
    number: values.number.trim(),
    floor: optional(values.floor),
    apartment: optional(values.apartment),
    city: values.city.trim(),
    province: values.province,
    postalCode: values.postalCode.trim(),
    observations: optional(values.observations),
  }
}
