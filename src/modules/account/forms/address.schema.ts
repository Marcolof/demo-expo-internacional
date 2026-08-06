/**
 * Esquema del formulario de domicilio.
 *
 * Los valores son SIEMPRE strings: es lo que devuelve un `<input>`. La
 * conversión al tipo `Address` la hace quien guarda, no el formulario.
 */

import {
  firstError,
  isArgentinePostalCode,
  maxLength,
  required,
} from '@/shared/lib/validators'

export interface AddressFormValues {
  readonly alias: string
  readonly street: string
  readonly number: string
  readonly floor: string
  readonly apartment: string
  readonly city: string
  readonly province: string
  readonly postalCode: string
  readonly observations: string
}

export type AddressFormErrors = Partial<Record<keyof AddressFormValues, string>>

/** Largos máximos, alineados con los `maxlength` del HTML de referencia. */
const MAX_ALIAS = 40
const MAX_STREET = 60
const MAX_OBSERVATIONS = 200

export function validateAddress(values: AddressFormValues): AddressFormErrors {
  const errors: AddressFormErrors = {}

  const checks: Readonly<Record<keyof AddressFormValues, string | null>> = {
    alias: firstError(required(values.alias), maxLength(values.alias, MAX_ALIAS)),
    street: firstError(required(values.street), maxLength(values.street, MAX_STREET)),
    number: required(values.number),
    floor: null,
    apartment: null,
    city: required(values.city),
    province: required(values.province),
    postalCode: firstError(
      required(values.postalCode),
      isArgentinePostalCode(values.postalCode),
    ),
    observations: maxLength(values.observations, MAX_OBSERVATIONS),
  }

  for (const [field, error] of Object.entries(checks)) {
    if (error !== null) {
      errors[field as keyof AddressFormValues] = error
    }
  }

  return errors
}

/** ¿El formulario está limpio? Evita repetir `Object.keys(...).length === 0`. */
export function isAddressFormValid(errors: AddressFormErrors): boolean {
  return Object.keys(errors).length === 0
}
