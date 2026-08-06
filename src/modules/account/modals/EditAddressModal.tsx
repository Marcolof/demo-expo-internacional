import { useEffect, useState } from 'react'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { useToast } from '@/shared/ui/Toast'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { AddressForm } from '../forms/AddressForm'
import {
  EMPTY_ADDRESS_FORM,
  addressToForm,
  applyAddressField,
} from '../forms/address.defaults'
import { isAddressFormValid, validateAddress } from '../forms/address.schema'
import type { AddressFormErrors, AddressFormValues } from '../forms/address.schema'
import { canEditAddress } from '../rules/canEditAddress'
import type { Address } from '../types/account.types'
import styles from './Modals.module.css'

export interface EditAddressModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  /** Domicilio a editar. `null` mientras el modal nunca se abrió. */
  readonly address: Address | null
  readonly onSubmit: (address: Address, values: AddressFormValues) => void
}

/** Edición de un domicilio existente. */
export function EditAddressModal({
  isOpen,
  onClose,
  address,
  onSubmit,
}: EditAddressModalProps) {
  const { user } = usePermissions()
  const { showToast } = useToast()
  const [values, setValues] = useState<AddressFormValues>(EMPTY_ADDRESS_FORM)
  const [errors, setErrors] = useState<AddressFormErrors>({})

  useEffect(() => {
    if (isOpen && address !== null) {
      setValues(addressToForm(address))
      setErrors({})
    }
  }, [isOpen, address])

  if (address === null) return null

  const result = canEditAddress(user, address)

  const handleChange = (field: keyof AddressFormValues, value: string) => {
    setValues((current) => applyAddressField(current, field, value))
  }

  const handleSubmit = () => {
    if (!result.allowed) return

    const nextErrors = validateAddress(values)
    setErrors(nextErrors)
    if (!isAddressFormValid(nextErrors)) return

    onSubmit(address, values)
    showToast('Domicilio actualizado.', 'success')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar domicilio"
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

      <AddressForm
        values={values}
        errors={errors}
        onChange={handleChange}
        disabled={!result.allowed}
      />
    </Modal>
  )
}
