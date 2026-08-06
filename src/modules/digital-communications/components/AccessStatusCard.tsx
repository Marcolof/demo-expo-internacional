import { formatDate } from '@/shared/lib/formatDate'
import { Badge } from '@/shared/ui/Badge'
import type { BadgeTone } from '@/shared/ui/Badge'
import type {
  DigitalCommunicationsAccess,
  ServiceAccessStatus,
} from '../types/digitalCommunications.types'
import { ACCESS_STATUS_LABELS } from '../types/digitalCommunications.types'
import styles from './AccessStatusCard.module.css'

export interface AccessStatusCardProps {
  readonly access: DigitalCommunicationsAccess
}

/** Tono del badge por estado. Decisión de presentación, no del dominio. */
const STATUS_TONE: Record<ServiceAccessStatus, BadgeTone> = {
  HABILITADO: 'success',
  PENDIENTE_DE_ALTA: 'warning',
  NO_HABILITADO: 'neutral',
  SUSPENDIDO: 'danger',
}

/** Ficha con el estado del alta de la cuenta en el servicio. */
export function AccessStatusCard({ access }: AccessStatusCardProps) {
  return (
    <section className={styles.card} aria-labelledby="access-status-title">
      <header className={styles.header}>
        <h2 id="access-status-title" className={styles.title}>
          Estado del servicio
        </h2>
        <Badge tone={STATUS_TONE[access.status]}>{ACCESS_STATUS_LABELS[access.status]}</Badge>
      </header>

      <dl className={styles.dates}>
        <div className={styles.item}>
          <dt className={styles.label}>Solicitud de alta</dt>
          <dd className={styles.value}>
            {access.requestedAt !== undefined ? formatDate(access.requestedAt) : 'Sin solicitar'}
          </dd>
        </div>

        <div className={styles.item}>
          <dt className={styles.label}>Habilitación</dt>
          <dd className={styles.value}>
            {access.enabledAt !== undefined ? formatDate(access.enabledAt) : 'Pendiente'}
          </dd>
        </div>
      </dl>

      {access.reason !== undefined && access.reason !== '' && (
        <p className={styles.reason}>{access.reason}</p>
      )}
    </section>
  )
}
