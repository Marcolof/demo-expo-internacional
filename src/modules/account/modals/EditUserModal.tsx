import { useEffect, useState } from 'react'
import type { Permission } from '@/core/auth/permissions'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { useToast } from '@/shared/ui/Toast'
import { UserForm } from '../forms/UserForm'
import {
  EMPTY_USER_FORM,
  applyUserField,
  isUserFormValid,
  togglePermission,
  userToForm,
  validateUser,
} from '../forms/user.schema'
import type { UserFormErrors, UserFormValues, UserTextField } from '../forms/user.schema'
import { canEditUser } from '../rules/canManageUsers'
import type { AccountUser } from '../types/account.types'
import styles from './Modals.module.css'

export interface EditUserModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly accountUser: AccountUser | null
  readonly onSubmit: (accountUser: AccountUser, values: UserFormValues) => void
}

/** Edición de un subusuario. El titular se edita desde el perfil, no acá. */
export function EditUserModal({
  isOpen,
  onClose,
  accountUser,
  onSubmit,
}: EditUserModalProps) {
  const { user } = usePermissions()
  const { showToast } = useToast()
  const [values, setValues] = useState<UserFormValues>(EMPTY_USER_FORM)
  const [errors, setErrors] = useState<UserFormErrors>({})

  useEffect(() => {
    if (isOpen && accountUser !== null) {
      setValues(userToForm(accountUser))
      setErrors({})
    }
  }, [isOpen, accountUser])

  if (accountUser === null) return null

  const result = canEditUser(user, accountUser)

  const handleChange = (field: UserTextField, value: string) => {
    setValues((current) => applyUserField(current, field, value))
  }

  const handleTogglePermission = (permission: Permission, enabled: boolean) => {
    setValues((current) => ({
      ...current,
      permissions: togglePermission(current.permissions, permission, enabled),
    }))
  }

  const handleSubmit = () => {
    if (!result.allowed) return

    const nextErrors = validateUser(values)
    setErrors(nextErrors)
    if (!isUserFormValid(nextErrors)) return

    onSubmit(accountUser, values)
    showToast('Usuario actualizado.', 'success')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar usuario"
      size="lg"
      footer={[
        <Button key="cancel" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>,
        <Button key="save" variant="primary" disabled={!result.allowed} onClick={handleSubmit}>
          Guardar
        </Button>,
      ]}
    >
      {!result.allowed && (
        <div className={styles.notice}>
          <Alert tone="warning" title="No podés guardar cambios">
            {result.reason}
          </Alert>
        </div>
      )}

      <UserForm
        values={values}
        errors={errors}
        onChange={handleChange}
        onTogglePermission={handleTogglePermission}
        disabled={!result.allowed}
      />
    </Modal>
  )
}
