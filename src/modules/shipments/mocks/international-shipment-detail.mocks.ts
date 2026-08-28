import { COUNTRIES } from '@/shared/lib/countries'
import { formatAmountOnly, formatUsd } from '@/shared/lib/formatCurrency'
import { findBranch, PROVINCE_OPTIONS } from './branches.mocks'
import type { FacturaERow } from './factura-e.mocks'
import type {
  EnvioDetailSource,
  InternationalShipmentDetail,
  ShipmentDetailOrigen,
  ShipmentDetailPaquete,
  ShipmentDetailResumen,
} from '../types/international-shipment-detail.types'
import type { WizardSnapshot } from '../stores/session.store'
import { articleTotalPriceUsd } from '../types/article.types'

const EMPTY = '-'

const SERVICE_LABELS: Record<string, string> = {
  EMS: 'EMS Paquetería',
  ENCOMIENDA: 'Encomienda Internacional',
  PEQUENO_PAQUETE: 'Pequeño Paquete',
  EMS_DOCUMENTACION: 'EMS Documentación',
}

const BRANCH_CONTACT: Readonly<Record<string, { readonly postalCode: string; readonly phone: string }>> = {
  'BA-001': { postalCode: '6500', phone: '02317 42-0000' },
  'BA-002': { postalCode: '1650', phone: '011 4755-0000' },
  'BA-003': { postalCode: '1900', phone: '0221 421-0000' },
  'BA-004': { postalCode: '1878', phone: '011 4253-0000' },
  'CF-001': { postalCode: '1425', phone: '011 4821-0000' },
  'CF-002': { postalCode: '1005', phone: '011 4322-0000' },
  'CF-003': { postalCode: '1426', phone: '011 4783-0000' },
  'CB-001': { postalCode: '5000', phone: '0351 421-0000' },
  'CB-002': { postalCode: '5152', phone: '03541 42-0000' },
  'SF-001': { postalCode: '2000', phone: '0341 424-0000' },
  'SF-002': { postalCode: '3000', phone: '0342 455-0000' },
  'MZ-001': { postalCode: '5500', phone: '0261 423-0000' },
  'TU-001': { postalCode: '4000', phone: '0381 422-0000' },
  'SL-001': { postalCode: '5700', phone: '0266 442-0000' },
  'RN-001': { postalCode: '8400', phone: '0294 442-0000' },
}

function display(value: string | undefined): string {
  const trimmed = value?.trim() ?? ''
  if (trimmed === '' || trimmed === '-1') return EMPTY
  return trimmed
}

function formatCm(raw: string): string {
  const parsed = Number(raw.replace(',', '.'))
  if (!Number.isFinite(parsed) || parsed <= 0) return EMPTY
  return `${formatAmountOnly(parsed)} cm`
}

function formatKg(raw: string): string {
  const parsed = Number(raw.replace(',', '.'))
  if (!Number.isFinite(parsed) || parsed <= 0) return EMPTY
  return `${formatAmountOnly(parsed)} kg`
}

function productTypeFromSnapshot(snap: WizardSnapshot): string {
  if (snap.shippingService === 'EMS_DOCUMENTACION' || snap.category === 'DOCUMENTO') {
    return 'Documento'
  }
  return 'Paquete'
}

