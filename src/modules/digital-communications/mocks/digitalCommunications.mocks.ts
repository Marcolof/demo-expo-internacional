/**
 * Datos simulados de Mis Comunicaciones Digitales.
 *
 * Hay un `access` por cada estado del servicio: los escenarios sólo eligen cuál
 * inyectar, sin repetir literales.
 */

import type {
  DigitalCommunication,
  DigitalCommunicationsAccess,
} from '../types/digitalCommunications.types'

export const enabledAccessMock: DigitalCommunicationsAccess = {
  status: 'HABILITADO',
  requestedAt: '2026-03-11',
  enabledAt: '2026-03-19',
}

export const notEnabledAccessMock: DigitalCommunicationsAccess = {
  status: 'NO_HABILITADO',
}

export const pendingAccessMock: DigitalCommunicationsAccess = {
  status: 'PENDIENTE_DE_ALTA',
  requestedAt: '2026-07-28',
  reason: 'Estamos validando la documentación respaldatoria de la cuenta.',
}

export const suspendedAccessMock: DigitalCommunicationsAccess = {
  status: 'SUSPENDIDO',
  requestedAt: '2026-03-11',
  enabledAt: '2026-03-19',
  reason: 'Suspendido por falta de pago de la factura del período 06/2026.',
}

/** Comunicaciones enviadas por la cuenta, de la más reciente a la más antigua. */
export const digitalCommunicationsMock: readonly DigitalCommunication[] = [
  {
    id: 'com-009',
    subject: 'Intimación de pago — Expediente 4821/2026',
    recipient: 'Gastón Peralta — CUIT 20-31448702-5',
    sentAt: '2026-08-03T10:12:00-03:00',
    state: 'ENVIADA',
    trackingCode: 'CDG-2026-000912',
  },
  {
    id: 'com-008',
    subject: 'Notificación de baja de servicio — Cliente 88214',
    recipient: 'Mariela Quiroga — CUIT 27-28994115-3',
    sentAt: '2026-08-01T15:40:00-03:00',
    state: 'ENTREGADA',
    trackingCode: 'CDG-2026-000887',
  },
  {
    id: 'com-007',
    subject: 'Traslado de audiencia — Sala 3',
    recipient: 'Estudio Bianchi & Asociados — CUIT 30-71204558-9',
    sentAt: '2026-07-30T09:05:00-03:00',
    state: 'LEIDA',
    trackingCode: 'CDG-2026-000854',
  },
  {
    id: 'com-006',
    subject: 'Aviso de vencimiento de contrato de transporte',
    recipient: 'Logística del Litoral SA — CUIT 30-70998341-2',
    sentAt: '2026-07-27T17:22:00-03:00',
    state: 'LEIDA',
    trackingCode: 'CDG-2026-000801',
  },
  {
    id: 'com-005',
    subject: 'Requerimiento de documentación aduanera',
    recipient: 'Andrés Cabrera — CUIT 20-27551903-7',
    sentAt: '2026-07-24T11:48:00-03:00',
    state: 'RECHAZADA',
    trackingCode: 'CDG-2026-000778',
  },
  {
    id: 'com-004',
    subject: 'Notificación de faltante en encomienda CD1191203AR',
    recipient: 'Comercial Sur SRL — CUIT 30-71455029-4',
    sentAt: '2026-07-21T13:15:00-03:00',
    state: 'ENTREGADA',
    trackingCode: 'CDG-2026-000740',
  },
  {
    id: 'com-003',
    subject: 'Cédula de notificación — Expediente 3990/2026',
    recipient: 'Silvina Rodríguez — CUIT 27-30112884-6',
    sentAt: '2026-07-16T08:30:00-03:00',
    state: 'VENCIDA',
    trackingCode: 'CDG-2026-000695',
  },
  {
    id: 'com-002',
    subject: 'Alta de usuario operador en MiCorreo',
    recipient: 'Diego Ferreyra — CUIT 20-12345678-9',
    sentAt: '2026-07-09T16:02:00-03:00',
    state: 'LEIDA',
    trackingCode: 'CDG-2026-000631',
  },
  {
    id: 'com-001',
    subject: 'Confirmación de alta del servicio de Comunicaciones Digitales',
    recipient: 'Loforte Encomiendas SRL — CUIT 20-12345678-9',
    sentAt: '2026-03-19T10:00:00-03:00',
    state: 'LEIDA',
    trackingCode: 'CDG-2026-000104',
  },
]
