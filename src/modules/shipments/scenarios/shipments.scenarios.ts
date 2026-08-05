/**
 * Escenarios navegables del módulo Envíos.
 *
 * Los ids son los que van en la URL: `/mis-envios?scenario=pending-editable`.
 * Para agregar uno nuevo alcanza con sumarlo a este registro — no hay que tocar
 * `core` ni la barra de demo.
 */

import type { ScenarioRegistry } from '@/core/session/activeScenario'
import {
  ALL_SHIPMENTS,
  SHIPMENT_IMPOSED,
  SHIPMENT_INTERNATIONAL_COMMERCIAL,
  SHIPMENT_PAID_PREIMPOSITION,
  SHIPMENT_PENDING_EDITABLE,
} from '../mocks/shipments.mocks'
import type { Shipment } from '../types/shipment.types'

export interface ShipmentsScenarioData {
  readonly shipments: readonly Shipment[]
}

export const shipmentsScenarios: ScenarioRegistry<ShipmentsScenarioData> = {
  default: {
    id: 'default',
    label: 'Listado completo',
    description: 'Todos los envíos de ejemplo, en distintos estados.',
    data: { shipments: ALL_SHIPMENTS },
  },

  'pending-editable': {
    id: 'pending-editable',
    label: 'Pendiente editable',
    description: 'Envío cotizado y sin pagar: se puede modificar, cotizar y pagar.',
    data: { shipments: [SHIPMENT_PENDING_EDITABLE] },
  },

  'paid-preimposition': {
    id: 'paid-preimposition',
    label: 'Pagado, antes de imposición',
    description:
      'Envío pagado que todavía no fue impuesto: se puede rescatar y cancelar, pero no modificar.',
    data: { shipments: [SHIPMENT_PAID_PREIMPOSITION] },
  },

  'imposed-readonly': {
    id: 'imposed-readonly',
    label: 'En imposición (sólo lectura)',
    description:
      'El paquete ya entró a la red postal: no se puede modificar, cancelar ni rescatar.',
    data: { shipments: [SHIPMENT_IMPOSED] },
  },

  'no-permission': {
    id: 'no-permission',
    label: 'Sin permisos sobre el envío',
    description:
      'Mismo envío cotizado, pero el usuario no puede modificarlo, pagarlo ni cancelarlo.',
    data: { shipments: [SHIPMENT_PENDING_EDITABLE] },
    // El envío es editable por estado: el bloqueo viene sólo de los permisos.
    session: {
      permissionOverrides: {
        SHIPMENT_EDIT: false,
        SHIPMENT_PAY: false,
        SHIPMENT_CANCEL: false,
        SHIPMENT_RESCUE: false,
      },
    },
  },

  'empty-shipments': {
    id: 'empty-shipments',
    label: 'Sin envíos',
    description: 'Cuenta sin envíos cargados: muestra el estado vacío.',
    data: { shipments: [] },
  },

  'international-commercial': {
    id: 'international-commercial',
    label: 'Internacional con fines comerciales',
    description:
      'Envío internacional comercial pendiente de cotización, con representación ante Aduana aceptada.',
    data: { shipments: [SHIPMENT_INTERNATIONAL_COMMERCIAL] },
  },
}
