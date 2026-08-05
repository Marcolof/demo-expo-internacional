import { useEffect, useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { useToast } from '@/shared/ui/Toast'
import { AddressForm } from '../forms/AddressForm'
import { EMPTY_ADDRESS_FORM, applyAddressField } from '../forms/address.defaults'
import { isAddressFormValid, validateAddress } from '../forms/address.schema'
import type { AddressFormErrors, AddressFormValues } from '../forms/address.schema'

export interface CreateAddressModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onSubmit: (values: AddressFormValues) => void
}

/** Alta de un domicilio. Valida al confirmar y no cierra si hay errores. */
export function CreateAddressModal({ isOpen, onClose, onSubmit }: CreateAddressModalProps) {
  const { showToast } = useToast()
  const [values, setValues] = useState<AddressFormValues>(EMPTY_ADDRESS_FORM)
  const [errors, setErrors] = useState<AddressFormErrors>({})

  // El formulario se limpia al abrir, no al cerrar: así la animación de cierre
  // no muestra los campos vaciándose.
  useEffect(() => {
    if (isOpen) {
      setValues(EMPTY_ADDRESS_FORM)
      setErrors({})
    }
  }, [isOpen])

  const handleChange = (field: keyof AddressFormValues, value: string) => {
    setValues((current) => applyAddressField(current, field, value))
  }

  const handleSubmit = () => {
    const nextErrors = validateAddress(values)
    setErrors(nextErrors)
    if (!isAddressFormValid(nextErrors)) return

    onSubmit(values)
    showToast('Domicilio agregado.', 'success')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar domicilio"
      size="lg"
      footer={[
        <Button key="cancel" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>,
        <Button key="save" variant="primary" onClick={handleSubmit}>
          Guardar
        </Button>,
      ]}
    >
      <AddressForm values={values} errors={errors} onChange={handleChange} />
    </Modal>
  )
}
