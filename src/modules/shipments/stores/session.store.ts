/**
 * Store de sesión en memoria (module-level).
 * Persiste mientras el tab del navegador esté abierto — sin DB, sin
 * sessionStorage, sin serialización.
 *
 * Excepción (revisión 3): favoritos de Origen viven en
 * `origin-favorites.store.ts` (localStorage) para sobrevivir sesiones.
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
  readonly estado: 'Validado' | 'Pendiente' | 'En camino' | 'En preparación'
  /** Si true, el pago debe pasar por Factura E. */
  readonly commercial?: boolean
  readonly paid?: boolean
  readonly fecha?: string
  readonly seguimiento?: string
  readonly direccion?: string
}

export interface PaidShipmentPatch {
  readonly fecha: string
  readonly seguimiento: string
  readonly direccion: string
}

let _shipments: readonly SessionShipment[] = []

function withPaidFields(s: SessionShipment, patch: PaidShipmentPatch): SessionShipment {
  return { ...s, paid: true, estado: 'En preparación', ...patch }
}

export const shipmentsStore = {
  get: (): readonly SessionShipment[] => _shipments,
  add: (s: SessionShipment): void => { _shipments = [s, ..._shipments] },
  markPaid: (nOrden: string, patch: PaidShipmentPatch): void => {
    let matched = false
    if (nOrden !== '') {
      _shipments = _shipments.map((item) => {
        if (matched || item.paid === true || item.nOrden !== nOrden) return item
        matched = true
        return withPaidFields(item, patch)
      })
    }
    if (matched) return
    const firstUnpaid = _shipments.findIndex((item) => item.paid !== true)
    if (firstUnpaid === -1) return
    _shipments = _shipments.map((item, index) =>
      index === firstUnpaid ? withPaidFields(item, patch) : item,
    )
  },
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
  /** Nombre libre del paso Origen; si vacío, el resumen usa el Remitente. */
  readonly origenDisplayName: string
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
  /** Si true, asiste el usuario; si false, designa representante. */
  readonly asistireYo: boolean
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

function formatPaidDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}

/** Pasa el envío del wizard de Pendientes a Pagados (demo). */
export function markWizardShipmentPaid(): void {
  const snap = wizardStore.get()
  const direccion =
    snap?.destinoAddressLines.find((line) => line.trim() !== '')?.trim() ?? '—'
  shipmentsStore.markPaid(snap?.destinoOrderNum.trim() ?? '', {
    fecha: formatPaidDate(new Date()),
    seguimiento: `00005512558336W${String(Date.now()).slice(-7)}`,
    direccion,
  })
}
