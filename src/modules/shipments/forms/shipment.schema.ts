/**
 * Valores y validaciones del alta de envío nacional.
 *
 * Los nombres de campo son la traducción de los ids del HTML de referencia
 * (`inputOrigen`, `dirOrigen`, `nars2`, `cpCpa`…). Se documenta la
 * correspondencia para que quede rastreable contra la pantalla original.
 *
 * Los límites físicos salen de los inputs ocultos de la página de referencia:
 * `maximo_largo` / `maximo_ancho` / `maximo_altura` = 200 cm,
 * `maximo_laa` = 300 cm (suma de los tres lados) y
 * `pesoMaximoPermitido` = 50 kg.
 */

import {
  firstError,
  isArgentinePostalCode,
  isEmail,
  isNumeric,
  isPositiveNumber,
  required,
} from '@/shared/lib/validators'
import type { DeliveryKind, NationalProduct, OriginKind } from '../types/shipment.types'

export const MAX_SIDE_CM = 200
export const MAX_SUM_OF_SIDES_CM = 300
export const MAX_WEIGHT_KG = 50

export interface NewShipmentFormValues {
  // --- Origen (#origen) ---
  /** `inputOrigen` */
  readonly originName: string
  /** Radios `checkPickUp` / `checkSucursal` */
  readonly originKind: OriginKind
  /** `dirOrigen` — id de la dirección guardada */
  readonly originAddressId: string
  /** `sucursalProvinciaOrigen` */
  readonly originProvinceCode: string
  /** `sucursalOrigen` */
  readonly originBranchCode: string
  /** `recordarSucursalCheckBox` */
  readonly rememberBranch: boolean

  // --- Paquete (#medidasPaquete) ---
  /** `medidasFrecuentes` */
  readonly frequentMeasureId: string
  /** `largo` */
  readonly lengthCm: string
  /** `ancho` */
  readonly widthCm: string
  /** `alto` */
  readonly heightCm: string
  /** `peso` */
  readonly weightKg: string
  /** `valorContenido` */
  readonly declaredValue: string

  // --- Destino (#eDestino) ---
  /** `nroOpcional` */
  readonly orderNumber: string
  /** `tipoEntrega` — vacío = sin elegir */
  readonly deliveryKind: DeliveryKind | ''

  // Entrega en sucursal (#camposEntregaSucursal)
  /** `nars2` */
  readonly branchRecipientName: string
  /** `provincia2` */
  readonly branchProvinceCode: string
  /** `sucursalDestino2` */
  readonly branchDestinationCode: string
  /** `correoElectronico2` */
  readonly branchEmail: string
  /** `codAreaPaqSuc` */
  readonly branchAreaCode: string
  /** `celularPaqSuc` */
  readonly branchMobile: string

  // Entrega en domicilio (#camposEntregaDomicilio)
  /** `nars` */
  readonly homeRecipientName: string
  /** `provincia` */
  readonly homeProvinceCode: string
  /** `localidad` */
  readonly homeCity: string
  /** `direCompleta` */
  readonly homeAddress: string
  /** `cpCpa` */
  readonly homePostalCode: string
  /** `correoElectronico` */
  readonly homeEmail: string
  /** `codAreaPaqDom` */
  readonly homeAreaCode: string
  /** `celularPaqDom` */
  readonly homeMobile: string
  /** `observaciones` */
  readonly homeObservations: string

  // --- Producto (#tipoProduc) ---
  readonly product: NationalProduct | ''
}

export type NewShipmentErrors = Partial<Record<keyof NewShipmentFormValues, string>>

/** Pasos del alta, en el orden obligatorio del original. */
export type ShipmentStep = 'ORIGEN' | 'PAQUETE' | 'DESTINO'

export const SHIPMENT_STEPS: readonly ShipmentStep[] = ['ORIGEN', 'PAQUETE', 'DESTINO']

export const SHIPMENT_STEP_LABELS: Record<ShipmentStep, string> = {
  ORIGEN: 'Origen',
  PAQUETE: 'Paquete',
  DESTINO: 'Destino',
}

/** Valida el paso Origen. */
export function validateOrigen(values: NewShipmentFormValues): NewShipmentErrors {
  const errors: NewShipmentErrors = {}

  const nameError = required(values.originName)
  if (nameError !== null) errors.originName = nameError

  if (values.originKind === 'PICKUP') {
    if (values.originAddressId === '' || values.originAddressId === '-1') {
      errors.originAddressId = '* Campo obligatorio'
    }
  } else {
    if (values.originProvinceCode === '' || values.originProvinceCode === '-1') {
      errors.originProvinceCode = '* Campo obligatorio'
    }
    if (values.originBranchCode === '' || values.originBranchCode === '-1') {
      errors.originBranchCode = '* Campo obligatorio'
    }
  }

  return errors
}

