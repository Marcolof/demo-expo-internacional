import { COUNTRIES } from '@/shared/lib/countries'
import { ADUANA_WITHOUT_REPRESENTATION_COST_ARS } from '../constants/summary-detail.constants'
import type { WizardSnapshot } from '../stores/session.store'
import { articleTotalPriceUsd } from '../types/article.types'
import { POSTAL_SERVICE_LABELS, type InternationalService } from '../types/shipment.types'

export interface IntlCheckoutState {
  readonly service: string
  readonly servicePriceArs: number
  readonly serviceLabel: string
  readonly totalValueUsd: number
  readonly packageWeightKg: number
  readonly lengthCm: number
  readonly widthCm: number
  readonly heightCm: number
  readonly originLabel: string
  readonly destinationLabel: string
  readonly orderNumber?: string
  readonly representationCostArs?: number
  readonly commercial?: boolean
}

const WIZARD_SERVICE_PRICES_ARS: Record<
  Exclude<WizardSnapshot['shippingService'], null>,
  number
> = {
  EMS: 15000,
  ENCOMIENDA: 10000,
  PEQUENO_PAQUETE: 7500,
  EMS_DOCUMENTACION: 8000,
}

const WIZARD_SERVICE_TO_POSTAL: Record<
  Exclude<WizardSnapshot['shippingService'], null>,
  InternationalService
> = {
  EMS: 'EMS_PAQUETERIA',
  ENCOMIENDA: 'ENCOMIENDA_INTERNACIONAL',
  PEQUENO_PAQUETE: 'PEQUENO_PAQUETE',
  EMS_DOCUMENTACION: 'EMS_DOCUMENTACION',
}

export function buildIntlCheckoutStateFromWizard(
  snap: WizardSnapshot | null,
): IntlCheckoutState | undefined {
  if (snap === null) return undefined

  const serviceKey = snap.shippingService ?? 'EMS'
  const postal = WIZARD_SERVICE_TO_POSTAL[serviceKey]
  const countryLabel = COUNTRIES.find((country) => country.value === snap.country)?.label
  const totalValueUsd = snap.articles.reduce((sum, article) => sum + articleTotalPriceUsd(article), 0)

  return {
    service: postal,
    servicePriceArs: WIZARD_SERVICE_PRICES_ARS[serviceKey],
    serviceLabel: POSTAL_SERVICE_LABELS[postal],
    totalValueUsd,
    packageWeightKg: Number(snap.packageWeightKg) || 0,
    lengthCm: Number(snap.lengthCm) || 0,
    widthCm: Number(snap.widthCm) || 0,
    heightCm: Number(snap.heightCm) || 0,
    originLabel: snap.origenDisplayName || 'Correo Argentino',
    destinationLabel: [snap.destinoCity, countryLabel].filter(Boolean).join(', '),
    orderNumber: snap.destinoOrderNum || undefined,
    representationCostArs:
      snap.aduanaRepresentation === false ? ADUANA_WITHOUT_REPRESENTATION_COST_ARS : 0,
    commercial: snap.commercial,
  }
}
