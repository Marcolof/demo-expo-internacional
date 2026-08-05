import { Badge } from '@/shared/ui/Badge'
import {
  ACCOUNT_TYPE_LABELS,
  profileFullName,
} from '../types/account.types'
import type { AccountProfile } from '../types/account.types'
import styles from './AccountHeader.module.css'

export interface AccountHeaderProps {
  readonly profile: AccountProfile
  /** Muestra la píldora "Sólo lectura" junto al tipo de cuenta. */
  readonly readOnly?: boolean
}

interface ProfileField {
  readonly label: string
  readonly value: string
}

/** Tarjeta de identificación de la cuenta. Es de lectura: no edita nada. */
export function AccountHeader({ profile, readOnly = false }: AccountHeaderProps) {
  const fields: readonly ProfileField[] = [
    { label: 'Razón social', value: profile.businessName },
    { label: 'CUIT', value: profile.cuit },
    { label: 'Correo electrónico', value: profile.email },
    { label: 'Teléfono', value: profile.phone },
    { label: 'Tipo de cuenta', value: ACCOUNT_TYPE_LABELS[profile.accountType] },
    {
      label: 'Envíos al exterior en ARCA',
      value: profile.arcaEnabledForExport ? 'CUIT habilitado' : 'CUIT no habilitado',
    },
  ]

  return (
    <section className={styles.card} aria-label="Datos de la cuenta">
      <header className={styles.head}>
        <span className={styles.avatar} aria-hidden="true">
          {profile.firstName.charAt(0).toUpperCase()}
        </span>

        <div className={styles.identity}>
          <h2 className={styles.name}>{profileFullName(profile)}</h2>
          <div className={styles.badges}>
            <Badge tone="info">{ACCOUNT_TYPE_LABELS[profile.accountType]}</Badge>
            {readOnly && <Badge tone="neutral">Sólo lectura</Badge>}
            {!profile.arcaEnabledForExport && <Badge tone="warning">ARCA pendiente</Badge>}
          </div>
        </div>
      </header>

      <dl className={styles.fields}>
        {fields.map((field) => (
          <div key={field.label} className={styles.field}>
            <dt className={styles.fieldLabel}>{field.label}</dt>
            <dd className={styles.fieldValue}>{field.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