/** Valida el paso Paquete, incluidos los máximos físicos. */
export function validatePaquete(values: NewShipmentFormValues): NewShipmentErrors {
  const errors: NewShipmentErrors = {}

  const sides: readonly (readonly [keyof NewShipmentFormValues, string, string])[] = [
    ['lengthCm', values.lengthCm, 'largo'],
    ['widthCm', values.widthCm, 'ancho'],
    ['heightCm', values.heightCm, 'alto'],
  ]

  for (const [field, value, label] of sides) {
    const error = firstError(required(value), isPositiveNumber(value, false))
    if (error !== null) {
      errors[field] = error
      continue
    }
    if (Number(value.replace(',', '.')) > MAX_SIDE_CM) {
      errors[field] = `El ${label} no puede superar los ${MAX_SIDE_CM} cm.`
    }
  }

  // La suma de los tres lados también tiene tope. Se marca en el largo para no
  // repetir el mismo mensaje tres veces.
  const sum =
    Number(values.lengthCm.replace(',', '.') || 0) +
    Number(values.widthCm.replace(',', '.') || 0) +
    Number(values.heightCm.replace(',', '.') || 0)

  if (errors.lengthCm === undefined && sum > MAX_SUM_OF_SIDES_CM) {
    errors.lengthCm = `La suma de largo, ancho y alto no puede superar los ${MAX_SUM_OF_SIDES_CM} cm.`
  }

  const weightError = firstError(required(values.weightKg), isPositiveNumber(values.weightKg, false))
  if (weightError !== null) {
    errors.weightKg = weightError
  } else if (Number(values.weightKg.replace(',', '.')) > MAX_WEIGHT_KG) {
    errors.weightKg = `El peso no puede superar los ${MAX_WEIGHT_KG} kg.`
  }

  const valueError = firstError(
    required(values.declaredValue),
    isPositiveNumber(values.declaredValue, false),
  )
  if (valueError !== null) errors.declaredValue = valueError

  return errors
}

/** Valida el paso Destino, según la modalidad de entrega elegida. */
export function validateDestino(values: NewShipmentFormValues): NewShipmentErrors {
  const errors: NewShipmentErrors = {}

  if (values.deliveryKind === '') {
    errors.deliveryKind = '* Campo obligatorio'
    // Sin modalidad no tiene sentido validar el resto.
    return errors
  }

  if (values.deliveryKind === 'SUCURSAL') {
    const nameError = required(values.branchRecipientName)
    if (nameError !== null) errors.branchRecipientName = nameError

    if (values.branchProvinceCode === '' || values.branchProvinceCode === '-1') {
      errors.branchProvinceCode = '* Campo obligatorio'
    }
    if (values.branchDestinationCode === '' || values.branchDestinationCode === '-1') {
      errors.branchDestinationCode = '* Campo obligatorio'
    }

    const emailError = firstError(required(values.branchEmail), isEmail(values.branchEmail))
    if (emailError !== null) errors.branchEmail = emailError

    const areaError = firstError(required(values.branchAreaCode), isNumeric(values.branchAreaCode))
    if (areaError !== null) errors.branchAreaCode = areaError

    const mobileError = firstError(required(values.branchMobile), isNumeric(values.branchMobile))
    if (mobileError !== null) errors.branchMobile = mobileError

    return errors
  }

  const nameError = required(values.homeRecipientName)
  if (nameError !== null) errors.homeRecipientName = nameError

  if (values.homeProvinceCode === '' || values.homeProvinceCode === '-1') {
    errors.homeProvinceCode = '* Campo obligatorio'
  }

  const cityError = required(values.homeCity)
  if (cityError !== null) errors.homeCity = cityError

  const addressError = required(values.homeAddress)
  if (addressError !== null) errors.homeAddress = addressError

  const postalError = firstError(
    required(values.homePostalCode),
    isArgentinePostalCode(values.homePostalCode),
  )
  if (postalError !== null) errors.homePostalCode = postalError

  const emailError = firstError(required(values.homeEmail), isEmail(values.homeEmail))
  if (emailError !== null) errors.homeEmail = emailError

  const areaError = firstError(required(values.homeAreaCode), isNumeric(values.homeAreaCode))
  if (areaError !== null) errors.homeAreaCode = areaError

  const mobileError = firstError(required(values.homeMobile), isNumeric(values.homeMobile))
  if (mobileError !== null) errors.homeMobile = mobileError

  return errors
}

/** Valida un paso puntual. */
export function validateStep(
  step: ShipmentStep,
  values: NewShipmentFormValues,
): NewShipmentErrors {
  switch (step) {
    case 'ORIGEN':
      return validateOrigen(values)
    case 'PAQUETE':
      return validatePaquete(values)
    case 'DESTINO':
      return validateDestino(values)
  }
}

/** ¿El paso está completo? Se usa para habilitar "Siguiente" y el pago. */
export function isStepValid(step: ShipmentStep, values: NewShipmentFormValues): boolean {
  return Object.keys(validateStep(step, values)).length === 0
}
