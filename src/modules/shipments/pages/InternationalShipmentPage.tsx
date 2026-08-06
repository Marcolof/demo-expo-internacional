import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import type { SelectOption } from '@/core/types/common'
import { COUNTRIES } from '@/shared/lib/countries'
import { PageContainer } from '@/shared/layout/PageContainer'
import { formatUsd, formatWeightKg } from '@/shared/lib/formatCurrency'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Switch } from '@/shared/ui/Switch'
import { ScopeSwitch } from '../components/ScopeSwitch'
import { InternationalSummary } from '../components/InternationalSummary'
import type { InternationalStep } from '../components/InternationalStepper'
import { AddArticleModal } from '../components/AddArticleModal'
import { ArticleAccordionItem } from '../components/ArticleAccordionItem'
import { DestinatarioFields } from '../components/DestinatarioFields'
import type { DestinatarioValues } from '../components/DestinatarioFields'
import { DestinoFields } from '../components/DestinoFields'
import { PostalServiceCard } from '../components/PostalServiceCard'
import { ARTICLE_KIND_TEXT, articleTotalPriceUsd, articleTotalWeightKg } from '../types/article.types'
import type { ArticleKind, DeclaredArticle } from '../types/article.types'
import {
  POSTAL_SERVICE_DELIVERY_TIMES,
  POSTAL_SERVICE_LABELS,
} from '../types/shipment.types'
import type { InternationalService } from '../types/shipment.types'
import {
  FREQUENT_MEASURE_OPTIONS,
  FREQUENT_MEASURES,
  PHONE_COUNTRY_CODES,
  PROVINCE_OPTIONS,
  SAVED_ORIGIN_ADDRESSES,
  branchesByProvince,
} from '../mocks/shipments.mocks'
import packageOpenIcon from '@/assets/icons/package-open.svg'
import layout from './NewShipmentPage.module.css'
import formLayout from '../forms/ShipmentForm.module.css'
import styles from './InternationalShipmentPage.module.css'

type InternationalWizardStep = 'DECLARACION' | 'PAQUETE' | 'ORIGEN' | 'DESTINO'

/** Paso del wizard → label del `InternationalStepper` / `InternationalSummary`. */
const STEP_LABELS: Record<InternationalWizardStep, InternationalStep> = {
  DECLARACION: 'Declaración',
  PAQUETE: 'Paquete',
  ORIGEN: 'Origen',
  DESTINO: 'Destino',
}

/** Servicios internacionales documentados (doc funcional §9.2), en el orden a mostrar. */
const INTERNATIONAL_SERVICES: readonly InternationalService[] = [
  'EMS_PAQUETERIA',
  'ENCOMIENDA_INTERNACIONAL',
  'PEQUENO_PAQUETE',
  'EMS_DOCUMENTACION',
]

const EMPTY_DESTINATARIO: DestinatarioValues = {
  fullName: '',
  company: '',
  phoneCountryCode: '-1',
  phone: '',
  email: '',
  taxId: '',
}

/** Doc funcional §7.2: con más de 2 kg declarados, sólo sucursales con asiento aduanero. */
const CUSTOMS_OFFICE_REQUIRED_OVER_KG = 2

/**
 * Categorías. Comercial: "Envío de mercadería" (no editable). No comercial:
 * Regalo / Documento / Muestra comercial / Ayuda familiar (ver documentación funcional §5.5).
 */
const NON_COMMERCIAL_CATEGORIES: readonly SelectOption[] = [
  { value: 'REGALO', label: 'Regalo' },
  { value: 'DOCUMENTO', label: 'Documento' },
  { value: 'MUESTRA', label: 'Muestra comercial' },
  { value: 'AYUDA_FAMILIAR', label: 'Ayuda familiar' },
]

const COMMERCIAL_CATEGORIES: readonly SelectOption[] = [{ value: 'MERCADERIA', label: 'Envío de mercadería' }]

