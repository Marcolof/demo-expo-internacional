/**
 * Valores iniciales del alta de envío.
 *
 * El HTML de referencia llega con el remitente y la dirección de origen ya
 * cargados (los toma de la cuenta) y con "Pick Up" marcado. Se reproduce ese
 * estado inicial para que la primera pantalla se vea igual que el original.
 */

import type { CurrentUser } from '@/core/auth/currentUser'
import { userFullName } from '@/core/auth/currentUser'
import { SAVED_ORIGIN_ADDRESSES } from '../mocks/shipments.mocks'
import type { NewShipmentFormValues } from './shipment.schema'

export const EMPTY_NEW_SHIPMENT_FORM: NewShipmentFormValues = {
  originName: '',
  originKind: 'PICKUP',
  originAddressId: '',
  originProvinceCode: '',
  originBranchCode: '',
  rememberBranch: false,

  frequentMeasureId: '',
  lengthCm: '',
  widthCm: '',
  heightCm: '',
  weightKg: '',
  declaredValue: '',

  orderNumber: '',
  deliveryKind: '',

  branchRecipientName: '',
  branchProvinceCode: '',
  branchDestinationCode: '',
  branchEmail: '',
  branchAreaCode: '',
  branchMobile: '',

  homeRecipientName: '',
  homeProvinceCode: '',
  homeCity: '',
  homeAddress: '',
  homePostalCode: '',
  homeEmail: '',
  homeAreaCode: '',
  homeMobile: '',
  homeObservations: '',

  product: '',
}

/**
 * Estado inicial real de la pantalla: remitente y primera dirección guardada
 * precargados, igual que hace el original con los datos de la cuenta.
 */
export function initialNewShipmentForm(user: CurrentUser): NewShipmentFormValues {
  const firstAddress = SAVED_ORIGIN_ADDRESSES[0]

  return {
    ...EMPTY_NEW_SHIPMENT_FORM,
    originName: userFullName(user),
    originAddressId: firstAddress?.value ?? '',
  }
}