export function buildDetailFromWizard(snap: WizardSnapshot): InternationalShipmentDetail {
  const branch = findBranch(snap.branchId)
  const contact = BRANCH_CONTACT[snap.branchId]
  const provinceLabel = PROVINCE_OPTIONS.find((option) => option.value === snap.province)?.label
  const country = COUNTRIES.find((option) => option.value === snap.country)
  const contentUsd = snap.articles.reduce((sum, article) => sum + articleTotalPriceUsd(article), 0)
  const phone = [snap.recipientPhoneCode, snap.recipientPhone].filter((part) => part.trim() !== '').join(' ')

  return {
    origen: {
      branchName: display(branch?.name).toUpperCase(),
      province: display(provinceLabel).toUpperCase(),
      address: display(branch?.address),
      postalCode: display(contact?.postalCode),
      phone: display(contact?.phone),
    },
    destino: {
      recipientName: display(snap.recipientName || snap.recipientRazonSocial),
      phone: display(phone),
      email: display(snap.recipientEmail),
      address: display(snap.destinoAddressLines[0]),
      postalCode: display(snap.destinoPostalCode),
      city: display(snap.destinoCity),
      region: display(snap.destinoState),
      countryLabel: display(country?.label),
      countryIso: snap.country === '-1' ? '' : snap.country,
    },
    paquete: {
      serviceLabel: snap.shippingService === null ? EMPTY : (SERVICE_LABELS[snap.shippingService] ?? snap.shippingService),
      productType: productTypeFromSnapshot(snap),
      parcelCount: '1',
      weightLabel: formatKg(snap.packageWeightKg),
      lengthLabel: formatCm(snap.lengthCm),
      widthLabel: formatCm(snap.widthCm),
      heightLabel: formatCm(snap.heightCm),
      contentValueLabel: contentUsd > 0 ? formatUsd(contentUsd) : EMPTY,
      currency: 'USD',
    },
  }
}

const SEED_DETAILS: Readonly<Record<string, InternationalShipmentDetail>> = {
  'fe-001': {
    origen: {
      branchName: 'BANFIELD',
      province: 'BUENOS AIRES',
      address: 'Av. Hipólito Yrigoyen 1234',
      postalCode: '1828',
      phone: '011 4200-0000',
    },
    destino: {
      recipientName: 'Pampa Grains S.A.',
      phone: '+55 11 3456-7890',
      email: 'ops@pampagrains.com.br',
      address: 'Av. Paulista 1000',
      postalCode: '01310-100',
      city: 'São Paulo',
      region: 'SP',
      countryLabel: 'Brasil',
      countryIso: 'BR',
    },
    paquete: {
      serviceLabel: 'EMS Paquetería',
      productType: 'Paquete',
      parcelCount: '1',
      weightLabel: '4,50 kg',
      lengthLabel: '40,00 cm',
      widthLabel: '30,00 cm',
      heightLabel: '25,00 cm',
      contentValueLabel: 'USD 245,00',
      currency: 'USD',
    },
  },
  'fe-002': {
    origen: {
      branchName: 'PALERMO',
      province: 'CABA',
      address: 'Av. Santa Fe 3150, Palermo',
      postalCode: '1425',
      phone: '011 4821-0000',
    },
    destino: {
      recipientName: 'Latam Supplies SpA',
      phone: '+56 2 2345-6789',
      email: 'logistica@latamsupplies.cl',
      address: 'Av. Providencia 1234',
      postalCode: '7500000',
      city: 'Santiago',
      region: 'Región Metropolitana',
      countryLabel: 'Chile',
      countryIso: 'CL',
    },
    paquete: {
      serviceLabel: 'Encomienda Internacional',
      productType: 'Paquete',
      parcelCount: '1',
      weightLabel: '3,20 kg',
      lengthLabel: '35,00 cm',
      widthLabel: '25,00 cm',
      heightLabel: '20,00 cm',
      contentValueLabel: 'USD 180,00',
      currency: 'USD',
    },
  },
  'fe-003': {
    origen: {
      branchName: 'MICROCENTRO',
      province: 'CABA',
      address: 'Florida 429, San Nicolás',
      postalCode: '1005',
      phone: '011 4322-0000',
    },
    destino: {
      recipientName: 'Andes Dairy Co.',
      phone: '+598 2 901 2345',
      email: 'contacto@andesdairy.uy',
      address: '18 de Julio 1200',
      postalCode: '11100',
      city: 'Montevideo',
      region: '-',
      countryLabel: 'Uruguay',
      countryIso: 'UY',
    },
    paquete: {
      serviceLabel: 'EMS Paquetería',
      productType: 'Paquete',
      parcelCount: '1',
      weightLabel: '5,10 kg',
      lengthLabel: '45,00 cm',
      widthLabel: '30,00 cm',
      heightLabel: '28,00 cm',
      contentValueLabel: 'USD 310,00',
      currency: 'USD',
    },
  },
  'fe-004': {
    origen: {
      branchName: '9 DE JULIO',
      province: 'BUENOS AIRES',
      address: 'Av. BME Mitre 794',
      postalCode: '6500',
      phone: '02317 42-0000',
    },
    destino: {
      recipientName: 'Patagonia Meats Ltd.',
      phone: '+57 1 345 6789',
      email: 'ops@patagoniameats.co',
      address: 'Cra. 7 # 71-21',
      postalCode: '110231',
      city: 'Bogotá',
      region: 'Cundinamarca',
      countryLabel: 'Colombia',
      countryIso: 'CO',
    },
    paquete: {
      serviceLabel: 'Encomienda Internacional',
      productType: 'Paquete',
      parcelCount: '1',
      weightLabel: '6,00 kg',
      lengthLabel: '50,00 cm',
      widthLabel: '35,00 cm',
      heightLabel: '30,00 cm',
      contentValueLabel: 'USD 420,00',
      currency: 'USD',
    },
  },
}

