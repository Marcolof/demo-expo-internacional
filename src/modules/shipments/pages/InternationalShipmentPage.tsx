import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { COUNTRIES } from '@/shared/lib/countries'
import type { SelectOption } from '@/core/types/common'
import { PageContainer } from '@/shared/layout/PageContainer'
import { formatDimensionsCm, formatUsd, formatWeightKg } from '@/shared/lib/formatCurrency'
import { useStepFlow } from '@/shared/hooks/useStepFlow'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { RadioGroup } from '@/shared/ui/Checkbox/RadioGroup'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Switch } from '@/shared/ui/Switch'
import { Tabs } from '@/shared/ui/Tabs'
import { ScopeSwitch } from '../components/ScopeSwitch'
import { INTERNATIONAL_STEPS, InternationalSummary } from '../components/InternationalSummary'
import { AddArticleModal } from '../components/AddArticleModal'
import { ArticleAccordionItem } from '../components/ArticleAccordionItem'
import { AduanaConfirmModal } from '../components/AduanaConfirmModal'
import { BranchMap } from '../components/BranchMap'
import { articleTotalPriceUsd, articleTotalWeightKg } from '../types/article.types'
import type { DeclaredArticle } from '../types/article.types'
import { DECLARED_ARTICLES_SEED } from '../mocks/articles.mocks'
import { COUNTRY_CONTENT_RESTRICTIONS } from '../mocks/country-restrictions.mocks'
import { REMITENTES_SEED } from '../mocks/remitentes.mocks'
import { PROVINCE_OPTIONS, getBranchOptions, findBranch, BRANCHES_BY_PROVINCE } from '../mocks/branches.mocks'
import { FREQUENT_MEASURE_OPTIONS } from '../mocks/shipments.mocks'
import packageOpenIcon from '@/assets/icons/package-open.svg'
import layout from './NewShipmentPage.module.css'
import styles from './InternationalShipmentPage.module.css'

/** Doc funcional §7.2: con más de 2 kg declarados, sólo sucursales con asiento aduanero. */
const CUSTOMS_OFFICE_REQUIRED_OVER_KG = 2

/** Países sin servicio de envío internacional disponible (maqueta). */
const COUNTRIES_WITHOUT_SHIPPING: ReadonlySet<string> = new Set(['RU', 'CU', 'KP'])

const NON_COMMERCIAL_CATEGORIES: readonly SelectOption[] = [
  { value: 'REGALO', label: 'Regalo' },
  { value: 'DOCUMENTO', label: 'Documento' },
  { value: 'MUESTRA', label: 'Muestra comercial' },
  { value: 'AYUDA_FAMILIAR', label: 'Ayuda familiar' },
]

const COMMERCIAL_CATEGORY_VALUE = 'MERCADERIA'

const COMMERCIAL_CATEGORIES: readonly SelectOption[] = [
  { value: COMMERCIAL_CATEGORY_VALUE, label: 'Envío de mercadería' },
]

const PHONE_CODE_OPTIONS: readonly SelectOption[] = [
  { value: '+54',  label: '+54 (Argentina)' },
  { value: '+1',   label: '+1 (EE.UU.)' },
  { value: '+55',  label: '+55 (Brasil)' },
  { value: '+56',  label: '+56 (Chile)' },
  { value: '+598', label: '+598 (Uruguay)' },
  { value: '+34',  label: '+34 (España)' },
  { value: '+52',  label: '+52 (México)' },
  { value: '+30',  label: '+30 (Grecia)' },
  { value: '+7',   label: '+7 (Rusia)' },
  { value: '+53',  label: '+53 (Cuba)' },
]

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
  const length = Number(lengthCm.replace(',', '.'))
  const width = Number(widthCm.replace(',', '.'))
  const height = Number(heightCm.replace(',', '.'))

  const hasValidMeasures =
    lengthCm.trim() !== '' &&
    widthCm.trim() !== '' &&
    heightCm.trim() !== '' &&
    Number.isFinite(length) && Number.isFinite(width) && Number.isFinite(height) &&
    length > 0 && width > 0 && height > 0

  if (!hasValidMeasures) {
    return 'Completá el largo, el ancho y el alto del paquete para continuar.'
  }

  const oversizedSides = [length, width, height].filter((side) => side > PACKAGE_MAX_SIDE_CM).length
  if (oversizedSides > PACKAGE_MAX_OVERSIZED_SIDES) {
    return `Al menos dos lados del paquete superan los ${PACKAGE_MAX_SIDE_CM} cm. Revisá las medidas para continuar.`
  }

  const weight = Number(packageWeightKg.replace(',', '.'))
  const hasValidWeight = packageWeightKg.trim() !== '' && Number.isFinite(weight) && weight > 0
  if (!hasValidWeight) {
    return 'Completá el peso del paquete para continuar.'
  }

  if (weight < declaredContentWeightKg) {
    return 'El peso total del paquete no puede ser menor al peso del contenido declarado.'
  }

  if (weight > PACKAGE_MAX_WEIGHT_KG) {
    return `El peso del paquete supera el máximo permitido (${PACKAGE_MAX_WEIGHT_KG} kg) para envíos internacionales.`
  }

  return null
}

