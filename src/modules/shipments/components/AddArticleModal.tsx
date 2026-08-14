import { useEffect, useState } from 'react'
import { formatUsd, formatWeightKg } from '@/shared/lib/formatCurrency'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { NumberInput } from '@/shared/ui/NumberInput'
import { Modal } from '@/shared/ui/Modal'
import { Select } from '@/shared/ui/Select'
import { InfoTooltip } from '@/shared/ui/Tooltip'
import { VUCE_URL } from '../constants/summary-detail.constants'
import {
  DEFAULT_MEASURE_UNIT,
  MEASURE_UNIT_OPTIONS,
} from '../constants/measure-units.constants'
import { ARTICLE_KIND_TEXT } from '../types/article.types'
import type { ArticleKind, DeclaredArticleInput } from '../types/article.types'
import styles from './AddArticleModal.module.css'

export interface AddArticleModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  /** Sólo se llama con datos válidos: el modal no cierra mientras haya errores. */
  readonly onSubmit: (article: DeclaredArticleInput) => void
  /** "Documento" (doc funcional §5.5) cambia título/label/empty state — ver `article.types.ts`. */
  readonly kind?: ArticleKind
  /** Cuando se pasa, el modal abre en modo "editar" pre-poblando los campos. */
  readonly initialValues?: DeclaredArticleInput
}

interface FormState {
  readonly description: string
  readonly harmonizedCode: string
  readonly quantity: string
  readonly unitOfMeasure: string
  readonly unitPriceUsd: string
  readonly unitWeightKg: string
}

const EMPTY_FORM: FormState = {
  description: '',
  harmonizedCode: '',
  quantity: '',
  unitOfMeasure: DEFAULT_MEASURE_UNIT,
  unitPriceUsd: '',
  unitWeightKg: '',
}

interface FormErrors {
  readonly description?: string
  readonly harmonizedCode?: string
  readonly quantity?: string
  readonly unitOfMeasure?: string
  readonly unitPriceUsd?: string
  readonly unitWeightKg?: string
}

const REQUIRED_MESSAGE = 'Este campo es obligatorio.'

const CLASSIFICATION_DISCLAIMER =
  'La clasificación obtenida es únicamente orientativa. El expedidor es responsable de verificar y declarar la posición arancelaria para el correcto tratamiento del envío. Correo Argentino y VUCE no responden por errores en la posición arancelaria declarada.'

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
    unitOfMeasure: form.unitOfMeasure.trim() === '' ? REQUIRED_MESSAGE : undefined,
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
 */
export function AddArticleModal({ isOpen, onClose, onSubmit, kind = 'ARTICLE', initialValues }: AddArticleModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const text = ARTICLE_KIND_TEXT[kind]

  useEffect(() => {
    if (isOpen) {
      setForm(
        initialValues
          ? {
              description: initialValues.description,
              harmonizedCode: initialValues.harmonizedCode,
              quantity: String(initialValues.quantity),
              unitOfMeasure: initialValues.unitOfMeasure || DEFAULT_MEASURE_UNIT,
              unitPriceUsd: String(initialValues.unitPriceUsd),
              unitWeightKg: String(initialValues.unitWeightKg),
            }
          : EMPTY_FORM,
      )
      setSubmitted(false)
    }
  }, [isOpen, initialValues])

  const errors = validate(form)
  const hasErrors = Object.values(errors).some((message) => message !== undefined)
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
      unitOfMeasure: form.unitOfMeasure,
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
      title={text.modalTitle}
      size="xl"
      labelledById="add-article-title"
      footer={footer}
    >
      <div className={styles.form}>
        <Input
          id="article-description"
          label={text.descriptionLabel}
          hint={text.descriptionHint}
          value={form.description}
          onChange={(event) => setField('description')(event.currentTarget.value)}
          invalid={showInvalidBorders && errors.description !== undefined}
        />

        <div className={styles.codeSection}>
          <h5 className={styles.codeTitle}>Posición arancelaria</h5>
          <p className={styles.codeHint}>
            Consultalo en{' '}
            <a className={styles.codeLink} href={VUCE_URL} target="_blank" rel="noreferrer">
              VUCE
            </a>{' '}
            y copiá el código correspondiente al producto que declarás.
          </p>

          <Input
            id="article-harmonized-code"
            label="Código de posición arancelaria"
            placeholder="Código de posición arancelaria"
            hint="Ej: 61.09 (T-SHIRTS Y CAMISETAS, DE PUNTO)."
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
                <li>Ingresá a VUCE.</li>
                <li>Buscá el producto por descripción.</li>
                <li>Copiá el código correspondiente.</li>
                <li>Pegalo en este campo.</li>
              </ol>
              <p>
                Ejemplo: buscá &apos;remera&apos; → seleccioná «T-SHIRTS» Y CAMISETAS, DE PUNTO (61.09).
              </p>
              <div className={styles.alertSlot}>
                <Alert tone="info">
                  <span className={styles.alertWithTip}>
                    {CLASSIFICATION_DISCLAIMER}
                    <InfoTooltip content={CLASSIFICATION_DISCLAIMER} />
                  </span>
                </Alert>
              </div>
            </div>
          )}
        </div>

        <div className={styles.qtyRow}>
          <Select
            id="article-unit-of-measure"
            label="Unidad de medida"
            options={MEASURE_UNIT_OPTIONS}
            value={form.unitOfMeasure}
            onChange={(event) => setField('unitOfMeasure')(event.currentTarget.value)}
            invalid={showInvalidBorders && errors.unitOfMeasure !== undefined}
          />
          <NumberInput
            id="article-quantity"
            label="Cantidad"
            min={1}
            step={1}
            value={form.quantity}
            onChange={(event) => setField('quantity')(event.currentTarget.value)}
            invalid={showInvalidBorders && errors.quantity !== undefined}
          />
        </div>

        <Input
          id="article-unit-price"
          label="Precio unitario en USD"
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
            <span className={styles.totalLabel}>Precio total en USD</span>
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
