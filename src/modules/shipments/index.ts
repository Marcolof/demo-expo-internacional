/**
 * Superficie pública del módulo Envíos.
 *
 * La maqueta sólo expone la pantalla de alta (`NewShipmentPage`).
 */

export { NewShipmentPage } from './pages/NewShipmentPage'
export { InternationalShipmentPage } from './pages/InternationalShipmentPage'
export { InternationalBulkShipmentPage } from './pages/InternationalBulkShipmentPage'
export { FacturaEPage } from './pages/FacturaEPage'
export { CheckoutPage } from './pages/CheckoutPage'
export { PropuestaMisEnviosPage } from './pages/PropuestaMisEnviosPage'

export { shipmentsScenarios } from './scenarios/shipments.scenarios'
export type { ShipmentsScenarioData } from './scenarios/shipments.scenarios'

export {
  POSTAL_SERVICE_DELIVERY_TIMES,
  POSTAL_SERVICE_LABELS,
  SHIPMENT_STATUS_LABELS,
  shipmentDestinationLabel,
  shipmentOriginLabel,
  volumetricWeightKg,
} from './types/shipment.types'
export type {
  DeliveryKind,
  InternationalService,
  NationalProduct,
  OriginKind,
  PackageMeasures,
  PostalService,
  Shipment,
  ShipmentParty,
  ShipmentPurpose,
  ShipmentScope,
  ShipmentStatus,
} from './types/shipment.types'

export { canCancelShipment } from './rules/canCancelShipment'
export { canCreateShipment } from './rules/canCreateShipment'
export { canEditShipment, isEditableStatus } from './rules/canEditShipment'
export { canPayShipment } from './rules/canPayShipment'
export { canRescueShipment } from './rules/canRescueShipment'
export { allowedShipmentActions, shipmentAction, shipmentActions } from './rules/shipmentActions'
export type { ShipmentAction, ShipmentActionId } from './rules/shipmentActions'

export { ShipmentStatusBadge } from './components/ShipmentStatusBadge'
