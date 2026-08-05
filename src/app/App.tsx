import { BrowserRouter } from 'react-router-dom'
import { AppProviders } from './providers'
import { AppRouter } from './router'

/**
 * Raíz de la maqueta visual (réplica de `/envioCla`).
 */
export function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </BrowserRouter>
  )
}
