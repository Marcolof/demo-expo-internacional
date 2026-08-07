import { Input } from '@/shared/ui/Input'
import type { PhoneCountryCodeOption } from '../mocks/shipments.mocks'
import { PhoneCountryCodeSelect } from './PhoneCountryCodeSelect'
import styles from './DestinatarioFields.module.css'

export interface DestinatarioValues {
  readonly fullName: string
  readonly company: string
  readonly phoneCountryCode: string
  readonly phone: string
  readonly email: string
  readonly taxId: string
}

export interface DestinatarioFieldsProps {
  readonly values: DestinatarioValues
  readonly onChange: <K extends keyof DestinatarioValues>(field: K, value: DestinatarioValues[K]) => void
  readonly phoneCountryCodeOptions: readonly PhoneCountryCodeOption[]
}

/**
 * Datos del destinatario, paso Destino (Figma 5589:10467).
 *
 * DECISIÓN DE ARQUITECTURA
 * El orden de campos sigue la referencia visual (Figma), no la lista textual
 * del doc funcional §8.2: ahí "Correo electrónico" va antes que "Código
 * telefónico / Teléfono", pero el diseño los muestra al revés. Se prioriza
 * el diseño — discrepancia registrada en ANALISIS-FUNCIONAL.md §3.1.
 */
export function DestinatarioFields({ values, onChange, phoneCountryCodeOptions }: DestinatarioFieldsProps) {
  return (
    <div className={styles.fields}>
      <div className={styles.row}>
        <Input
          id="recipient-full-name"
          label="Nombre y apellido"
          value={values.fullName}
          onChange={(event) => onChange('fullName', event.currentTarget.value)}
        />
        <Input
          id="recipient-company"
          label="Razón social"
          value={values.company}
          onChange={(event) => onChange('company', event.currentTarget.value)}
        />
      </div>

      <div className={styles.row}>
        <PhoneCountryCodeSelect
          id="recipient-phone-country-code"
          label="Código de país"
          options={phoneCountryCodeOptions}
          value={values.phoneCountryCode}
          onChange={(dialCode) => onChange('phoneCountryCode', dialCode)}
        />
        <Input
          id="recipient-phone"
          label="Número de teléfono"
          hint="Ej.: 30 12345678"
          inputMode="tel"
          value={values.phone}
          onChange={(event) => onChange('phone', event.currentTarget.value)}
        />
      </div>

      <Input
        id="recipient-email"
        label="Correo electrónico"
        type="email"
        value={values.email}
        onChange={(event) => onChange('email', event.currentTarget.value)}
      />

      <Input
        id="recipient-tax-id"
        label="Identificación tributaria del destinatario"
        hint="Ingresá el número fiscal del destinatario"
        value={values.taxId}
        onChange={(event) => onChange('taxId', event.currentTarget.value)}
      />
    </div>
  )
}
