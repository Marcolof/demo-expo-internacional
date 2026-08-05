import { useState } from 'react'
import { formatDate } from '@/shared/lib/formatDate'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Modal } from '@/shared/ui/Modal'
import { useToast } from '@/shared/ui/Toast'
import type { Shipment } from '../types/shipment.types'
import styles from './PrintLabelModal.module.css'

/**
 * Documentos disponibles según el alcance del envío.
 *
 * Los formularios UPU (CN23, CP71) sólo existen en internacional y NO deben
 * modificarse en estructura ni campos: acá sólo se listan para imprimir.
 */
const NATIONAL_DOCUMENTS: readonly string[] = ['Rótulo', 'Constancia de imposición']

const INTERNATIONAL_DOCUMENTS: readonly string[] = [
  'Rótulo',
  'CN23 — Declaración de aduana',
  'CP71 — Boletín de expedición',
  'Declaración de contenido',
]

export interface PrintLabelModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly shipment: Shipment | null
}

export function PrintLabelModal({ isOpen, onClose, shipment }: PrintLabelModalProps) {
  const { showToast } = useToast()
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set(['Rótulo']))

  if (shipment === null) return null

  const documents =
    shipment.scope === 'INTERNACIONAL' ? INTERNATIONAL_DOCUMENTS : NATIONAL_DOCUMENTS

  const toggle = (document: string) => {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(document)) next.delete(document)
      else next.add(document)
      return next
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Imprimir documentación"
      size="md"
      footer={[
        <Button key="cancel" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>,
        <Button
          key="print"
          variant="primary"
          disabled={selected.size === 0}
          onClick={() => {
            onClose()
            showToast(`Impresión simulada de ${selected.size} documento(s).`, 'success')
          }}
        >
          Imprimir
        </Button>,
      ]}
    >
      <div className={styles.list}>
        {documents.map((document) => (
          <Checkbox
            key={document}
            id={`doc-${document}`}
            label={document}
            checked={selected.has(document)}
            onChange={() => toggle(document)}
          />
        ))}
      </div>

      {shipment.documentationExpiresAt !== undefined && (
        <p className={styles.expiry}>
          La documentación de este envío tiene vigencia hasta el{' '}
          {formatDate(shipment.documentationExpiresAt)}.
        </p>
      )}
    </Modal>
  )
}
