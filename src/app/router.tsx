import { Navigate, Route, Routes } from 'react-router-dom'
import {
  CheckoutPage,
  InternationalBulkShipmentPage,
  InternationalShipmentPage,
  FacturaEPage,
  NewShipmentPage,
  PropuestaMisEnviosPage,
} from '@/modules/shipments'
import { AppShell } from './AppShell'

/**
 * Maqueta visual:
 *   `/`                        → alta de envío nacional (réplica de `/envioCla`).
 *   `/internacional`           → alta de envío internacional, carga individual.
 *   `/internacional/masivo`    → alta de envío internacional, carga masiva (estática).
 *   `/internacional/factura-e` → Factura E (flujo comercial).
 *   `/checkout`                → "Realizá tu pago" de los envíos ya cotizados.
 * Cualquier otra URL vuelve al alta nacional.
 */
export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<NewShipmentPage />} />
        <Route path="internacional" element={<InternationalShipmentPage />} />
        <Route path="internacional/masivo" element={<InternationalBulkShipmentPage />} />
        <Route path="internacional/factura-e" element={<FacturaEPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="propuesta/mis-envios" element={<PropuestaMisEnviosPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