function validateDestinoFields(params: {
  recipientName: string
  recipientPhone: string
  recipientEmail: string
  recipientTaxId: string
  commercial: boolean
  facturaE: string
  destinoState: string
  destinoCity: string
  destinoPostalCode: string
  destinoAddressLines: readonly string[]
  aduanaRepresentation: boolean
  representanteName: string
  representanteCuil: string
}): ReadonlySet<string> {
  const errors = new Set<string>()
  if (!params.recipientName.trim()) errors.add('recipientName')
  if (!params.recipientPhone.trim()) errors.add('recipientPhone')
  if (!params.recipientEmail.trim()) errors.add('recipientEmail')
  if (!params.recipientTaxId.trim()) errors.add('recipientTaxId')
  if (params.commercial && !params.facturaE.trim()) errors.add('facturaE')
  if (!params.destinoState.trim()) errors.add('destinoState')
  if (!params.destinoCity.trim()) errors.add('destinoCity')
  if (!params.destinoPostalCode.trim()) errors.add('destinoPostalCode')
  if (!(params.destinoAddressLines[0]?.trim())) errors.add('destinoAddress0')
  if (!params.aduanaRepresentation && !params.representanteName.trim()) errors.add('representanteName')
  if (!params.aduanaRepresentation && !params.representanteCuil.trim()) errors.add('representanteCuil')
  return errors
}

const REMITENTE_OPTIONS: readonly SelectOption[] = REMITENTES_SEED.map((r) => ({
  value: r.cuit,
  label: `${r.razonSocial} | ${r.direccionRemitente}`,
}))

const ADDRESS_LINE_MAX = 90

function MinusCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
    </svg>
  )
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

function PlusCircleIcon() {
  return (
    <svg
      className={styles.addLineBtnIcon}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12ZM11 16V13H8C7.44772 13 7 12.5523 7 12C7 11.4477 7.44772 11 8 11H11V8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8V11H16C16.5523 11 17 11.4477 17 12C17 12.5523 16.5523 13 16 13H13V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16ZM23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12Z"
        fill="var(--correo-yellow)"
      />
    </svg>
  )
}

