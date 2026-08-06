/**
 * API pública del módulo Mis Comunicaciones Digitales.
 * La maqueta no expone pantallas de este módulo; quedan escenarios y tipos.
 */

export { AccessStatusCard } from './components/AccessStatusCard'
export type { AccessStatusCardProps } from './components/AccessStatusCard'

export { digitalCommunicationsScenarios } from './scenarios/digitalCommunications.scenarios'
export type { DigitalCommunicationsScenarioData } from './scenarios/digitalCommunications.scenarios'

export { canAccessDigitalCommunications } from './rules/canAccessDigitalCommunications'

export type {
  CommunicationState,
  DigitalCommunication,
  DigitalCommunicationsAccess,
  ServiceAccessStatus,
} from './types/digitalCommunications.types'
export {
  ACCESS_STATUS_LABELS,
  COMMUNICATION_STATE_LABELS,
} from './types/digitalCommunications.types'
