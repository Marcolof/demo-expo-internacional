/**
 * Escenarios de "Mi Cuenta".
 *
 * Cada id es el que viaja en `?scenario=`. Los datos salen de `mocks/`: acá sólo
 * se combinan para armar el caso de uso que se quiere mostrar.
 */

import type { ScenarioRegistry } from '@/core/session/activeScenario'
import {
  MOCK_ADDRESSES,
  MOCK_PROFILE,
  MOCK_USERS,
  withFavoriteAddress,
} from '../mocks/account.mocks'
import type { AccountProfile, AccountUser, Address } from '../types/account.types'

export interface AccountScenarioData {
  readonly profile: AccountProfile
  readonly addresses: readonly Address[]
  readonly users: readonly AccountUser[]
}

/** El favorito de la demo es el depósito de Córdoba. */
const ADDRESSES_WITH_FAVORITE: readonly Address[] = withFavoriteAddress(MOCK_ADDRESSES, 'dom-001')

export const accountScenarios: ScenarioRegistry<AccountScenarioData> = {
  default: {
    id: 'default',
    label: 'Cuenta completa',
    description: 'Perfil habilitado en ARCA, cuatro domicilios y cuatro usuarios.',
    data: {
      profile: MOCK_PROFILE,
      addresses: MOCK_ADDRESSES,
      users: MOCK_USERS,
    },
  },

  'favorite-address': {
    id: 'favorite-address',
    label: 'Con domicilio favorito',
    description: 'El depósito de Córdoba está marcado como favorito.',
    data: {
      profile: MOCK_PROFILE,
      addresses: ADDRESSES_WITH_FAVORITE,
      users: MOCK_USERS,
    },
  },

  'cannot-delete-favorite-address': {
    id: 'cannot-delete-favorite-address',
    label: 'No se puede borrar el favorito',
    description:
      'El usuario tiene el permiso de eliminar, pero la regla de negocio bloquea borrar el favorito.',
    data: {
      profile: MOCK_PROFILE,
      addresses: ADDRESSES_WITH_FAVORITE,
      users: MOCK_USERS,
    },
    // Se le PRENDE el permiso a propósito: así queda claro que el bloqueo viene
    // de la regla y no del control de acceso.
    session: { permissionOverrides: { ADDRESS_DELETE: true } },
  },

  'empty-state': {
    id: 'empty-state',
    label: 'Sin domicilios',
    description: 'La cuenta todavía no tiene ningún domicilio guardado.',
    data: {
      profile: MOCK_PROFILE,
      addresses: [],
      users: MOCK_USERS,
    },
  },

  'arca-not-enabled': {
    id: 'arca-not-enabled',
    label: 'CUIT sin ARCA',
    description: 'El CUIT de la cuenta no está habilitado para envíos al exterior en ARCA.',
    data: {
      profile: { ...MOCK_PROFILE, arcaEnabledForExport: false },
      addresses: MOCK_ADDRESSES,
      users: MOCK_USERS,
    },
  },
}
