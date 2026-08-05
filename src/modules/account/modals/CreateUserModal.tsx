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
  validateUser,
} from '../forms/user.schema'
import type { UserFormErrors, UserFormValues, UserTextField } from '../forms/user.schema'
import { canCreateUser } from '../rules/canManageUsers'
import styles from './Modals.module.css'

export interface CreateUserModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onSubmit: (values: UserFormValues) => void
}

/** Alta de un subusuario de la cuenta. */
export function CreateUserModal({ isOpen, onClose, onSubmit }: CreateUserModalProps) {
  const { user } = usePermissions()
  const { showToast } = useToast()
  const [values, setValues] = useState<UserFormValues>(EMPTY_USER_FORM)
  const [errors, setErrors] = useState<UserFormErrors>({})

  useEffect(() => {
    if (isOpen) {
      setValues(EMPTY_USER_FORM)
      setErrors({})
    }
  }, [isOpen])

  const result = canCreateUser(user)

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

    onSubmit(values)
    showToast('Usuario creado.', 'success')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar usuario"
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
          <Alert tone="warning" title="No podés crear usuarios">
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