/**
 * Reglas del paso Paquete (doc funcional §6.2 "Medidas", §6.3 "Peso total",
 * §6.4 "Peso máximo"). §6.2 dice "dos de los lados no pueden superar
 * 90 cm × 90 cm": se interpreta como que a lo sumo UN lado puede superar los
 * 90 cm (si dos o más lo superan, no cumple). Interpretación registrada en
 * ANALISIS-FUNCIONAL.md §3.1 para que quede a la vista, no como decisión
 * silenciosa.
 */
const PACKAGE_MAX_SIDE_CM = 90
const PACKAGE_MAX_OVERSIZED_SIDES = 1
const PACKAGE_MAX_WEIGHT_KG = 20

function validatePackageStep(
  lengthCm: string,
  widthCm: string,
  heightCm: string,
  packageWeightKg: string,
  declaredContentWeightKg: number,
): string | null {
  const length = Number(lengthCm)
  const width = Number(widthCm)
  const height = Number(heightCm)

  const hasValidMeasures =
    lengthCm.trim() !== '' &&
    widthCm.trim() !== '' &&
    heightCm.trim() !== '' &&
    Number.isFinite(length) &&
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    length > 0 &&
    width > 0 &&
    height > 0

  if (!hasValidMeasures) {
    return 'Completá el largo, el ancho y el alto del paquete para continuar.'
  }

  const oversizedSides = [length, width, height].filter((side) => side > PACKAGE_MAX_SIDE_CM).length
  if (oversizedSides > PACKAGE_MAX_OVERSIZED_SIDES) {
    return `Al menos dos lados del paquete superan los ${PACKAGE_MAX_SIDE_CM} cm. Revisá las medidas para continuar.`
  }

  const weight = Number(packageWeightKg)
  const hasValidWeight = packageWeightKg.trim() !== '' && Number.isFinite(weight) && weight > 0
  if (!hasValidWeight) {
    return 'Completá el peso del paquete para continuar.'
  }

  if (weight < declaredContentWeightKg) {
    return 'El peso total del paquete no puede ser menor al peso del contenido declarado.'
  }

  if (weight > PACKAGE_MAX_WEIGHT_KG) {
    return `El peso del paquete supera el máximo permitido para envíos internacionales. Ingresá un peso de hasta ${PACKAGE_MAX_WEIGHT_KG} kg para continuar.`
  }

  return null
}

