/**
 * Esquema del formulario de subusuario.
 *
 * `role` se tipa como `Role | ''` porque el `Select` arranca en la opción vacía:
 * un `Role` a secas obligaría a inventar un rol por defecto que el titular no
 * eligió.
 */

import { ROLE_PERMISSIONS } from '@/core/auth/permissions'
import type { Permission } from '@/core/auth/permissions'
import type { Role } from '@/core/auth/roles'
import { firstError, isEmail, maxLength, required } from '@/shared/lib/validators'
import type { AccountUser } from '../types/account.types'

export interface UserFormValues {
  readonly firstName: string
  readonly lastName: string
  readonly email: string
  readonly role: Role | ''
  readonly permissions: readonly Permission[]
}

/** Campos de texto del formulario. `permissions` se maneja con su propio handler. */
export type UserTextField = 'firstName' | 'lastName' | 'email' | 'role'

export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>

const MAX_NAME = 40

export function validateUser(values: UserFormValues): UserFormErrors {
  const errors: UserFormErrors = {}

  const checks: Readonly<Record<keyof UserFormValues, string | null>> = {
    firstName: firstError(required(values.firstName), maxLength(values.firstName, MAX_NAME)),
    lastName: firstError(required(values.lastName), maxLength(values.lastName, MAX_NAME)),
    email: firstError(required(values.email), isEmail(values.email)),
    role: required(values.role),
    permissions: null,
  }

  for (const [field, error] of Object.entries(checks)) {
    if (error !== null) {
      errors[field as keyof UserFormValues] = error
    }
  }

  return errors
}

export function isUserFormValid(errors: UserFormErrors): boolean {
  return Object.keys(errors).length === 0
}

export const EMPTY_USER_FORM: UserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  role: '',
  permissions: [],
}

export function userToForm(user: AccountUser): UserFormValues {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  }
}

/**
 * Permisos que corresponden a un rol recién elegido.
 *
 * Cambiar el rol REEMPLAZA los permisos por el preset: si no, quedarían
 * arrastrados los permisos sueltos del rol anterior y el resultado no se
 * parecería a ninguno de los dos.
 */
export function permissionsForRoleValue(role: Role | ''): readonly Permission[] {
  return role === '' ? [] : ROLE_PERMISSIONS[role]
}

/**
 * Cambia un campo de texto del formulario.
 *
 * Es un `switch` y no un spread con propiedad computada porque `role` no es un
 * `string` cualquiera y porque cambiarlo arrastra los permisos.
 */
export function applyUserField(
  values: UserFormValues,
  field: UserTextField,
  value: string,
): UserFormValues {
  switch (field) {
    case 'firstName':
      return { ...values, firstName: value }
    case 'lastName':
      return { ...values, lastName: value }
    case 'email':
      return { ...values, email: value }
    case 'role': {
      const role: Role | '' = value === '' ? '' : (value as Role)
      return { ...values, role, permissions: permissionsForRoleValue(role) }
    }
  }
}

/** Agrega o quita un permiso suelto de la lista del formulario. */
export function togglePermission(
  permissions: readonly Permission[],
  permission: Permission,
  enabled: boolean,
): readonly Permission[] {
  if (enabled) {
    return permissions.includes(permission) ? permissions : [...permissions, permission]
  }
  return permissions.filter((current) => current !== permission)
}