export function resolveFacturaEDetail(
  row: FacturaERow,
  snap: WizardSnapshot | null,
): InternationalShipmentDetail {
  if (row.id === 'fe-current' && snap !== null) {
    return buildDetailFromWizard(snap)
  }
  const seed = SEED_DETAILS[row.id]
  if (seed !== undefined) return seed
  if (snap !== null) return buildDetailFromWizard(snap)
  return {
    origen: {
      branchName: EMPTY,
      province: EMPTY,
      address: EMPTY,
      postalCode: EMPTY,
      phone: EMPTY,
    },
    destino: {
      recipientName: display(row.destinatario),
      phone: EMPTY,
      email: EMPTY,
      address: EMPTY,
      postalCode: EMPTY,
      city: EMPTY,
      region: EMPTY,
      countryLabel: display(row.destino),
      countryIso: '',
    },
    paquete: {
      serviceLabel: EMPTY,
      productType: 'Paquete',
      parcelCount: '1',
      weightLabel: EMPTY,
      lengthLabel: EMPTY,
      widthLabel: EMPTY,
      heightLabel: EMPTY,
      contentValueLabel: formatUsd(row.montoUsd),
      currency: 'USD',
    },
  }
}

export type MisEnviosDetailTab = 'pendientes' | 'pagados'

function resumenFromEnvio(row: EnvioDetailSource, tab: MisEnviosDetailTab): ShipmentDetailResumen {
  switch (tab) {
    case 'pendientes':
      return {
        orderNumber: display(row.nOrden),
        status: display(row.estado),
        extras: [{ label: 'Usuario', value: display(row.usuario) }],
      }
    case 'pagados':
      return {
        orderNumber: display(row.nOrden),
        status: display(row.estado),
        extras: [
          { label: 'Fecha', value: display(row.fecha) },
          { label: 'N° de seguimiento', value: display(row.seguimiento) },
        ],
      }
    default: {
      const _exhaustive: never = tab
      return _exhaustive
    }
  }
}