export function InternationalShipmentPage() {
  const navigate = useNavigate()
  const {
    current: currentStep,
    currentIndex,
    unlocked,
    goTo,
    next,
    back,
  } = useStepFlow(INTERNATIONAL_STEPS, 'Declaración')

  /* ── Paso 1: Declaración ─────────────────────────────────────────── */
  const [country, setCountry] = useState('-1')
  const [commercial, setCommercial] = useState(false)
  const [category, setCategory] = useState('REGALO')
  const [declarationAccepted, setDeclarationAccepted] = useState(false)
  const [declarationError, setDeclarationError] = useState(false)
  const [articles, setArticles] = useState<readonly DeclaredArticle[]>(DECLARED_ARTICLES_SEED)
  const [isArticleModalOpen, setArticleModalOpen] = useState(false)

  /* ── Paso 2: Paquete ─────────────────────────────────────────────── */
  const [frequentMeasureId, setFrequentMeasureId] = useState('-1')
  const [lengthCm, setLengthCm] = useState('')
  const [widthCm, setWidthCm] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [packageWeightKg, setPackageWeightKg] = useState('')
  const [packageError, setPackageError] = useState<string | null>(null)

  /* ── Paso 3: Origen ──────────────────────────────────────────────── */
  const [remitenteCuit, setRemitenteCuit] = useState(REMITENTES_SEED[0]?.cuit ?? '')
  const [province, setProvince] = useState('BA')
  const [branchId, setBranchId] = useState('BA-001')

  /* ── Paso 4: Destino ─────────────────────────────────────────────── */
  const [recipientName, setRecipientName]               = useState('Juan Perez')
  const [recipientRazonSocial, setRecipientRazonSocial] = useState('Logística ecuatorial')
  const [recipientPhoneCode, setRecipientPhoneCode]     = useState('+30')
  const [recipientPhone, setRecipientPhone]             = useState('1234567B')
  const [recipientEmail, setRecipientEmail]             = useState('ecuatorlogistic@eculogi.com')
  const [recipientTaxId, setRecipientTaxId]             = useState('123456789001213123')
  const [facturaE, setFacturaE]                         = useState('00001-00000108')
  const [destinoState, setDestinoState]                 = useState('')
  const [destinoCity, setDestinoCity]                   = useState('Houston')
  const [destinoPostalCode, setDestinoPostalCode]       = useState('77001')
  const [destinoAddressLines, setDestinoAddressLines]   = useState<string[]>(['901 Bagby st. Tower golden 9°D'])
  const [destinoOrderNum, setDestinoOrderNum]           = useState('')
  const [aduanaRepresentation, setAduanaRepresentation] = useState(true)
  const [aduanaModalOpen, setAduanaModalOpen]           = useState(false)
  const [representanteName, setRepresentanteName]       = useState('Juan Perez')
  const [representanteCuil, setRepresentanteCuil]       = useState('20.31211156.3')
  const [shippingService, setShippingService]           = useState<'EMS' | 'ENCOMIENDA' | 'PEQUENO_PAQUETE' | 'EMS_DOCUMENTACION' | null>('EMS')
  const [step4Errors, setStep4Errors]                   = useState<ReadonlySet<string>>(new Set())

  /* ── Derivados ───────────────────────────────────────────────────── */
  const categoryOptions = commercial ? COMMERCIAL_CATEGORIES : NON_COMMERCIAL_CATEGORIES

  const setCommercialAndCategory = (next: boolean) => {
    setCommercial(next)
    setCategory(next ? COMMERCIAL_CATEGORY_VALUE : 'REGALO')
    // Los artículos se conservan en ambos modos; el seed se carga solo al montar
  }

  const selectedCountry = COUNTRIES.find((c) => c.value === country)
  const countryHasShipping = country === '-1' || !COUNTRIES_WITHOUT_SHIPPING.has(country)

  const clearError = (key: string) =>
    setStep4Errors((prev) => { const s = new Set(prev); s.delete(key); return s })

  const runDestinoValidation = () =>
    validateDestinoFields({
      recipientName, recipientPhone, recipientEmail, recipientTaxId,
      commercial, facturaE,
      destinoState, destinoCity, destinoPostalCode, destinoAddressLines,
      aduanaRepresentation, representanteName, representanteCuil,
    })

  const canAddArticle = country !== '-1' && category !== '-1' && countryHasShipping

  const restrictedIds = useMemo(() => {
    const ids = COUNTRY_CONTENT_RESTRICTIONS[country] ?? []
    return new Set(ids)
  }, [country])

  const totalArticles = articles.length
  const totalValueUsd = articles.reduce((sum, a) => sum + articleTotalPriceUsd(a), 0)
  const totalWeightKg = articles.reduce((sum, a) => sum + articleTotalWeightKg(a), 0)
  const categoryLabel = categoryOptions.find((o) => o.value === category)?.label

  const removeArticle = (article: DeclaredArticle) => {
    setArticles((current) => current.filter((item) => item.id !== article.id))
  }

  const hasMeasures = lengthCm !== '' && widthCm !== '' && heightCm !== ''
  const measuresLabel = hasMeasures
    ? formatDimensionsCm(
        Number(lengthCm.replace(',', '.'))  || 0,
        Number(widthCm.replace(',', '.'))   || 0,
        Number(heightCm.replace(',', '.'))  || 0,
      )
    : undefined
  const weightLabel =
    packageWeightKg === ''
      ? undefined
      : formatWeightKg(Number(packageWeightKg.replace(',', '.')) || 0)

  /* Paso 3 */
  const selectedRemitente =
    REMITENTES_SEED.find((r) => r.cuit === remitenteCuit) ?? REMITENTES_SEED[0]
  const branchOptions     = getBranchOptions(province)
  const provinceBranches  = BRANCHES_BY_PROVINCE[province] ?? []
  const selectedBranch    = findBranch(branchId)

  const handleProvinceChange = (value: string) => {
    setProvince(value)
    setBranchId('-1')
  }

  const handleNext = () => {
    if (currentStep === 'Declaración') {
      if (!declarationAccepted) { setDeclarationError(true); return }
      if (!countryHasShipping) return
      setDeclarationError(false)
    }

    if (currentStep === 'Paquete') {
      const error = validatePackageStep(lengthCm, widthCm, heightCm, packageWeightKg, totalWeightKg)
      setPackageError(error)
      if (error !== null) return
    }

    if (currentStep === 'Destino') {
      const errors = runDestinoValidation()
      if (errors.size > 0) { setStep4Errors(errors); return }
      setStep4Errors(new Set())
      navigate('/propuesta/mis-envios')
      return
    }

    next()
  }

  /* Paso 4 */
  const destinoCountryLabel = selectedCountry?.label

  return (
    <PageContainer width="full">
      <div className={layout.prin}>
        {/* Columna izquierda: formulario */}
        <div className={layout.carga}>
          <h3 className={layout.title}>Nuevo envío | Paquetería</h3>

          <Tabs
            items={[
              { id: 'individual', label: 'Individual' },
              { id: 'masivo', label: 'Masivo', to: '/internacional/masivo' },
            ]}
            activeId="individual"
            onChange={() => {}}
            className={layout.loadTabs}
          />

          {/* ── Paso 1: Declaración ───────────────────────────────── */}
          {currentStep === 'Declaración' && (
            <div className={styles.form}>
              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>Seleccioná el país de destino</h4>
                <Select
                  id="destination-country"
                  label="País de destino"
                  options={COUNTRIES}
                  value={country}
                  onChange={(event) => setCountry(event.currentTarget.value)}
                />
                {country !== '-1' && !countryHasShipping && (
                  <Alert tone="danger">
                    El país seleccionado no está disponible para envíos internacionales.
                  </Alert>
                )}
              </section>

              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>Declaración jurada de contenido</h4>

                <div className={styles.fields}>
                  <Switch
                    id="commercial-purpose"
                    label="Envío con fines comerciales"
                    description="Solo disponible desde sucursales con asiento aduanero."
                    checked={commercial}
                    onChange={setCommercialAndCategory}
                    labelPosition="left"
                  />

                  <p className={styles.hint}>Detallá la categoría del envío y el contenido del paquete.</p>

                  <Select
                    id="shipment-category"
                    label="Categoría de envío"
                    options={categoryOptions}
                    value={category}
                    onChange={(event) => setCategory(event.currentTarget.value)}
                    disabled={commercial}
                  />

                  <button
                    type="button"
                    className={cn(styles.addArticle, canAddArticle && styles.addArticleEnabled)}
                    disabled={!canAddArticle}
                    onClick={() => setArticleModalOpen(true)}
                  >
                    <PlusIcon />
                    Agregar artículo
                  </button>

                  {articles.length === 0 ? (
                    <EmptyState title="Acá vas a ver los artículos que agregues" iconSrc={packageOpenIcon} />
                  ) : (
                    <div className={styles.articleList}>
                      {articles.map((article, index) => (
                        <ArticleAccordionItem
                          key={article.id}
                          article={article}
                          onRemove={removeArticle}
                          defaultOpen={index === articles.length - 1}
                          invalid={restrictedIds.has(article.id)}
                        />
                      ))}
                    </div>
                  )}

                  <div className={styles.totals}>
                    <div className={styles.totalRow}>
                      <span className={styles.totalLabel}>Cantidad de artículos</span>
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

                  {restrictedIds.size > 0 && articles.some((a) => restrictedIds.has(a.id)) && (
                    <Alert tone="danger">
                      El contenido declarado no está permitido para envíos con destino a{' '}
                      {destinoCountryLabel ?? 'el país seleccionado'}. Para continuar, deberás
                      eliminarlo o modificar la declaración del contenido.
                    </Alert>
                  )}

                  <Checkbox
                    id="declaration-accepted"
                    label="Confirmo que la información ingresada en esta declaración jurada es correcta y completa."
                    checked={declarationAccepted}
                    onChange={(v) => { setDeclarationAccepted(v); if (v) setDeclarationError(false) }}
                  />

                  {declarationError && (
                    <Alert tone="danger">
                      Debés aceptar la Declaración Jurada para continuar.
                    </Alert>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* ── Paso 2: Paquete ───────────────────────────────────── */}
          {currentStep === 'Paquete' && (
            <div className={styles.form}>
              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>Medidas del paquete (cm)</h4>

                <div className={styles.fields}>
                  <Select
                    id="package-frequent-measure"
                    label="Medidas frecuentes"
                    options={FREQUENT_MEASURE_OPTIONS}
                    value={frequentMeasureId}
                    onChange={(event) => setFrequentMeasureId(event.currentTarget.value)}
                  />

                  <div className={styles.measuresRow}>
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

                  <div className={styles.saveMeasureRow}>
                    <button type="button" className={styles.saveMeasure}>
                      Guardar medida
                    </button>
                  </div>

                  <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>Peso total de artículos/documentos declarados</span>
                    <span className={styles.totalValue}>{formatWeightKg(totalWeightKg)}</span>
                  </div>

                  <Input
                    id="package-weight"
                    label="Peso del paquete (kg)"
                    inputMode="decimal"
                    value={packageWeightKg}
                    onChange={(event) => { setPackageWeightKg(event.currentTarget.value); setPackageError(null) }}
                    invalid={packageError !== null}
                  />

                  {packageError !== null && (
                    <Alert tone="danger">{packageError}</Alert>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* ── Paso 3: Origen ───────────────────────────────────── */}
          {currentStep === 'Origen' && (
            <div className={styles.origenLayout}>
              <div className={styles.origenForm}>
                <section className={styles.section}>
                  <h4 className={styles.sectionTitle}>Origen</h4>

                  <div className={styles.fields}>
                    <div className={styles.subsection}>
                      <p className={styles.subsectionTitle}>Remitente</p>
                      <p className={styles.fieldNote}>
                        Si no encuentran al destinatario o no pueden entregar el paquete,
                        lo enviamos a este domicilio.
                      </p>
                      <Select
                        id="remitente"
                        label="Remitente"
                        options={REMITENTE_OPTIONS}
                        value={remitenteCuit}
                        onChange={(event) => setRemitenteCuit(event.currentTarget.value)}
                      />
                    </div>

                    <div className={styles.subsection}>
                      <p className={styles.subsectionTitle}>Sucursal de origen</p>
                      <p className={styles.fieldNote}>
                        Para envíos con fines comerciales o con más de {CUSTOMS_OFFICE_REQUIRED_OVER_KG} kg declarados
                        solo se mostrarán sucursales con asiento aduanero.
                      </p>
                      <Select
                        id="province"
                        label="Provincia"
                        options={PROVINCE_OPTIONS}
                        value={province}
                        onChange={(event) => handleProvinceChange(event.currentTarget.value)}
                      />
                      <Select
                        id="branch"
                        label="Sucursal de origen"
                        options={branchOptions}
                        value={branchId}
                        onChange={(event) => setBranchId(event.currentTarget.value)}
                        disabled={province === '-1'}
                      />
                    </div>
                  </div>
                </section>
              </div>

              <div className={styles.origenMap}>
                <BranchMap
                  branches={provinceBranches}
                  selectedBranchId={branchId !== '-1' ? branchId : undefined}
                />
                {selectedBranch !== undefined && (
                  <p className={styles.branchAddress}>{selectedBranch.address}</p>
                )}
              </div>
            </div>
          )}

          {/* ── Paso 4: Destino ───────────────────────────────────── */}
          {currentStep === 'Destino' && (
            <div className={styles.form}>
              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>Destinatario</h4>

                <div className={styles.fields}>
                  <div className={styles.twoColRow}>
                    <Input
                      id="recipient-name"
                      label="Nombre y apellido"
                      value={recipientName}
                      onChange={(e) => { setRecipientName(e.currentTarget.value); clearError('recipientName') }}
                      invalid={step4Errors.has('recipientName')}
                      hint={step4Errors.has('recipientName') ? 'Campo requerido' : undefined}
                    />
                    <Input
                      id="recipient-razon"
                      label="Razón social"
                      value={recipientRazonSocial}
                      onChange={(e) => setRecipientRazonSocial(e.currentTarget.value)}
                    />
                  </div>

                  <div className={styles.twoColRow}>
                    <Select
                      id="recipient-phone-code"
                      label="Código de país"
                      options={PHONE_CODE_OPTIONS}
                      value={recipientPhoneCode}
                      onChange={(e) => setRecipientPhoneCode(e.currentTarget.value)}
                    />
                    <Input
                      id="recipient-phone"
                      label="Número de teléfono"
                      inputMode="tel"
                      value={recipientPhone}
                      onChange={(e) => { setRecipientPhone(e.currentTarget.value); clearError('recipientPhone') }}
                      invalid={step4Errors.has('recipientPhone')}
                      hint={step4Errors.has('recipientPhone') ? 'Campo requerido' : undefined}
                    />
                  </div>

                  <Input
                    id="recipient-email"
                    label="Correo electrónico"
                    inputMode="email"
                    value={recipientEmail}
                    onChange={(e) => { setRecipientEmail(e.currentTarget.value); clearError('recipientEmail') }}
                    invalid={step4Errors.has('recipientEmail')}
                    hint={step4Errors.has('recipientEmail') ? 'Campo requerido' : undefined}
                  />

                  <Input
                    id="recipient-tax-id"
                    label="Identificación tributaria del destinatario"
                    value={recipientTaxId}
                    onChange={(e) => { setRecipientTaxId(e.currentTarget.value); clearError('recipientTaxId') }}
                    invalid={step4Errors.has('recipientTaxId')}
                    hint={step4Errors.has('recipientTaxId') ? 'Campo requerido' : 'Ingresá el número fiscal del destinatario'}
                  />

                  {commercial && (
                    <Input
                      id="factura-e"
                      label="Factura E"
                      value={facturaE}
                      onChange={(e) => { setFacturaE(e.currentTarget.value); clearError('facturaE') }}
                      invalid={step4Errors.has('facturaE')}
                      hint={step4Errors.has('facturaE') ? 'Campo requerido' : 'La factura debe corresponder al envío completo.'}
                    />
                  )}
                </div>
              </section>

              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>Destino</h4>

                <div className={styles.fields}>
                  <Input
                    id="destino-country-display"
                    label="País de destino seleccionado"
                    value={destinoCountryLabel ?? ''}
                    onChange={() => {}}
                    disabled
                  />

                  <Input
                    id="destino-state"
                    label="Provincia / estado"
                    value={destinoState}
                    onChange={(e) => { setDestinoState(e.currentTarget.value); clearError('destinoState') }}
                    invalid={step4Errors.has('destinoState')}
                    hint={step4Errors.has('destinoState') ? 'Campo requerido' : undefined}
                  />

                  <div className={styles.twoColRow}>
                    <Input
                      id="destino-city"
                      label="Ciudad"
                      value={destinoCity}
                      onChange={(e) => { setDestinoCity(e.currentTarget.value); clearError('destinoCity') }}
                      invalid={step4Errors.has('destinoCity')}
                      hint={step4Errors.has('destinoCity') ? 'Campo requerido' : undefined}
                    />
                    <Input
                      id="destino-postal"
                      label="Código postal"
                      value={destinoPostalCode}
                      onChange={(e) => { setDestinoPostalCode(e.currentTarget.value); clearError('destinoPostalCode') }}
                      invalid={step4Errors.has('destinoPostalCode')}
                      hint={step4Errors.has('destinoPostalCode') ? 'Campo requerido' : undefined}
                    />
                  </div>

                  <div className={styles.addressSection}>
                    <p className={styles.subsectionTitle}>Dirección</p>
                    <p className={styles.fieldNote}>
                      Ingresá la dirección de entrega tal como debe figurar en el envío. Incluí
                      calle, número y datos adicionales como piso, departamento, torre o edificio.
                    </p>

                    {destinoAddressLines.map((line, index) => (
                      <div key={index} className={styles.addressLineGroup}>
                        <div className={styles.addressLineRow}>
                          <div className={styles.addressLineInput}>
                            <Input
                              id={`destino-address-${index}`}
                              label={`Línea ${index + 1} de dirección`}
                              value={line}
                              onChange={(e) => {
                                const next = [...destinoAddressLines]
                                next[index] = e.currentTarget.value.slice(0, ADDRESS_LINE_MAX)
                                setDestinoAddressLines(next)
                                if (index === 0) clearError('destinoAddress0')
                              }}
                              invalid={index === 0 && step4Errors.has('destinoAddress0')}
                              hint={index === 0 && step4Errors.has('destinoAddress0') ? 'Campo requerido' : undefined}
                            />
                          </div>
                          {index > 0 && (
                            <button
                              type="button"
                              className={styles.removeLineBtn}
                              onClick={() => setDestinoAddressLines((prev) => prev.filter((_, i) => i !== index))}
                              aria-label={`Eliminar línea ${index + 1}`}
                            >
                              <MinusCircleIcon />
                            </button>
                          )}
                        </div>
                        <span className={styles.addressLineHint}>
                          Caracteres {line.length}/{ADDRESS_LINE_MAX}
                        </span>
                      </div>
                    ))}

                    {destinoAddressLines.length < 3 && (
                      <button
                        type="button"
                        className={styles.addLineBtn}
                        onClick={() => setDestinoAddressLines((prev) => [...prev, ''])}
                      >
                        <PlusCircleIcon />
                        Agregar otra línea de dirección
                      </button>
                    )}
                  </div>

                  <Input
                    id="destino-order"
                    label="N° de orden (opcional)"
                    value={destinoOrderNum}
                    onChange={(e) => setDestinoOrderNum(e.currentTarget.value)}
                  />
                </div>
              </section>

              <section className={styles.section}>
                <Switch
                  id="aduana-representation"
                  label="Representación ante Aduana"
                  description="Acepto que en caso de ser necesario, Correo Argentino me representa ante Aduana para la gestión de este envío."
                  checked={aduanaRepresentation}
                  onChange={(next) => {
                    if (!next) {
                      setAduanaModalOpen(true)
                    } else {
                      setAduanaRepresentation(true)
                    }
                  }}
                  labelPosition="left"
                />

                {!aduanaRepresentation && (
                  <div className={styles.subsection}>
                    <p className={styles.subsectionTitle}>Designá un representante</p>
                    <p className={styles.fieldNote}>
                      Como la representación de Correo Argentino ante aduana está deshabilitada,
                      es necesario tener un representante en su lugar introduciendo su nombre,
                      apellido y CUIL/CUIT:
                    </p>
                    <Input
                      id="representante-name"
                      label="Nombre y apellido del representante"
                      value={representanteName}
                      onChange={(e) => { setRepresentanteName(e.currentTarget.value); clearError('representanteName') }}
                      invalid={step4Errors.has('representanteName')}
                      hint={step4Errors.has('representanteName') ? 'Campo requerido' : undefined}
                    />
                    <Input
                      id="representante-cuil"
                      label="CUIL/CUIT representante"
                      value={representanteCuil}
                      onChange={(e) => { setRepresentanteCuil(e.currentTarget.value); clearError('representanteCuil') }}
                      invalid={step4Errors.has('representanteCuil')}
                      hint={step4Errors.has('representanteCuil') ? 'Campo requerido' : undefined}
                    />
                  </div>
                )}
              </section>

              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>Servicio Postal</h4>
                <p className={styles.fieldNote}>Disponible según destino y peso declarado</p>

                <RadioGroup
                  name="shipping-service"
                  value={shippingService}
                  onChange={setShippingService}
                  options={[
                    {
                      value: 'EMS' as const,
                      label: 'EMS Paquetería',
                      description: 'Entrega estimada entre 2 y 8 días hábiles, según el destino.',
                      trailing: <span className={styles.servicePrice}>$15.000,00</span>,
                    },
                    {
                      value: 'ENCOMIENDA' as const,
                      label: 'Encomienda Internacional',
                      description: 'Entrega estimada entre 7 y 21 días hábiles, según el destino.',
                      trailing: <span className={styles.servicePrice}>$10.000,00</span>,
                    },
                    {
                      value: 'PEQUENO_PAQUETE' as const,
                      label: 'Pequeño Paquete',
                      description: 'Entrega estimada entre 10 y 30 días hábiles, según el destino.',
                      trailing: <span className={styles.servicePrice}>$7.500,00</span>,
                    },
                    {
                      value: 'EMS_DOCUMENTACION' as const,
                      label: 'EMS Documentación',
                      description: 'Solo para documentos. Entrega estimada entre 2 y 8 días hábiles.',
                      trailing: <span className={styles.servicePrice}>$8.000,00</span>,
                    },
                  ]}
                />
              </section>
            </div>
          )}
        </div>

        {/* Columna derecha: switch de alcance + resumen */}
        <div className={layout.resumen}>
          <div className={layout.resumenCenter}>
            <div className={layout.infoRe}>
              <ScopeSwitch
                className={layout.scopeSwitch}
                value="internacional"
                onChange={(scope) => {
                  if (scope === 'nacional') navigate('/')
                }}
              />

              <InternationalSummary
                currentStep={currentStep}
                unlockedSteps={unlocked}
                onStepClick={goTo}
                declaracion={{ categoryLabel, totalArticles, totalValueUsd, totalWeightKg }}
                paquete={{ measuresLabel, weightLabel }}
                origen={selectedRemitente}
                destino={{
                  countryLabel: destinoCountryLabel,
                  city: destinoCity || undefined,
                  address: destinoAddressLines[0] || undefined,
                }}
                onPay={
                  currentStep === 'Destino' && runDestinoValidation().size === 0
                    ? () => navigate('/checkout')
                    : undefined
                }
              />
            </div>
          </div>
        </div>

        {/* Cancelar / Atrás / Siguiente|Guardar */}
        <div className={layout.navActions}>
          <div className={layout.navActionsInner}>
            <div className={layout.navActionsStart}>
              <Button variant="tertiary" onClick={() => navigate('/')}>
                Cancelar
              </Button>
            </div>
            <div className={layout.navActionsEnd}>
              {currentIndex > 0 && (
                <Button variant="secondary" size="step" onClick={back}>
                  Atrás
                </Button>
              )}
              <Button
                variant="primary"
                size="step"
                onClick={handleNext}
              >
                {currentStep === 'Destino' ? 'Guardar' : 'Siguiente'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AduanaConfirmModal
        isOpen={aduanaModalOpen}
        onKeep={() => {
          setAduanaRepresentation(true)
          setAduanaModalOpen(false)
        }}
        onConfirm={() => {
          setAduanaRepresentation(false)
          setAduanaModalOpen(false)
        }}
      />

      <AddArticleModal
        isOpen={isArticleModalOpen}
        onClose={() => setArticleModalOpen(false)}
        onSubmit={(input) => {
          const article: DeclaredArticle = { ...input, id: crypto.randomUUID() }
          setArticles((current) => [...current, article])
        }}
      />
    </PageContainer>
  )
}
