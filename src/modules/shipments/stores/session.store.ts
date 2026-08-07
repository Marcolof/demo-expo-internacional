/**
 * Store de sesión en memoria (module-level).
 * Persiste mientras el tab del navegador esté abierto — sin DB, sin
 * sessionStorage, sin serialización.
 */

/* ── Envíos guardados (Mis Envíos) ───────────────────────────────── */

export interface SessionShipment {
  readonly id: string
  readonly integracion: string
  readonly nOrden: string
  readonly origen: string
  readonly destinatario: string
  readonly destino: string
  readonly detalles: string
  readonly usuario: string
  readonly estado: 'Validado' | 'Pendiente' | 'En camino'
}

let _shipments: readonly SessionShipment[] = []

export const shipmentsStore = {
  get: (): readonly SessionShipment[] => _shipments,
  add: (s: SessionShipment): void => { _shipments = [s, ..._shipments] },
  clear: (): void => { _shipments = [] },
}

/* ── Estado del wizard internacional ─────────────────────────────── */

import type { DeclaredArticle } from '../types/article.types'

export interface WizardSnapshot {
  readonly country: string
  readonly commercial: boolean
  readonly category: string
  readonly declarationAccepted: boolean
  readonly articles: readonly DeclaredArticle[]
  readonly frequentMeasureId: string
  readonly lengthCm: string
  readonly widthCm: string
  readonly heightCm: string
  readonly packageWeightKg: string
  readonly remitenteCuit: string
  readonly province: string
  readonly branchId: string
  readonly recipientName: string
  readonly recipientRazonSocial: string
  readonly recipientPhoneCode: string
  readonly recipientPhone: string
  readonly recipientEmail: string
  readonly recipientTaxId: string
  readonly facturaE: string
  readonly destinoState: string
  readonly destinoCity: string
  readonly destinoPostalCode: string
  readonly destinoAddressLines: readonly string[]
  readonly destinoOrderNum: string
  readonly aduanaRepresentation: boolean
  readonly representanteName: string
  readonly representanteCuil: string
  readonly shippingService: 'EMS' | 'ENCOMIENDA' | 'PEQUENO_PAQUETE' | 'EMS_DOCUMENTACION' | null
  readonly currentStep: string
}

let _wizardSnapshot: WizardSnapshot | null = null

export const wizardStore = {
  get: (): WizardSnapshot | null => _wizardSnapshot,
  save: (snap: WizardSnapshot): void => { _wizardSnapshot = snap },
  clear: (): void => { _wizardSnapshot = null },
}
