import { useId } from 'react'
import { PERMISSION_LABELS } from '@/core/auth/permissions'
import type { Permission } from '@/core/auth/permissions'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { ASSIGNABLE_PERMISSIONS, ROLE_OPTIONS } from '../mocks/account.mocks'
import type { UserFormErrors, UserFormValues, UserTextField } from './user.schema'
import styles from './UserForm.module.css'

export interface UserFormProps {
  readonly values: UserFormValues
  readonly errors: UserFormErrors
  readonly onChange: (field: UserTextField, value: string) => void
  readonly onTogglePermission: (permission: Permission, enabled: boolean) => void
  readonly disabled?: boolean
}

/**
 * Formulario de subusuario, controlado desde afuera.
 *
 * Los permisos van aparte de los campos de texto: no son un valor sino un
 * conjunto, y el modal que lo usa decide cómo se combinan con el preset del rol.
 */
export function UserForm({
  values,
  errors,
  onChange,
  onTogglePermission,
  disabled = false,
}: UserFormProps) {
  const uid = useId()

  return (
    <div className={styles.form}>
      <Input
        id={`${uid}-firstName`}
        label="Nombre"
        value={values.firstName}
        error={errors.firstName}
        disabled={disabled}
        onChange={(event) => {
          onChange('firstName', event.currentTarget.value)
        }}
      />

      <Input
        id={`${uid}-lastName`}
        label="Apellido"
        value={values.lastName}
        error={errors.lastName}
        disabled={disabled}
        onChange={(event) => {
          onChange('lastName', event.currentTarget.value)
        }}
      />

      <Input
        id={`${uid}-email`}
        label="Correo electrónico"
        type="email"
        value={values.email}
        error={errors.email}
        disabled={disabled}
        onChange={(event) => {
          onChange('email', event.currentTarget.value)
        }}
        className={styles.full}
      />

      <Select
        id={`${uid}-role`}
        label="Rol"
        options={ROLE_OPTIONS}
        value={values.role}
        error={errors.role}
        disabled={disabled}
        placeholderOption="-"
        placeholderOptionValue=""
        hint="El rol define los permisos iniciales. Después podés ajustarlos de a uno."
        onChange={(event) => {
          onChange('role', event.currentTarget.value)
        }}
        className={styles.full}
      />

      <fieldset className={styles.permissions}>
        <legend className={styles.legend}>Permisos</legend>

        <div className={styles.permissionsGrid}>
          {ASSIGNABLE_PERMISSIONS.map((permission) => (
            <Checkbox
              key={permission}
              id={`${uid}-${permission}`}
              label={PERMISSION_LABELS[permission]}
              checked={values.permissions.includes(permission)}
              disabled={disabled}
              onChange={(checked) => {
                onTogglePermission(permission, checked)
              }}
            />
          ))}
        </div>
      </fieldset>
    </div>
  )
}