function originFromEnvio(origen: string): ShipmentDetailOrigen {
  const upper = origen.toUpperCase()
  if (upper.includes('BANFIELD')) {
    return {
      branchName: 'BANFIELD',
      province: 'BUENOS AIRES',
      address: 'Av. Hipólito Yrigoyen 1234',
      postalCode: '1828',
      phone: '011 4200-0000',
    }
  }
  if (upper.includes('RETIRO')) {
    return {
      branchName: 'RETIRO',
      province: 'CABA',
      address: 'Av. Antártida Argentina 1200',
      postalCode: '1104',
      phone: '011 4318-0000',
    }
  }
  if (upper.includes('CABA')) {
    return {
      branchName: 'CABA SUR',
      province: 'CABA',
      address: 'Av. Caseros 3000',
      postalCode: '1264',
      phone: '011 4305-0000',
    }
  }
  if (upper.includes('PICKUP') || upper.includes('PICK UP') || upper.includes('MATIENZO')) {
    const address = origen.replace(/pickup\s*[–-]?\s*/i, '').replace(/[–-]\s*$/, '').trim()
    return {
      branchName: 'PICK UP',
      province: 'CABA',
      address: display(address),
      postalCode: EMPTY,
      phone: EMPTY,
    }
  }
  return {
    branchName: display(origen).toUpperCase(),
    province: EMPTY,
    address: display(origen),
    postalCode: EMPTY,
    phone: EMPTY,
  }
}

function packageFromDetalles(detalles: string, scope: EnvioDetailSource['scope']): ShipmentDetailPaquete {
  const weightMatch = detalles.match(/([\d.,]+)\s*kg/i)
  const dimMatch = detalles.match(/(\d+)\s*x\s*(\d+)\s*x\s*(\d+)/i)
  const weightLabel = weightMatch !== null ? formatKg(weightMatch[1] ?? '') : EMPTY
  const lengthLabel = dimMatch !== null ? formatCm(dimMatch[1] ?? '') : EMPTY
  const widthLabel = dimMatch !== null ? formatCm(dimMatch[2] ?? '') : EMPTY
  const heightLabel = dimMatch !== null ? formatCm(dimMatch[3] ?? '') : EMPTY
  return {
    serviceLabel: scope === 'nacional' ? 'Encomienda' : 'EMS Paquetería',
    productType: 'Paquete',
    parcelCount: '1',
    weightLabel,
    lengthLabel,
    widthLabel,
    heightLabel,
    contentValueLabel: EMPTY,
    currency: scope === 'nacional' ? 'ARS' : 'USD',
  }
}

function buildDetailFromEnvioRow(row: EnvioDetailSource, tab: MisEnviosDetailTab): InternationalShipmentDetail {
  const destinoParts = row.destino.split(/\s*[–-]\s*/)
  const countryPart = destinoParts[0] ?? row.destino
  const cityParts = destinoParts.slice(1)
  const isNational = row.scope === 'nacional'
  const country = isNational
    ? { label: 'Argentina', value: 'AR' }
    : COUNTRIES.find((option) => option.label.toLowerCase() === countryPart.trim().toLowerCase())
  const city = isNational ? display(row.destino) : display(cityParts.join(' - '))

  return {
    resumen: resumenFromEnvio(row, tab),
    origen: originFromEnvio(row.origen),
    destino: {
      recipientName: display(row.destinatario),
      phone: EMPTY,
      email: EMPTY,
      address: display(row.direccion),
      postalCode: EMPTY,
      city,
      region: EMPTY,
      countryLabel: display(country?.label ?? countryPart),
      countryIso: country?.value ?? '',
    },
    paquete: packageFromDetalles(row.detalles, row.scope),
  }
}

function isWizardEnvio(row: EnvioDetailSource, snap: WizardSnapshot): boolean {
  const order = snap.destinoOrderNum.trim()
  return order !== '' && row.nOrden === order
}

export function resolveMisEnviosDetail(
  row: EnvioDetailSource,
  tab: MisEnviosDetailTab,
  snap: WizardSnapshot | null,
): InternationalShipmentDetail {
  if (snap !== null && isWizardEnvio(row, snap)) {
    return { ...buildDetailFromWizard(snap), resumen: resumenFromEnvio(row, tab) }
  }
  return buildDetailFromEnvioRow(row, tab)
}
