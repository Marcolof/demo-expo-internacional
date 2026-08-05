/**
 * Escenarios de Mis Comunicaciones Digitales.
 *
 * Los cuatro estados del alta del servicio, más el caso de un usuario sin el
 * permiso: son justamente las pantallas que hay que mostrarle a Desarrollo.
 */

import type { ScenarioRegistry } from '@/core/session/activeScenario'
import {
  digitalCommunicationsMock,
  enabledAccessMock,
  notEnabledAccessMock,
  pendingAccessMock,
  suspendedAccessMock,
} from '../mocks/digitalCommunications.mocks'
import type {
  DigitalCommunication,
  DigitalCommunicationsAccess,
} from '../types/digitalCommunications.types'

export interface DigitalCommunicationsScenarioData {
  readonly access: DigitalCommunicationsAccess
  readonly communications: readonly DigitalCommunication[]
}

export const digitalCommunicationsScenarios: ScenarioRegistry<DigitalCommunicationsScenarioData> = {
  default: {
    id: 'default',
    label: 'Servicio habilitado',
    description:
      'Cuenta dada de alta en el servicio, con comunicaciones enviadas en distintos estados. Es el estado de referencia del módulo.',
    data: {
      access: enabledAccessMock,
      communications: digitalCommunicationsMock,
    },
  },

  'no-access': {
    id: 'no-access',
    label: 'Sin acceso al servicio',
    description:
      'Cuenta sin el servicio habilitado y usuario sin el permiso: muestra la pantalla de servicio no disponible.',
    data: {
      access: notEnabledAccessMock,
      communications: [],
    },
    session: {
      permissionOverrides: { DIGITAL_COMMUNICATIONS_ACCESS: false },
    },
  },

  'pending-activation': {
    id: 'pending-activation',
    label: 'Alta en trámite',
    description:
      'La solicitud de alta está pendiente de aprobación: el usuario ve el motivo y no se le ofrece volver a solicitarla.',
    data: {
      access: pendingAccessMock,
      communications: [],
    },
  },

  suspended: {
    id: 'suspended',
    label: 'Servicio suspendido',
    description:
      'Cuenta que tuvo el servicio habilitado y hoy está suspendida: se la deriva a su ejecutivo comercial.',
    data: {
      access: suspendedAccessMock,
      communications: digitalCommunicationsMock,
    },
  },
}
