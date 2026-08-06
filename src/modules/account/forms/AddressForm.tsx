import { useId } from 'react'
import { Input, Textarea } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { PROVINCE_OPTIONS } from '../mocks/account.mocks'
import type { AddressFormErrors, AddressFormValues } from './address.schema'
import styles from './AddressForm.module.css'

export interface AddressFormProps {
  readonly values: AddressFormValues
  readonly errors: AddressFormErrors
  readonly onChange: (field: keyof AddressFormValues, value: string) => void
  readonly disabled?: boolean
}

/**
 * Formulario de domicilio, controlado desde afuera.
 *
 * No valida ni guarda: sólo pinta los campos y avisa los cambios. La validación
 * vive en `address.schema.ts` y la decisión de guardar, en el modal que lo usa.
 * Los ids se derivan de `useId` para que dos instancias montadas a la vez (crear
 * y editar) no compartan el mismo `htmlFor`.
 */
export function AddressForm({ values, errors, onChange, disabled = false }: AddressFormProps) {
  const uid = useId()
  const fieldId = (field: keyof AddressFormValues): string => `${uid}-${field}`

  return (
    <div className={styles.form}>
      <Input
        id={fieldId('alias')}
        label="Alias del domicilio"
        hint="Un nombre corto para reconocerlo, por ejemplo “Depósito Córdoba”."
        value={values.alias}
        error={errors.alias}
        disabled={disabled}
        onChange={(event) => {
          onChange('alias', event.currentTarget.value)
        }}
        className={styles.full}
      />

      <Input
        id={fieldId('street')}
        label="Calle"
        value={values.street}
        error={errors.street}
        disabled={disabled}
        onChange={(event) => {
          onChange('street', event.currentTarget.value)
        }}
        className={styles.wide}
      />

      <Input
        id={fieldId('number')}
        label="Número"
        inputMode="numeric"
        value={values.number}
        error={errors.number}
        disabled={disabled}
        onChange={(event) => {
          onChange('number', event.currentTarget.value)
        }}
      />

      <Input
        id={fieldId('floor')}
        label="Piso"
        value={values.floor}
        error={errors.floor}
        disabled={disabled}
        onChange={(event) => {
          onChange('floor', event.currentTarget.value)
        }}
      />

      <Input
        id={fieldId('apartment')}
        label="Departamento"
        value={values.apartment}
        error={errors.apartment}
        disabled={disabled}
        onChange={(event) => {
          onChange('apartment', event.currentTarget.value)
        }}
      />

      <Input
        id={fieldId('city')}
        label="Localidad"
        value={values.city}
        error={errors.city}
        disabled={disabled}
        onChange={(event) => {
          onChange('city', event.currentTarget.value)
        }}
        className={styles.half}
      />

      <Select
        id={fieldId('province')}
        label="Provincia"
        options={PROVINCE_OPTIONS}
        value={values.province}
        error={errors.province}
        disabled={disabled}
        placeholderOption="-"
        placeholderOptionValue=""
        onChange={(event) => {
          onChange('province', event.currentTarget.value)
        }}
        className={styles.wide}
      />

      <Input
        id={fieldId('postalCode')}
        label="Código postal"
        inputMode="numeric"
        maxLength={4}
        value={values.postalCode}
        error={errors.postalCode}
        disabled={disabled}
        onChange={(event) => {
          onChange('postalCode', event.currentTarget.value)
        }}
      />

      <Textarea
        id={fieldId('observations')}
        label="Observaciones"
        hint="Datos para el cartero: timbre, horarios, referencias."
        value={values.observations}
        error={errors.observations}
        disabled={disabled}
        onChange={(event) => {
          onChange('observations', event.currentTarget.value)
        }}
        className={styles.full}
      />
    </div>
  )
}
