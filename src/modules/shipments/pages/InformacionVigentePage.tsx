import { useEffect } from 'react'
import { INFO_VIGENTE_URL } from '../constants/summary-detail.constants'

/** Destino de los enlaces «clic aquí» del modal de información. */
export function InformacionVigentePage() {
  useEffect(() => {
    window.location.assign(INFO_VIGENTE_URL)
  }, [])

  return (
    <p>
      Redirigiendo a{' '}
      <a href={INFO_VIGENTE_URL} rel="noreferrer">
        información vigente
      </a>
      …
    </p>
  )
}
