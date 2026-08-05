import { Navigate, Route, Routes } from 'react-router-dom'
import { InternationalShipmentPage, NewShipmentPage } from '@/modules/shipments'
import { AppShell } from './AppShell'

/**
 * Maqueta visual:
 *   `/`              → alta de envío nacional (réplica de `/envioCla`).
 *   `/internacional` → alta de envío internacional (paso Declaración).
 * Cualquier otra URL vuelve al alta nacional.
 */
export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<NewShipmentPage />} />
        <Route path="internacional" element={<InternationalShipmentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