function PlusIcon() {
  return (
    <svg
      className={styles.addArticleIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

/**
 * Paso 1 — Declaración del flujo de envío internacional.
 * Diseño de Figma (Mi Correo 2.0, node 7323:94738), estado inicial (vacío).
 * Reutiliza el layout y los componentes del proyecto; las validaciones se
 * incorporan en una etapa posterior.
 */
export function InternationalShipmentPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<InternationalWizardStep>('DECLARACION')
  const [country, setCountry] = useState('-1')
  const [commercial, setCommercial] = useState(false)
  const [category, setCategory] = useState('-1')
  const [declarationAccepted, setDeclarationAccepted] = useState(false)
  const [articles, setArticles] = useState<readonly DeclaredArticle[]>([])
  const [isArticleModalOpen, setArticleModalOpen] = useState(false)
  const [declarationError, setDeclarationError] = useState<string | null>(null)

  const [frequentMeasureId, setFrequentMeasureId] = useState('-1')
  const [lengthCm, setLengthCm] = useState('')
  const [widthCm, setWidthCm] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [packageWeightKg, setPackageWeightKg] = useState('')
  const [packageError, setPackageError] = useState<string | null>(null)

  const [originRemitenteId, setOriginRemitenteId] = useState('-1')
  const [originProvinceCode, setOriginProvinceCode] = useState('-1')
  const [originBranchCode, setOriginBranchCode] = useState('-1')

  const [destinatario, setDestinatario] = useState<DestinatarioValues>(EMPTY_DESTINATARIO)
  const [destinationOrderNumber, setDestinationOrderNumber] = useState('')
  const [destinationProvince, setDestinationProvince] = useState('')
  const [destinationCity, setDestinationCity] = useState('')
  const [destinationPostalCode, setDestinationPostalCode] = useState('')
  const [destinationAddressLines, setDestinationAddressLines] = useState<readonly string[]>([''])
  const [selectedService, setSelectedService] = useState<InternationalService | null>(null)

  const categoryOptions = commercial ? COMMERCIAL_CATEGORIES : NON_COMMERCIAL_CATEGORIES

  /** País y categoría completos habilitan "Agregar artículo" (ver doc funcional §5.5). */
  const canAddArticle = country !== '-1' && category !== '-1'

  /** Categoría "Documento" cambia el vocabulario de toda la sección (ver `article.types.ts`). */
  const articleKind: ArticleKind = category === 'DOCUMENTO' ? 'DOCUMENT' : 'ARTICLE'
  const articleKindText = ARTICLE_KIND_TEXT[articleKind]

  const totalArticles = articles.length
  const totalValueUsd = articles.reduce((sum, article) => sum + articleTotalPriceUsd(article), 0)
  const totalWeightKg = articles.reduce((sum, article) => sum + articleTotalWeightKg(article), 0)

  /** Doc funcional §7.2: más de 2 kg → sólo sucursales con asiento aduanero. */
  const originRequiresCustomsOffice = totalWeightKg > CUSTOMS_OFFICE_REQUIRED_OVER_KG
  const originBranchOptions = branchesByProvince(originProvinceCode, originRequiresCustomsOffice)

  /** País elegido en Declaración, mostrado (no editable) en Destino — doc funcional §8.4. */
  const destinationCountryLabel = COUNTRIES.find((option) => option.value === country)?.label ?? '-'

  const removeArticle = (article: DeclaredArticle) => {
    setArticles((current) => current.filter((item) => item.id !== article.id))
  }

  const handleDestinatarioChange = <K extends keyof DestinatarioValues>(field: K, value: DestinatarioValues[K]) => {
    setDestinatario((current) => ({ ...current, [field]: value }))
  }

  const handleAddressLineChange = (index: number, value: string) => {
    setDestinationAddressLines((current) => current.map((line, i) => (i === index ? value : line)))
  }

  const handleAddAddressLine = () => {
    setDestinationAddressLines((current) => (current.length < 3 ? [...current, ''] : current))
  }

  const handleRemoveAddressLine = (index: number) => {
    setDestinationAddressLines((current) => current.filter((_, i) => i !== index))
  }

  const handleAcceptDeclaration = (checked: boolean) => {
    setDeclarationAccepted(checked)
    if (checked) setDeclarationError(null)
  }

  const handleFrequentMeasureChange = (id: string) => {
    setFrequentMeasureId(id)
    const measure = FREQUENT_MEASURES.find((item) => item.id === id)
    if (measure !== undefined) {
      setLengthCm(String(measure.lengthCm))
      setWidthCm(String(measure.widthCm))
      setHeightCm(String(measure.heightCm))
    }
  }

  /** Avanza de Declaración a Paquete. Requiere país, categoría, al menos un
   * artículo y la declaración jurada confirmada (ver doc funcional §5.5). */
  const handleNext = () => {
    if (!declarationAccepted) {
      setDeclarationError('Tenés que confirmar la declaración jurada para continuar.')
      return
    }
    if (country === '-1' || category === '-1' || articles.length === 0) {
      setDeclarationError('Completá el país, la categoría y agregá al menos un artículo para continuar.')
      return
    }
    setDeclarationError(null)
    setStep('PAQUETE')
  }

  /** Valida el paso Paquete (doc funcional §6.2 / §6.3 / §6.4) y avanza a Origen. */
  const handleNextFromPackage = () => {
    const error = validatePackageStep(lengthCm, widthCm, heightCm, packageWeightKg, totalWeightKg)
    setPackageError(error)
    if (error === null) setStep('ORIGEN')
  }

  return (
    <PageContainer width="full">
      <div className={layout.prin}>
        {/* Columna izquierda: título, tabs y formulario de Declaración */}
        <div className={layout.carga}>
          <h3 className={layout.title}>Nuevo envío | Paquetería</h3>

          {/* Sólo en responsive: en desktop este switch vive en el panel de
              Resumen (más abajo, `layout.infoRe`), alineado con los tabs. */}
          <ScopeSwitch
            className={styles.scopeSwitchMobileOnly}
            value="internacional"
            onChange={(scope) => {
              if (scope === 'nacional') navigate('/')
            }}
          />

          <div className={layout.loadTabs} role="tablist" aria-label="Tipo de carga">
            <div className={layout.loadTablist}>
              <button type="button" role="tab" aria-selected="true" className={layout.loadTabActive}>
                Individual
              </button>
              <button
                type="button"
                role="tab"
                aria-selected="false"
                className={layout.loadTabInactive}
                onClick={() => navigate('/internacional/masivo')}
              >
                Masivo
              </button>
            </div>
          </div>

          <div className={styles.form}>
            {step === 'DECLARACION' && (
              <>
                {/* País de destino */}
                <section className={cn(styles.section, styles.narrowSection)}>
                  <h4 className={styles.sectionTitle}>Seleccioná el país de destino</h4>
                  <Select
                    id="destination-country"
                    label="País de destino"
                    options={COUNTRIES}
                    value={country}
                    onChange={(event) => setCountry(event.currentTarget.value)}
                  />
                </section>

                {/* Declaración jurada de contenido */}
                <section className={cn(styles.section, styles.narrowSection)}>
                  <h4 className={styles.sectionTitle}>Declaración jurada de contenido</h4>

                  <div className={styles.fields}>
                    <Switch
                      id="commercial-purpose"
                      label="Envío con fines comerciales"
                      description="Solo disponible desde sucursales con asiento aduanero."
                      checked={commercial}
                      onChange={setCommercial}
                      labelPosition="left"
                    />

                    <p className={styles.hint}>Detallá la categoría del envío y el contenido del paquete.</p>

                    <Select
                      id="shipment-category"
                      label="Categoría de envío"
                      options={categoryOptions}
                      value={category}
                      onChange={(event) => setCategory(event.currentTarget.value)}
                    />

                    <button
                      type="button"
                      className={cn(styles.addArticle, canAddArticle && styles.addArticleEnabled)}
                      disabled={!canAddArticle}
                      onClick={() => setArticleModalOpen(true)}
                    >
                      <PlusIcon />
                      {articleKindText.addButtonLabel}
                    </button>

                    {articles.length === 0 ? (
                      <EmptyState title={articleKindText.emptyStateTitle} iconSrc={packageOpenIcon} />
                    ) : (
                      <div className={styles.articleList}>
                        {articles.map((article, index) => (
                          <ArticleAccordionItem
                            key={article.id}
                            article={article}
                            onRemove={removeArticle}
                            defaultOpen={index === articles.length - 1}
                            kind={articleKind}
                          />
                        ))}
                      </div>
                    )}

                    <div className={styles.totals}>
                      <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>{articleKindText.quantityTotalLabel}</span>
                        <span className={styles.totalValue}>{totalArticles}</span>
                      </div>
                      <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>Valor total declarado</span>
                        <span className={styles.totalValue}>{formatUsd(totalValueUsd)}</span>
                      </div>
                      <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>Peso total declarado</span>
                        <span className={styles.totalValue}>{formatWeightKg(totalWeightKg)}</span>
                      </div>
                    </div>

                    <Checkbox
                      id="declaration-accepted"
                      label="Confirmo que la información ingresada en esta declaración jurada es correcta y completa."
                      checked={declarationAccepted}
                      onChange={handleAcceptDeclaration}
                    />

                    {declarationError !== null && <Alert tone="danger">{declarationError}</Alert>}
                  </div>
                </section>
              </>
            )}

            {step === 'PAQUETE' && (
              <section className={cn(styles.section, styles.narrowSection)}>
                <h4 className={styles.sectionTitle}>Medidas del paquete (cm)</h4>

                <div className={styles.fields}>
                  <Select
                    id="package-frequent-measure"
                    label="Medidas frecuentes"
                    options={FREQUENT_MEASURE_OPTIONS}
                    value={frequentMeasureId}
                    onChange={(event) => handleFrequentMeasureChange(event.currentTarget.value)}
                  />

                  <div className={formLayout.measuresRow}>
                    <Input
                      id="package-length"
                      label="Largo"
                      inputMode="decimal"
                      value={lengthCm}
                      onChange={(event) => setLengthCm(event.currentTarget.value)}
                    />
                    <Input
                      id="package-width"
                      label="Ancho"
                      inputMode="decimal"
                      value={widthCm}
                      onChange={(event) => setWidthCm(event.currentTarget.value)}
                    />
                    <Input
                      id="package-height"
                      label="Alto"
                      inputMode="decimal"
                      value={heightCm}
                      onChange={(event) => setHeightCm(event.currentTarget.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className={cn(formLayout.saveMeasure, styles.saveMeasureRight)}
                    onClick={() => undefined}
                  >
                    Guardar medida
                  </button>

                  <div className={styles.totals}>
                    <div className={styles.totalRow}>
                      <span className={styles.totalLabel}>Peso total de artículos/documentos declarados</span>
                      <span className={styles.totalValue}>{formatWeightKg(totalWeightKg)}</span>
                    </div>
                  </div>

                  <Input
                    id="package-weight"
                    label="Peso del paquete (kg)"
                    inputMode="decimal"
                    value={packageWeightKg}
                    onChange={(event) => setPackageWeightKg(event.currentTarget.value)}
                  />

                  {packageError !== null && <Alert tone="danger">{packageError}</Alert>}
                </div>
              </section>
            )}

            {step === 'ORIGEN' && (
              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>Origen</h4>

                {/* Dos columnas (Figma 5470:15275): campos a la izquierda, mapa
                    de la sucursal a la derecha, misma altura. `originContainer`
                    mide el ancho real disponible (no el viewport) para decidir
                    cuándo apilar en una sola columna. */}
                <div className={styles.originContainer}>
                  <div className={styles.originLayout}>
                    <div className={styles.fields}>
                      <div className={styles.originSubsection}>
                        <h5 className={styles.originSubsectionTitle}>Remitente</h5>
                        <p className={styles.hint}>
                          Si no encuentran al destinatario o no pueden entregar el paquete, lo enviamos a este
                          domicilio.
                        </p>

                        <Select
                          id="origin-remitente"
                          label="Remitente"
                          className={styles.originField}
                          options={SAVED_ORIGIN_ADDRESSES}
                          value={originRemitenteId}
                          onChange={(event) => setOriginRemitenteId(event.currentTarget.value)}
                        />
                      </div>

                      <div className={styles.originSubsection}>
                        <h5 className={styles.originSubsectionTitle}>Sucursal de origen</h5>

                        <Select
                          id="origin-province"
                          label="Provincia"
                          className={styles.originField}
                          options={PROVINCE_OPTIONS}
                          value={originProvinceCode}
                          onChange={(event) => {
                            setOriginProvinceCode(event.currentTarget.value)
                            setOriginBranchCode('-1')
                          }}
                        />

                        <Select
                          id="origin-branch"
                          label="Sucursal de origen"
                          className={styles.originField}
                          options={originBranchOptions}
                          value={originBranchCode}
                          disabled={originBranchOptions.length === 0}
                          onChange={(event) => setOriginBranchCode(event.currentTarget.value)}
                        />
                      </div>
                    </div>

                    {/* Placeholder: el mapa de la sucursal se resuelve en otra etapa. */}
                    <div className={styles.mapPlaceholder} aria-hidden="true" />
                  </div>
                </div>
              </section>
            )}

            {step === 'DESTINO' && (
              <>
                {/* Destinatario (Figma 5589:10467). Orden de campos: ver comentario
                    en DestinatarioFields. */}
                <section className={cn(styles.section, styles.narrowSection)}>
                  <h4 className={styles.sectionTitle}>Destinatario</h4>
                  <DestinatarioFields
                    values={destinatario}
                    onChange={handleDestinatarioChange}
                    phoneCountryCodeOptions={PHONE_COUNTRY_CODES}
                  />
                </section>

                {/* Destino: domicilio de entrega. País precargado desde
                    Declaración, no editable (doc funcional §8.4). */}
                <section className={cn(styles.section, styles.narrowSection)}>
                  <DestinoFields
                    orderNumber={destinationOrderNumber}
                    onOrderNumberChange={setDestinationOrderNumber}
                    destinationCountryLabel={destinationCountryLabel}
                    province={destinationProvince}
                    onProvinceChange={setDestinationProvince}
                    city={destinationCity}
                    onCityChange={setDestinationCity}
                    postalCode={destinationPostalCode}
                    onPostalCodeChange={setDestinationPostalCode}
                    addressLines={destinationAddressLines}
                    onAddressLineChange={handleAddressLineChange}
                    onAddAddressLine={handleAddAddressLine}
                    onRemoveAddressLine={handleRemoveAddressLine}
                  />
                </section>

                {/* Servicio postal: se elige al final de Destino (doc funcional
                    §9.1), nunca en Paquete ni en Origen. */}
                <section className={cn(styles.section, styles.narrowSection)}>
                  <h4 className={styles.sectionTitle}>Servicio postal</h4>
                  <div className={styles.postalServiceList}>
                    {INTERNATIONAL_SERVICES.map((service) => (
                      <PostalServiceCard
                        key={service}
                        name="postal-service"
                        value={service}
                        label={POSTAL_SERVICE_LABELS[service]}
                        description={POSTAL_SERVICE_DELIVERY_TIMES[service]}
                        selected={selectedService === service}
                        onSelect={(value) => setSelectedService(value as InternationalService)}
                      />
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>

        {/* Columna derecha: switch de alcance + panel de resumen internacional.
            Un único bloque para los 4 pasos (Declaración/Paquete/Origen/Destino):
            sólo cambia `currentStep` adentro de `InternationalSummary`. */}
        <div className={layout.resumen}>
          <div className={layout.resumenCenter}>
            <div className={cn(layout.infoRe, styles.resumenMinWidth)}>
              <ScopeSwitch
                className={cn(layout.scopeSwitch, styles.scopeSwitchDesktopOnly)}
                value="internacional"
                onChange={(scope) => {
                  if (scope === 'nacional') navigate('/')
                }}
              />

              <InternationalSummary
                currentStep={STEP_LABELS[step]}
                /* El pago se habilita al elegir servicio postal (paso Destino),
                   misma regla que el flujo nacional. */
                onPay={selectedService === null ? undefined : () => navigate('/checkout')}
              />
            </div>
          </div>
        </div>

        {/* Cancelar / Atrás / Siguiente */}
        <div className={layout.navActions}>
          <div className={layout.navActionsInner}>
            <div className={layout.navActionsStart}>
              <Button variant="tertiary" onClick={() => navigate('/')}>
                Cancelar
              </Button>
            </div>
            <div className={layout.navActionsEnd}>
              {step === 'PAQUETE' && (
                <Button variant="secondary" size="step" onClick={() => setStep('DECLARACION')}>
                  Atrás
                </Button>
              )}
              {step === 'ORIGEN' && (
                <Button variant="secondary" size="step" onClick={() => setStep('PAQUETE')}>
                  Atrás
                </Button>
              )}
              {step === 'DESTINO' && (
                <Button variant="secondary" size="step" onClick={() => setStep('ORIGEN')}>
                  Atrás
                </Button>
              )}
              <Button
                variant="primary"
                size="step"
                onClick={
                  step === 'DECLARACION'
                    ? handleNext
                    : step === 'PAQUETE'
                      ? handleNextFromPackage
                      : step === 'ORIGEN'
                        ? () => setStep('DESTINO')
                        : () => undefined
                }
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AddArticleModal
        isOpen={isArticleModalOpen}
        onClose={() => setArticleModalOpen(false)}
        kind={articleKind}
        onSubmit={(input) => {
          const article: DeclaredArticle = {
            ...input,
            id: crypto.randomUUID(),
          }
          setArticles((current) => [...current, article])
        }}
      />
    </PageContainer>
  )
}
