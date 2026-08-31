import { useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { formatUsd, formatWeightKg } from '@/shared/lib/formatCurrency'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'
import { InfoTooltip } from '@/shared/ui/Tooltip'
import {
  computeExportDutiesUsd,
  PACKAGE_MAX_WEIGHT_KG,
  PACKAGE_MAX_WEIGHT_TOOLTIP,
} from '../constants/summary-detail.constants'
import {
  DEFAULT_MEASURE_UNIT,
  measureUnitRequiresInteger,
} from '../constants/measure-units.constants'
import { TARIFF_POSITION_SEED } from '../mocks/tariff-positions.mocks'
import { ARTICLE_KIND_TEXT } from '../types/article.types'
import type { ArticleKind, DeclaredArticleInput } from '../types/article.types'
import type { TariffPositionSuggestion } from '../types/tariff-position.types'
import { TariffSuggestionList } from './TariffSuggestionList'
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
  /** Si es false, no se muestra ni suma el derecho de exportación. */
  readonly commercial?: boolean
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
  unitOfMeasure: '',
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
const QUANTITY_MAX_DECIMALS = 2

/** Limita la entrada a como máximo 2 decimales mientras el usuario escribe. */
function restrictQuantityInput(raw: string): string {
  const normalized = raw.replace(',', '.')
  if (normalized === '' || normalized === '.') return normalized

  const match = normalized.match(/^(\d*)(\.(\d*))?/)
  if (match === null) return raw

  const intPart = match[1] ?? ''
  const decPart = match[3] ?? ''
  if (decPart.length > QUANTITY_MAX_DECIMALS) {
    return `${intPart}.${decPart.slice(0, QUANTITY_MAX_DECIMALS)}`
  }
  return normalized
}

/** Redondeo hacia arriba: enteros con `Math.ceil`; decimales con precisión de 2. */
function ceilQuantityValue(value: number, requiresInteger: boolean): number {
  if (requiresInteger) return Math.ceil(value)
  const factor = 10 ** QUANTITY_MAX_DECIMALS
  return Math.ceil(value * factor) / factor
}

function formatQuantityValue(value: number, requiresInteger: boolean): string {
  if (requiresInteger) return String(Math.ceil(value))
  const ceiled = ceilQuantityValue(value, false)
  return Number.isInteger(ceiled) ? String(ceiled) : ceiled.toFixed(QUANTITY_MAX_DECIMALS).replace(/\.?0+$/, '')
}

function parseQuantityValue(raw: string): number {
  return Number(raw.replace(',', '.').trim())
}

function hasAtMostTwoDecimals(raw: string): boolean {
  const decimalPart = raw.replace(',', '.').split('.')[1]
  if (decimalPart === undefined) return true
  return decimalPart.length <= QUANTITY_MAX_DECIMALS
}

const CLASSIFICATION_DISCLAIMER =
  'La clasificación obtenida es únicamente orientativa. El expedidor es responsable de verificar y declarar la posición arancelaria para el correcto tratamiento del envío. Correo Argentino y VUCE no responden por errores en la posición arancelaria declarada.'

function requiredOrPositive(raw: string, isValid: (value: number) => boolean, invalidMessage: string): string | undefined {
  if (raw.trim() === '') return REQUIRED_MESSAGE
  const value = Number(raw)
  return isValid(value) ? undefined : invalidMessage
}

function validate(form: FormState): FormErrors {
  const requiresInteger = measureUnitRequiresInteger(form.unitOfMeasure)
  return {
    description: form.description.trim() === '' ? REQUIRED_MESSAGE : undefined,
    harmonizedCode: form.harmonizedCode.trim() === '' ? REQUIRED_MESSAGE : undefined,
    quantity: (() => {
      const required = requiredOrPositive(
        form.quantity,
        (value) => Number.isFinite(value) && value > 0,
        'Ingresá un valor mayor a 0.',
      )
      if (required !== undefined) return required

      if (requiresInteger && !Number.isInteger(parseQuantityValue(form.quantity))) {
        return 'Ingresá un número entero mayor a 0.'
      }
      if (!requiresInteger && !hasAtMostTwoDecimals(form.quantity)) {
        return `Ingresá como máximo ${QUANTITY_MAX_DECIMALS} decimales.`
      }
      return undefined
    })(),
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

function formFromValues(values: DeclaredArticleInput | undefined): FormState {
  if (values === undefined) return EMPTY_FORM
  return {
    description: values.description,
    harmonizedCode: values.harmonizedCode,
    quantity: String(values.quantity),
    unitOfMeasure: values.unitOfMeasure || DEFAULT_MEASURE_UNIT,
    unitPriceUsd: String(values.unitPriceUsd),
    unitWeightKg: String(values.unitWeightKg),
  }
}

/**
 * Modal "Agregar artículo" del paso Declaración (Figma node 10116:13975).
 */
export function AddArticleModal({ isOpen, onClose, onSubmit, kind = 'ARTICLE', initialValues, commercial = false }: AddArticleModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const autocompleteRef = useRef<HTMLDivElement>(null)
  const suggestionListId = useId()
  const text = ARTICLE_KIND_TEXT[kind]
  const suggestions = TARIFF_POSITION_SEED
  const activeSuggestion = suggestions[activeSuggestionIndex]
  const activeSuggestionId =
    suggestionsOpen && activeSuggestion !== undefined ? `${suggestionListId}-${activeSuggestion.id}` : undefined

  useEffect(() => {
    if (isOpen) {
      setForm(formFromValues(initialValues))
      setSubmitted(false)
      setSuggestionsOpen(false)
      setActiveSuggestionIndex(-1)
    }
  }, [isOpen, initialValues])

  useEffect(() => {
    if (!suggestionsOpen) return

    const onPointerDown = (event: PointerEvent) => {
      if (autocompleteRef.current !== null && !autocompleteRef.current.contains(event.target as Node)) {
        setSuggestionsOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [suggestionsOpen])

  const errors = validate(form)
  const hasErrors = Object.values(errors).some((message) => message !== undefined)
  const showInvalidBorders = submitted

  const requiresIntegerQuantity = measureUnitRequiresInteger(form.unitOfMeasure)
  const quantity = parseQuantityValue(form.quantity)
  const normalizedQuantity = Number.isFinite(quantity)
    ? ceilQuantityValue(quantity, requiresIntegerQuantity)
    : NaN
  const unitPrice = Number(form.unitPriceUsd)
  const unitWeight = Number(form.unitWeightKg)
  const canComputeTotals =
    Number.isFinite(normalizedQuantity) && normalizedQuantity > 0 && Number.isFinite(unitPrice) && Number.isFinite(unitWeight)
  const totalPriceUsd = canComputeTotals ? normalizedQuantity * unitPrice : 0
  const totalWeightKg = canComputeTotals ? normalizedQuantity * unitWeight : 0
  const exportDutiesUsd = computeExportDutiesUsd(totalPriceUsd)
  const unitOfMeasureLabel = form.unitOfMeasure.trim() === '' ? '-' : form.unitOfMeasure

  const setField = (field: keyof FormState) => (value: string) => setForm((current) => ({ ...current, [field]: value }))

  const handleQuantityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setField('quantity')(restrictQuantityInput(event.currentTarget.value))
  }

  const handleQuantityBlur = () => {
    if (form.quantity.trim() === '') return
    const value = parseQuantityValue(form.quantity)
    if (!Number.isFinite(value) || value <= 0) return
    setField('quantity')(formatQuantityValue(value, requiresIntegerQuantity))
  }

  const handleSelectSuggestion = (suggestion: TariffPositionSuggestion) => {
    setForm((current) => ({
      ...current,
      description: suggestion.productName,
      harmonizedCode: suggestion.tariffPosition,
      unitOfMeasure: suggestion.unitOfMeasure,
    }))
    setSuggestionsOpen(false)
  }

  const handleDescriptionKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      if (suggestionsOpen) {
        event.preventDefault()
        setSuggestionsOpen(false)
      }
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!suggestionsOpen) {
        setSuggestionsOpen(true)
        setActiveSuggestionIndex(0)
        return
      }
      setActiveSuggestionIndex((current) => (current + 1) % suggestions.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!suggestionsOpen) {
        setSuggestionsOpen(true)
        setActiveSuggestionIndex(suggestions.length - 1)
        return
      }
      setActiveSuggestionIndex((current) => {
        if (current < 0) return suggestions.length - 1
        return (current - 1 + suggestions.length) % suggestions.length
      })
      return
    }

    if (event.key === 'Enter' && suggestionsOpen && activeSuggestion !== undefined) {
      event.preventDefault()
      handleSelectSuggestion(activeSuggestion)
    }
  }

  const handleClear = () => {
    setForm(EMPTY_FORM)
    setSubmitted(false)
    setSuggestionsOpen(false)
    setActiveSuggestionIndex(-1)
  }

  const handleSubmit = () => {
    setSubmitted(true)
    if (hasErrors) return

    onSubmit({
      description: form.description.trim(),
      harmonizedCode: form.harmonizedCode.trim(),
      quantity: normalizedQuantity,
      unitOfMeasure: form.unitOfMeasure.trim() === '' ? DEFAULT_MEASURE_UNIT : form.unitOfMeasure,
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
        <Button variant="tertiary" onClick={onClose}>
          Cancelar
        </Button>
        <div className={styles.footerActionsEnd}>
          <Button variant="secondary" onClick={handleClear}>
            Limpiar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Agregar
          </Button>
        </div>
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
      closeOnBackdrop={false}
      footer={footer}
    >
      <div className={styles.form}>
        <p className={styles.intro}>{text.descriptionLead}</p>

        <div ref={autocompleteRef} className={styles.autocomplete}>
          <Input
            id="article-description"
            label={text.descriptionLabel}
            hint={text.descriptionHint}
            value={form.description}
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={suggestionsOpen}
            aria-controls={suggestionsOpen ? suggestionListId : undefined}
            aria-activedescendant={activeSuggestionId}
            onFocus={() => {
              setSuggestionsOpen(true)
              setActiveSuggestionIndex(-1)
            }}
            onChange={(event) => {
              setField('description')(event.currentTarget.value)
              setSuggestionsOpen(true)
            }}
            onKeyDown={handleDescriptionKeyDown}
            invalid={showInvalidBorders && errors.description !== undefined}
          />
          {suggestionsOpen && (
            <TariffSuggestionList
              id={suggestionListId}
              suggestions={suggestions}
              activeId={activeSuggestion?.id}
              onSelect={handleSelectSuggestion}
            />
          )}
        </div>

        <div className={styles.codeSection}>
          <h5 className={styles.codeTitle}>Posición arancelaria</h5>

          <Input
            id="article-harmonized-code"
            label="Código de posición arancelaria"
            placeholder="Código de posición arancelaria"
            hint="Ej: 61.09 (T-SHIRTS Y CAMISETAS, DE PUNTO)."
            value={form.harmonizedCode}
            onChange={(event) => setField('harmonizedCode')(event.currentTarget.value)}
            invalid={showInvalidBorders && errors.harmonizedCode !== undefined}
          />

          <div className={styles.legend} role="note">
            <InfoTooltip content={CLASSIFICATION_DISCLAIMER} />
            <p className={styles.legendText}>{CLASSIFICATION_DISCLAIMER}</p>
          </div>
        </div>

        <Input
          id="article-quantity"
          label="Cantidad"
          inputMode="decimal"
          value={form.quantity}
          onChange={handleQuantityChange}
          onBlur={handleQuantityBlur}
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
          label="Peso unitario (Kg)"
          type="number"
          min={0}
          step={0.01}
          value={form.unitWeightKg}
          onChange={(event) => setField('unitWeightKg')(event.currentTarget.value)}
          invalid={showInvalidBorders && errors.unitWeightKg !== undefined}
        />

        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Unidad de medida</span>
            <span className={styles.totalValue}>{unitOfMeasureLabel}</span>
          </div>
          {commercial && (
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Derecho de exportación</span>
            <span className={styles.totalValue}>{formatUsd(exportDutiesUsd)}</span>
          </div>
          )}
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Precio total en dólares</span>
            <span className={styles.totalValue}>{formatUsd(totalPriceUsd)}</span>
          </div>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Peso total</span>
            <span className={styles.totalValue}>{formatWeightKg(totalWeightKg)}</span>
          </div>
          <div className={styles.totalRow}>
            <span className={styles.totalLabelWithTip}>
              <InfoTooltip content={PACKAGE_MAX_WEIGHT_TOOLTIP} />
              <span>Peso máximo</span>
            </span>
            <span className={styles.totalValue}>{PACKAGE_MAX_WEIGHT_KG}kg</span>
          </div>
        </div>
      </div>
    </Modal>
  )
}
