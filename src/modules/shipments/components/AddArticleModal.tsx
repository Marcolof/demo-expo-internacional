import { useEffect, useState } from 'react'
import { formatUsd, formatWeightKg } from '@/shared/lib/formatCurrency'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'
import type { DeclaredArticleInput } from '../types/article.types'
import styles from './AddArticleModal.module.css'

export interface AddArticleModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  /** Sólo se llama con datos válidos: el modal no cierra mientras haya errores. */
  readonly onSubmit: (article: DeclaredArticleInput) => void
}

interface FormState {
  readonly description: string
  readonly harmonizedCode: string
  readonly quantity: string
  readonly unitPriceUsd: string
  readonly unitWeightKg: string
}

const EMPTY_FORM: FormState = {
  description: '',
  harmonizedCode: '',
  quantity: '',
  unitPriceUsd: '',
  unitWeightKg: '',
}

interface FormErrors {
  readonly description?: string
  readonly harmonizedCode?: string
  readonly quantity?: string
  readonly unitPriceUsd?: string
  readonly unitWeightKg?: string
}

const REQUIRED_MESSAGE = 'Este campo es obligatorio.'

function requiredOrPositive(raw: string, isValid: (value: number) => boolean, invalidMessage: string): string | undefined {
  if (raw.trim() === '') return REQUIRED_MESSAGE
  const value = Number(raw)
  return isValid(value) ? undefined : invalidMessage
}

function validate(form: FormState): FormErrors {
  return {
    description: form.description.trim() === '' ? REQUIRED_MESSAGE : undefined,
    harmonizedCode: form.harmonizedCode.trim() === '' ? REQUIRED_MESSAGE : undefined,
    quantity: requiredOrPositive(
      form.quantity,
      (value) => Number.isInteger(value) && value >= 1,
      'Ingresá un número entero mayor a 0.',
    ),
    unitPriceUsd: requiredOrPositive(
      form.unitPriceUsd,
      (value) => Number.isFinite(value) && value > 0,
      'Ingresá un valor mayor a 0.',
    ),
    unitWeightKg: requiredOrPositive(
      form.unitWeightKg,
      (value) => Number.isFinite(value) && value > 0,
      'Ingresá un valor mayor a 0.',
    ),
  }
}

function DisclosureIcon({ open }: { readonly open: boolean }) {
  return (
    <svg
      className={styles.disclosureIcon}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : undefined }}
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  )
}

/**
 * Modal "Agregar artículo" del paso Declaración (Figma node 10116:13975).
 * Todos los campos son obligatorios. Si al confirmar falta o sobra formato,
 * el modal no cierra: marca los campos inválidos y muestra un aviso arriba
 * de los botones (Figma node de referencia del banner de error).
 */
export function AddArticleModal({ isOpen, onClose, onSubmit }: AddArticleModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [helpOpen, setHelpOpen] = useState(true)

  // Formulario limpio cada vez que se abre (evita arrastrar datos del artículo anterior).
  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM)
      setSubmitted(false)
    }
  }, [isOpen])

  const errors = validate(form)
  const hasErrors = Object.values(errors).some((message) => message !== undefined)
  /** Marco rojo tras un intento fallido: el motivo va sólo en el banner. */
  const showInvalidBorders = submitted

  const quantity = Number(form.quantity)
  const unitPrice = Number(form.unitPriceUsd)
  const unitWeight = Number(form.unitWeightKg)
  const canComputeTotals =
    Number.isFinite(quantity) && quantity > 0 && Number.isFinite(unitPrice) && Number.isFinite(unitWeight)
  const totalPriceUsd = canComputeTotals ? quantity * unitPrice : 0
  const totalWeightKg = canComputeTotals ? quantity * unitWeight : 0

  const setField = (field: keyof FormState) => (value: string) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = () => {
    setSubmitted(true)
    if (hasErrors) return

    onSubmit({
      description: form.description.trim(),
      harmonizedCode: form.harmonizedCode.trim(),
      quantity,
      unitPriceUsd: unitPrice,
      unitWeightKg: unitWeight,
    })
    onClose()
  }

  const footer = (
    <div className={styles.footer}>
      {submitted && hasErrors && (
        <Alert tone="danger">Completá todos los campos obligatorios con el formato correcto para continuar.</Alert>
      )}

      <div className={styles.footerActions}>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Agregar
        </Button>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar artículo"
      size="xl"
      labelledById="add-article-title"
      footer={footer}
    >
      <div className={styles.form}>
        <Input
          id="article-description"
          label="Descripción del artículo"
          hint="Ej.: Remera de algodón."
          value={form.description}
          onChange={(event) => setField('description')(event.currentTarget.value)}
          invalid={showInvalidBorders && errors.description !== undefined}
        />

        <div className={styles.codeSection}>
          <h5 className={styles.codeTitle}>Código armonizado</h5>
          <p className={styles.codeHint}>
            Consultalo en{' '}
            <a
              href="https://www.afip.gob.ar/vuce/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.codeLink}
            >
              VUCE
            </a>{' '}
            y copiá el código correspondiente al
            producto que declarás.
          </p>

          <Input
            id="article-harmonized-code"
            label="Código de armonización"
            value={form.harmonizedCode}
            onChange={(event) => setField('harmonizedCode')(event.currentTarget.value)}
            invalid={showInvalidBorders && errors.harmonizedCode !== undefined}
          />

          <button
            type="button"
            className={styles.disclosureTrigger}
            aria-expanded={helpOpen}
            onClick={() => setHelpOpen((open) => !open)}
          >
            ¿Dónde encuentro este código?
            <DisclosureIcon open={helpOpen} />
          </button>

          {helpOpen && (
            <div className={styles.disclosurePanel}>
              <p>Para buscar el código:</p>
              <ol>
                <li>
                  Ingresá a{' '}
                  <a href="https://www.afip.gob.ar/vuce/" target="_blank" rel="noopener noreferrer" className={styles.codeLink}>
                    VUCE
                  </a>.
                </li>
                <li>Buscá el producto por descripción.</li>
                <li>Copiá el código correspondiente.</li>
                <li>Pegalo en este campo.</li>
              </ol>
              <p>Ejemplo: Remera de algodón → buscá &quot;remera algodón&quot;.</p>
            </div>
          )}
        </div>

        <Input
          id="article-quantity"
          label="Cantidad"
          type="number"
          min={1}
          step={1}
          value={form.quantity}
          onChange={(event) => setField('quantity')(event.currentTarget.value)}
          invalid={showInvalidBorders && errors.quantity !== undefined}
        />

        <Input
          id="article-unit-price"
          label="Precio unitario en dólares"
          type="number"
          min={0}
          step={0.01}
          value={form.unitPriceUsd}
          onChange={(event) => setField('unitPriceUsd')(event.currentTarget.value)}
          invalid={showInvalidBorders && errors.unitPriceUsd !== undefined}
        />

        <Input
          id="article-unit-weight"
          label="Peso unitario (kg)"
          hint="Peso de cada unidad"
          type="number"
          min={0}
          step={0.01}
          value={form.unitWeightKg}
          onChange={(event) => setField('unitWeightKg')(event.currentTarget.value)}
          invalid={showInvalidBorders && errors.unitWeightKg !== undefined}
        />

        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Precio total en dólares</span>
            <span className={styles.totalValue}>{formatUsd(totalPriceUsd)}</span>
          </div>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Peso total</span>
            <span className={styles.totalValue}>{formatWeightKg(totalWeightKg)}</span>
          </div>
        </div>
      </div>
    </Modal>
  )
}
