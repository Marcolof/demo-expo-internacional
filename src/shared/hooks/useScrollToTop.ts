import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Al montar / cambiar de ruta, lleva el scroll de la ventana a (0, 0).
 * Evita heredar el scroll de la pantalla anterior (wizard → Factura E / checkout).
 */
export function useScrollToTop(): void {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])
}
