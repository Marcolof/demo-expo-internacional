import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { COUNTRIES } from '@/shared/lib/countries'
import type { SelectOption } from '@/core/types/common'
import { PageContainer } from '@/shared/layout/PageContainer'
import { formatAmountOnly, formatDimensionsCm, formatUsd, formatWeightKg } from '@/shared/lib/formatCurrency'
import { formatCuitDotsMask, CUIT_DOTS_PLACEHOLDER } from '@/shared/lib/validators'
import { useStepFlow } from '@/shared/hooks/useStepFlow'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Switch } from '@/shared/ui/Switch'
import { Tabs } from '@/shared/ui/Tabs'
import { InfoTooltip } from '@/shared/ui/Tooltip'
import { ScopeSwitch } from '../components/ScopeSwitch'
import { INTERNATIONAL_STEPS, InternationalSummary } from '../components/InternationalSummary'
import { AddArticleModal } from '../components/AddArticleModal'
import { ArticleAccordionItem } from '../components/ArticleAccordionItem'
import { AduanaConfirmModal } from '../components/AduanaConfirmModal'
import { BranchMap } from '../components/BranchMap'
import { InfoConsiderationsModal } from '../components/InfoConsiderationsModal'
import { PhoneCountryCodeSelect } from '../components/PhoneCountryCodeSelect'
import { PostalServiceCard } from '../components/PostalServiceCard'
import { getCountryGeographicRangeLabel } from '../constants/geographic-ranges'
import {
  ADUANA_WITHOUT_REPRESENTATION_COST_ARS,
  EXPORT_DUTIES_USD,
  PACKAGE_MAX_WEIGHT_KG,
  PACKAGE_MAX_WEIGHT_LABEL,
  PACKAGE_MAX_WEIGHT_TOOLTIP,
} from '../constants/summary-detail.constants'
import { articleTotalPriceUsd, articleTotalWeightKg, ARTICLE_KIND_TEXT } from '../types/article.types'
import type { ArticleKind, DeclaredArticle } from '../types/article.types'
import { DECLARED_ARTICLES_SEED, DECLARED_DOCUMENTS_SEED } from '../mocks/articles.mocks'
import { COUNTRY_CONTENT_RESTRICTIONS } from '../mocks/country-restrictions.mocks'
import { shipmentsStore, wizardStore } from '../stores/session.store'
import type { WizardSnapshot } from '../stores/session.store'
import { REMITENTES_SEED } from '../mocks/remitentes.mocks'
import { PROVINCE_OPTIONS, getBranchOptions, findBranch, BRANCHES_BY_PROVINCE } from '../mocks/branches.mocks'
import { FREQUENT_MEASURE_OPTIONS, PHONE_COUNTRY_CODES } from '../mocks/shipments.mocks'
import packageOpenIcon from '@/assets/icons/package-open.svg'
import layout from './NewShipmentPage.module.css'
import styles from './InternationalShipmentPage.module.css'

/** Doc funcional §7.2: con más de 2 kg declarados, sólo sucursales con asiento aduanero. */
const CUSTOMS_OFFICE_REQUIRED_OVER_KG = 2

/** Países sin servicio de envío internacional disponible (maqueta). */
const COUNTRIES_WITHOUT_SHIPPING: ReadonlySet<string> = new Set(['RU', 'CU', 'KP'])

/** Países que reciben artículos del seed automáticamente al seleccionarlos. */
const AUTO_SEED_COUNTRIES: ReadonlySet<string> = new Set([
  'US',
  ...Object.keys(COUNTRY_CONTENT_RESTRICTIONS),
])

const SHIPPING_SERVICE_LABELS: Record<'EMS' | 'ENCOMIENDA' | 'PEQUENO_PAQUETE' | 'EMS_DOCUMENTACION', string> = {
  EMS: 'EMS Paquetería',
  ENCOMIENDA: 'Encomienda Internacional',
  PEQUENO_PAQUETE: 'Pequeño Paquete',
  EMS_DOCUMENTACION: 'EMS Documentación',
}

const SHIPPING_SERVICE_PRICES_ARS: Record<'EMS' | 'ENCOMIENDA' | 'PEQUENO_PAQUETE' | 'EMS_DOCUMENTACION', number> = {
  EMS: 15000,
  ENCOMIENDA: 10000,
  PEQUENO_PAQUETE: 7500,
  EMS_DOCUMENTACION: 8000,
}

const SHIPPING_SERVICE_TO_POSTAL: Record<'EMS' | 'ENCOMIENDA' | 'PEQUENO_PAQUETE' | 'EMS_DOCUMENTACION', string> = {
  EMS: 'EMS_PAQUETERIA',
  ENCOMIENDA: 'ENCOMIENDA_INTERNACIONAL',
  PEQUENO_PAQUETE: 'PEQUENO_PAQUETE',
  EMS_DOCUMENTACION: 'EMS_DOCUMENTACION',
}

const NON_COMMERCIAL_CATEGORIES: readonly SelectOption[] = [
  { value: 'REGALO', label: 'Regalo' },
  { value: 'DOCUMENTO', label: 'Documento' },
  { value: 'AYUDA_FAMILIAR', label: 'Ayuda familiar' },
]

const COMMERCIAL_CATEGORY_VALUE = 'MERCADERIA'

const COMMERCIAL_CATEGORIES: readonly SelectOption[] = [
  { value: COMMERCIAL_CATEGORY_VALUE, label: 'Envío de mercadería' },
]


const PACKAGE_MAX_SIDE_CM = 90

interface PackageValidationErrors {
  readonly measures?: 'incomplete' | 'oversized'
  readonly weight?: string
}

function validatePackageStep(
  lengthCm: string,
  widthCm: string,
  heightCm: string,
  packageWeightKg: string,
  declaredContentWeightKg: number,
): PackageValidationErrors {
  const errors: { measures?: 'incomplete' | 'oversized'; weight?: string } = {}

  const length = Number(lengthCm.replace(',', '.'))
  const width  = Number(widthCm.replace(',', '.'))
  const height = Number(heightCm.replace(',', '.'))

  const hasValidMeasures =
    lengthCm.trim() !== '' && widthCm.trim() !== '' && heightCm.trim() !== '' &&
    Number.isFinite(length) && Number.isFinite(width) && Number.isFinite(height) &&
    length > 0 && width > 0 && height > 0

  if (!hasValidMeasures) {
    errors.measures = 'incomplete'
  } else if ([length, width, height].some((side) => side > PACKAGE_MAX_SIDE_CM)) {
    errors.measures = 'oversized'
  }

  const weight = Number(packageWeightKg.replace(',', '.'))
  const hasValidWeight = packageWeightKg.trim() !== '' && Number.isFinite(weight) && weight > 0

  if (!hasValidWeight) {
    errors.weight = 'Completá el peso del paquete para continuar.'
  } else if (weight < declaredContentWeightKg) {
    errors.weight = 'El peso total del paquete incluye el contenido y el embalaje. No puede ser menor al peso total del contenido declarado.'
  } else if (weight > PACKAGE_MAX_WEIGHT_KG) {
    errors.weight = `El peso del paquete supera el máximo permitido (${PACKAGE_MAX_WEIGHT_KG} kg) para envíos internacionales.`
  }

  return errors
}

function validateDestinoFields(params: {
  recipientName: string
  recipientPhone: string
  recipientEmail: string
  recipientTaxId: string
  destinoState: string
  destinoCity: string
  destinoPostalCode: string
  destinoAddressLines: readonly string[]
  aduanaRepresentation: boolean
  asistireYo: boolean
  representanteName: string
  representanteCuil: string
}): ReadonlySet<string> {
  const errors = new Set<string>()
  if (!params.recipientName.trim()) errors.add('recipientName')
  if (!params.recipientPhone.trim()) {
    errors.add('recipientPhone')
  } else if (!/^\d+$/.test(params.recipientPhone.trim())) {
    errors.add('recipientPhoneFormat')
  } else if (params.recipientPhone.trim().length < 8) {
    errors.add('recipientPhoneMin')
  }
  if (!params.recipientEmail.trim()) errors.add('recipientEmail')
  if (!params.recipientTaxId.trim()) errors.add('recipientTaxId')
  if (!params.destinoState.trim()) errors.add('destinoState')
  if (!params.destinoCity.trim()) errors.add('destinoCity')
  if (!params.destinoPostalCode.trim()) errors.add('destinoPostalCode')
  if (!(params.destinoAddressLines[0]?.trim())) errors.add('destinoAddress0')
  if (!params.aduanaRepresentation && !params.asistireYo && !params.representanteName.trim()) errors.add('representanteName')
  if (!params.aduanaRepresentation && !params.asistireYo && !params.representanteCuil.trim()) errors.add('representanteCuil')
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
        fill="var(--color-accent)"
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
  const [articles, setArticles] = useState<readonly DeclaredArticle[]>([])
  const [isArticleModalOpen, setArticleModalOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<DeclaredArticle | null>(null)

  /* ── Paso 2: Paquete ─────────────────────────────────────────────── */
  const [frequentMeasureId, setFrequentMeasureId] = useState('-1')
  const [lengthCm, setLengthCm] = useState('')
  const [widthCm, setWidthCm] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [packageWeightKg, setPackageWeightKg] = useState('')
  const [packageErrors, setPackageErrors] = useState<PackageValidationErrors>({})

  /* ── Paso 3: Origen ──────────────────────────────────────────────── */
  const [remitenteCuit, setRemitenteCuit] = useState(REMITENTES_SEED[0]?.cuit ?? '')
  const [province, setProvince] = useState('BA')
  const [branchId, setBranchId] = useState('BA-001')

  /* ── Paso 4: Destino ─────────────────────────────────────────────── */
  const [recipientName, setRecipientName]               = useState('Juan Perez')
  const [recipientRazonSocial, setRecipientRazonSocial] = useState('Logística ecuatorial')
  const [recipientPhoneCode, setRecipientPhoneCode]     = useState('+54')
  const [recipientPhone, setRecipientPhone]             = useState('12345678')
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
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)
  const [origenDisplayName, setOrigenDisplayName] = useState('')
  const [asistireYo, setAsistireYo] = useState(true)

  /* ── Restaurar wizard desde store al volver del checkout ─────────── */
  useEffect(() => {
    const snap = wizardStore.get()
    if (snap === null) return
    setCountry(snap.country)
    setCommercial(snap.commercial)
    setCategory(snap.category)
    setDeclarationAccepted(snap.declarationAccepted)
    setArticles(snap.articles)
    setFrequentMeasureId(snap.frequentMeasureId)
    setLengthCm(snap.lengthCm)
    setWidthCm(snap.widthCm)
    setHeightCm(snap.heightCm)
    setPackageWeightKg(snap.packageWeightKg)
    setRemitenteCuit(snap.remitenteCuit)
    setOrigenDisplayName(snap.origenDisplayName ?? '')
    setProvince(snap.province)
    setBranchId(snap.branchId)
    setRecipientName(snap.recipientName)
    setRecipientRazonSocial(snap.recipientRazonSocial)
    setRecipientPhoneCode(snap.recipientPhoneCode)
    setRecipientPhone(snap.recipientPhone)
    setRecipientEmail(snap.recipientEmail)
    setRecipientTaxId(snap.recipientTaxId)
    setFacturaE(snap.facturaE)
    setDestinoState(snap.destinoState)
    setDestinoCity(snap.destinoCity)
    setDestinoPostalCode(snap.destinoPostalCode)
    setDestinoAddressLines([...snap.destinoAddressLines])
    setDestinoOrderNum(snap.destinoOrderNum)
    setAduanaRepresentation(snap.aduanaRepresentation)
    setAsistireYo(snap.asistireYo ?? true)
    setRepresentanteName(snap.representanteName)
    setRepresentanteCuil(snap.representanteCuil)
    setShippingService(snap.shippingService)
    if (snap.currentStep !== 'Declaración') goTo(snap.currentStep as Parameters<typeof goTo>[0])
  // Solo al montar
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Derivados ───────────────────────────────────────────────────── */
  const categoryOptions = commercial ? COMMERCIAL_CATEGORIES : NON_COMMERCIAL_CATEGORIES

  const setCommercialAndCategory = (next: boolean) => {
    setCommercial(next)
    setCategory(next ? COMMERCIAL_CATEGORY_VALUE : 'REGALO')
    // Los artículos se conservan en ambos modos; el seed se carga solo al montar
  }

  const handleCountryChange = (value: string) => {
    setCountry(value)
    if (value === '-1') { setArticles([]); return }
    if (category === 'DOCUMENTO') {
      setArticles(DECLARED_DOCUMENTS_SEED)
    } else if (AUTO_SEED_COUNTRIES.has(value)) {
      setArticles(DECLARED_ARTICLES_SEED)
    } else {
      setArticles([])
    }
  }

  const requestCategoryChange = (value: string) => {
    if (value === category) return
    const shouldConfirm = articles.length > 0 && declarationAccepted
    if (shouldConfirm) {
      setPendingCategory(value)
      return
    }
    applyCategoryChange(value)
  }

  const applyCategoryChange = (value: string) => {
    const fromDoc = category === 'DOCUMENTO'
    const toDoc = value === 'DOCUMENTO'
    setCategory(value)
    setDeclarationAccepted(false)
    if (fromDoc || toDoc) {
      setArticles([])
    }
  }

  const confirmCategoryChange = () => {
    if (pendingCategory === null) return
    applyCategoryChange(pendingCategory)
    setPendingCategory(null)
  }

  const selectedCountry = COUNTRIES.find((c) => c.value === country)
  const countryHasShipping = country === '-1' || !COUNTRIES_WITHOUT_SHIPPING.has(country)

  const clearError = (key: string) =>
    setStep4Errors((prev) => { const s = new Set(prev); s.delete(key); return s })

  const runDestinoValidation = () =>
    validateDestinoFields({
      recipientName, recipientPhone, recipientEmail, recipientTaxId,
      destinoState, destinoCity, destinoPostalCode, destinoAddressLines,
      aduanaRepresentation, asistireYo, representanteName, representanteCuil,
    })

  useEffect(() => {
    if (shippingService === 'EMS_DOCUMENTACION' && category !== 'DOCUMENTO') {
      setShippingService('EMS')
    }
  }, [category, shippingService])

  const articleKind: ArticleKind = category === 'DOCUMENTO' ? 'DOCUMENT' : 'ARTICLE'
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

  const buildSnapshot = (): WizardSnapshot => ({
    country, commercial, category, declarationAccepted, articles,
    frequentMeasureId, lengthCm, widthCm, heightCm, packageWeightKg,
    remitenteCuit, origenDisplayName, province, branchId,
    recipientName, recipientRazonSocial, recipientPhoneCode, recipientPhone,
    recipientEmail, recipientTaxId, facturaE,
    destinoState, destinoCity, destinoPostalCode, destinoAddressLines, destinoOrderNum,
    aduanaRepresentation, asistireYo, representanteName, representanteCuil, shippingService,
    currentStep,
  })

  const handleNext = () => {
    if (currentStep === 'Declaración') {
      if (!declarationAccepted) { setDeclarationError(true); return }
      if (!countryHasShipping) return
      setDeclarationError(false)
    }

    if (currentStep === 'Paquete') {
      const errs = validatePackageStep(lengthCm, widthCm, heightCm, packageWeightKg, totalWeightKg)
      setPackageErrors(errs)
      if (errs.measures !== undefined || errs.weight !== undefined) return
    }

    if (currentStep === 'Destino') {
      const errors = runDestinoValidation()
      if (errors.size > 0) { setStep4Errors(errors); return }
      setStep4Errors(new Set())
      const snap = buildSnapshot()
      const orderNumber =
        destinoOrderNum.trim() !== ''
          ? destinoOrderNum.trim()
          : `ORD-${10049 + shipmentsStore.get().length}`
      shipmentsStore.add({
        id: `S-${Date.now()}`,
        integracion: 'MiCorreo',
        nOrden: orderNumber,
        origen: origenDisplayName.trim() || selectedRemitente?.razonSocial || 'Correo Argentino',
        destinatario: recipientName,
        destino: [destinoCity, selectedCountry?.label].filter(Boolean).join(', '),
        detalles: `${packageWeightKg}kg – ${lengthCm}x${widthCm}x${heightCm}cm`,
        usuario: 'Marco',
        estado: 'Validado',
        commercial,
      })
      // Comercial: conservar wizard para el paso Factura E desde pendientes.
      if (commercial) wizardStore.save({ ...snap, destinoOrderNum: orderNumber })
      else wizardStore.clear()
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
                <h4 className={styles.sectionTitleRow}>
                  <span>Seleccioná el país de destino</span>
                  <InfoTooltip content="Seleccioná el país de destino. Verificá los requisitos de ingreso del país de destino por vía postal para evitar devoluciones." />
                </h4>
                <Select
                  id="destination-country"
                  label="País de destino"
                  options={COUNTRIES}
                  value={country}
                  onChange={(event) => handleCountryChange(event.currentTarget.value)}
                />
                {country !== '-1' && countryHasShipping && (
                  <p className={styles.supportingRange}>{getCountryGeographicRangeLabel(country)}</p>
                )}
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

                  <button type="button" className={styles.infoLink} onClick={() => setInfoModalOpen(true)}>
                    Información a tener en cuenta
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="m7.5 5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <p className={styles.hint}>Detallá la categoría del envío y el contenido del paquete.</p>

                  <Select
                    id="shipment-category"
                    label="Categoría de envío"
                    options={categoryOptions}
                    value={category}
                    onChange={(event) => requestCategoryChange(event.currentTarget.value)}
                    disabled={commercial}
                  />

                  <button
                    type="button"
                    className={cn(styles.addArticle, canAddArticle && styles.addArticleEnabled)}
                    disabled={!canAddArticle}
                    onClick={() => setArticleModalOpen(true)}
                  >
                    <PlusIcon />
                    {ARTICLE_KIND_TEXT[articleKind].addButtonLabel}
                  </button>

                  {articles.length === 0 ? (
                    <EmptyState title={ARTICLE_KIND_TEXT[articleKind].emptyStateTitle} iconSrc={packageOpenIcon} />
                  ) : (
                    <div className={styles.articleList}>
                      {articles.map((article, index) => (
                        <ArticleAccordionItem
                          key={article.id}
                          article={article}
                          kind={articleKind}
                          onRemove={removeArticle}
                          onEdit={(a) => { setEditingArticle(a); setArticleModalOpen(true) }}
                          defaultOpen={index === articles.length - 1}
                          invalid={restrictedIds.has(article.id)}
                        />
                      ))}
                    </div>
                  )}

                  <div className={styles.totals}>
                    <div className={styles.totalRow}>
                      <span className={styles.totalLabel}>{ARTICLE_KIND_TEXT[articleKind].quantityTotalLabel}</span>
                      <span className={styles.totalValue}>{totalArticles}</span>
                    </div>
                    <div className={styles.totalRow}>
                      <span className={styles.totalLabel}>Valor total declarado</span>
                      <span className={styles.totalValue}>{formatUsd(totalValueUsd)}</span>
                    </div>
                    <div className={styles.totalRow}>
                      <span className={styles.totalLabel}>Derechos de exportación</span>
                      <span className={styles.totalValue}>{formatUsd(EXPORT_DUTIES_USD)}</span>
                    </div>
                    <div className={styles.totalRow}>
                      <span className={styles.totalLabel}>Peso total declarado</span>
                      <span className={styles.totalValue}>{formatWeightKg(totalWeightKg)}</span>
                    </div>
                    <div className={styles.totalRow}>
                      <span className={styles.totalLabelWithTip}>
                        <InfoTooltip content={PACKAGE_MAX_WEIGHT_TOOLTIP} />
                        <span>{PACKAGE_MAX_WEIGHT_LABEL}</span>
                      </span>
                      <span className={styles.totalValue}>{PACKAGE_MAX_WEIGHT_KG}kg</span>
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
                    label={
                      <>
                        Los datos ingresados serán utilizados para la{' '}
                        <strong className={styles.djEmphasis}>Declaración de Exportación Simplificada Postal</strong>
                        {' '}ante ARCA/DGA y deben ser exactos y veraces siendo el expedidor responsable según la Resolución General ARCA 5886/2026 punto E.
                        <br /><br />
                        Correo Argentino no es responsable de su exactitud o veracidad.
                      </>
                    }
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
                      onChange={(event) => { setLengthCm(event.currentTarget.value); setPackageErrors({}) }}
                      invalid={packageErrors.measures !== undefined}
                    />
                    <Input
                      id="package-width"
                      label="Ancho"
                      inputMode="decimal"
                      value={widthCm}
                      onChange={(event) => { setWidthCm(event.currentTarget.value); setPackageErrors({}) }}
                      invalid={packageErrors.measures !== undefined}
                    />
                    <Input
                      id="package-height"
                      label="Alto"
                      inputMode="decimal"
                      value={heightCm}
                      onChange={(event) => { setHeightCm(event.currentTarget.value); setPackageErrors({}) }}
                      invalid={packageErrors.measures !== undefined}
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

                  {packageErrors.measures === 'incomplete' && (
                    <Alert tone="danger">
                      Completá el largo, el ancho y el alto del paquete para continuar.
                    </Alert>
                  )}
                  {packageErrors.measures === 'oversized' && (
                    <Alert
                      tone="danger"
                      title="El paquete supera las medidas máximas permitidas"
                    >
                      Uno o más lados superan los {PACKAGE_MAX_SIDE_CM} cm. Si excede estas medidas,
                      Correo Argentino rechazará el paquete y no podrá ser enviado. Revisá las
                      dimensiones ingresadas para continuar.
                    </Alert>
                  )}

                  <Input
                    id="package-weight"
                    label="Peso del paquete (kg)"
                    inputMode="decimal"
                    value={packageWeightKg}
                    onChange={(event) => { setPackageWeightKg(event.currentTarget.value); setPackageErrors((e) => ({ ...e, weight: undefined })) }}
                    invalid={packageErrors.weight !== undefined}
                  />

                  <div className={styles.totalRow}>
                    <span className={styles.totalLabelWithTip}>
                      <InfoTooltip content={PACKAGE_MAX_WEIGHT_TOOLTIP} />
                      <span>{PACKAGE_MAX_WEIGHT_LABEL}</span>
                    </span>
                    <span className={styles.totalValue}>{PACKAGE_MAX_WEIGHT_KG}kg</span>
                  </div>

                  {packageErrors.weight !== undefined && (
                    <Alert tone="danger">{packageErrors.weight}</Alert>
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
                    <Input
                      id="origen-display-name"
                      label="Nombre y apellido / Razón social"
                      value={origenDisplayName}
                      onChange={(event) => setOrigenDisplayName(event.currentTarget.value)}
                    />
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

                <div className={styles.orderChipWrap}>
                  <input
                    className={styles.orderChipInput}
                    placeholder="N° de orden (opcional)"
                    value={destinoOrderNum}
                    onChange={(event) => setDestinoOrderNum(event.currentTarget.value)}
                    aria-label="N° de orden (opcional)"
                  />
                </div>

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
                    <PhoneCountryCodeSelect
                      id="recipient-phone-code"
                      label="Código de país"
                      options={PHONE_COUNTRY_CODES}
                      value={recipientPhoneCode}
                      onChange={setRecipientPhoneCode}
                    />
                    <Input
                      id="recipient-phone"
                      label="Número de teléfono"
                      inputMode="tel"
                      value={recipientPhone}
                      onChange={(e) => {
                        setRecipientPhone(e.currentTarget.value)
                        clearError('recipientPhone')
                        clearError('recipientPhoneFormat')
                        clearError('recipientPhoneMin')
                      }}
                      invalid={step4Errors.has('recipientPhone') || step4Errors.has('recipientPhoneFormat') || step4Errors.has('recipientPhoneMin')}
                      hint={
                        step4Errors.has('recipientPhone') ? 'Campo requerido' :
                        step4Errors.has('recipientPhoneFormat') ? 'Solo se permiten números' :
                        step4Errors.has('recipientPhoneMin') ? 'Ingresá al menos 8 números' :
                        'Solo números, sin espacios ni guiones'
                      }
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

                </div>
              </section>

              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>Servicio Postal</h4>
                <p className={styles.fieldNote}>Disponible según destino y peso declarado</p>

                <div className={styles.postalCards}>
                  {([
                    { value: 'EMS', label: 'EMS Paquetería', description: 'Entrega estimada entre 2 y 8 días hábiles, según el destino.', price: '$15.000,00' },
                    { value: 'ENCOMIENDA', label: 'Encomienda Internacional', description: 'Entrega estimada entre 7 y 21 días hábiles, según el destino.', price: '$10.000,00' },
                    { value: 'PEQUENO_PAQUETE', label: 'Pequeño Paquete', description: 'Entrega estimada entre 10 y 30 días hábiles, según el destino.', price: '$7.500,00' },
                    { value: 'EMS_DOCUMENTACION', label: 'EMS Documentación', description: 'Solo para documentos. Entrega estimada entre 2 y 8 días hábiles.', price: '$8.000,00' },
                  ] as const).map((svc) => (
                    <PostalServiceCard
                      key={svc.value}
                      name="shipping-service"
                      value={svc.value}
                      label={svc.label}
                      description={svc.description}
                      selected={shippingService === svc.value}
                      onSelect={(value) => setShippingService(value as typeof shippingService)}
                      disabled={svc.value === 'EMS_DOCUMENTACION' && category !== 'DOCUMENTO'}
                      disabledReason={svc.value === 'EMS_DOCUMENTACION' && category !== 'DOCUMENTO' ? 'Solo disponible para la categoría Documentos.' : undefined}
                      trailing={<span className={styles.servicePrice}>{svc.price}</span>}
                    />
                  ))}
                </div>
              </section>

              <section className={styles.section}>
                <Switch
                  id="aduana-representation"
                  label="Representación ante Aduana"
                  description="Acepto que en caso de ser necesario, Correo Argentino me representa ante Aduana para la gestión de este envío."
                  checked={aduanaRepresentation}
                  onChange={(next) => {
                    if (!next) setAduanaModalOpen(true)
                    else setAduanaRepresentation(true)
                  }}
                  labelPosition="left"
                />
                {aduanaRepresentation && (
                  <p className={styles.sinCostoRow}>
                    <span className={styles.sinCosto}>Sin Costo</span>
                    <InfoTooltip content="La representación ante Aduana no tiene costo adicional." />
                  </p>
                )}
                {!aduanaRepresentation && (
                  <>
                    <div className={styles.totalRow}>
                      <span className={styles.totalLabelWithTip}>
                        <span>Costo</span>
                        <InfoTooltip content="Cargo adicional por gestionar sin representación de Correo Argentino." />
                      </span>
                      <span className={styles.totalValue}>${formatAmountOnly(ADUANA_WITHOUT_REPRESENTATION_COST_ARS)}</span>
                    </div>
                    <Switch
                      id="asistire-yo"
                      label="Asistiré yo"
                      description="Si activás esta opción, asistirás vos. Si querés designar un tercero, desactivala e ingresá sus datos"
                      checked={asistireYo}
                      onChange={setAsistireYo}
                      labelPosition="left"
                    />
                    {!asistireYo && (
                      <>
                        <Input
                          id="representante-name"
                          label="Nombre y apellido del representante"
                          value={representanteName}
                          onChange={(event) => { setRepresentanteName(event.currentTarget.value); clearError('representanteName') }}
                          invalid={step4Errors.has('representanteName')}
                          hint={step4Errors.has('representanteName') ? 'Campo requerido' : undefined}
                        />
                        <Input
                          id="representante-cuil"
                          label="CUIL/CUIT representante"
                          placeholder={CUIT_DOTS_PLACEHOLDER}
                          value={representanteCuil}
                          onChange={(event) => {
                            setRepresentanteCuil(formatCuitDotsMask(event.currentTarget.value))
                            clearError('representanteCuil')
                          }}
                          invalid={step4Errors.has('representanteCuil')}
                          hint={step4Errors.has('representanteCuil') ? 'Campo requerido' : undefined}
                        />
                      </>
                    )}
                  </>
                )}
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
                declaracion={{ categoryLabel, totalArticles, totalValueUsd, totalWeightKg, exportDutiesUsd: EXPORT_DUTIES_USD }}
                paquete={{ measuresLabel, weightLabel }}
                origen={{ displayName: origenDisplayName, remitente: selectedRemitente }}
                destino={{
                  countryLabel: destinoCountryLabel,
                  city: destinoCity || undefined,
                  address: destinoAddressLines[0] || undefined,
                  shippingService: shippingService ? SHIPPING_SERVICE_LABELS[shippingService] : undefined,
                }}
                onPay={
                  currentStep === 'Destino' && runDestinoValidation().size === 0
                    ? () => {
                        wizardStore.save(buildSnapshot())
                        if (commercial) {
                          navigate('/internacional/factura-e')
                          return
                        }
                        const priceArs = shippingService ? SHIPPING_SERVICE_PRICES_ARS[shippingService] : 15000
                        navigate('/checkout', {
                          state: {
                            intl: {
                              service: shippingService ? SHIPPING_SERVICE_TO_POSTAL[shippingService] : 'EMS_PAQUETERIA',
                              servicePriceArs: priceArs,
                              serviceLabel: shippingService ? SHIPPING_SERVICE_LABELS[shippingService] : 'EMS Paquetería',
                              totalValueUsd,
                              packageWeightKg: Number(packageWeightKg) || 0,
                              lengthCm: Number(lengthCm) || 0,
                              widthCm: Number(widthCm) || 0,
                              heightCm: Number(heightCm) || 0,
                              originLabel: selectedRemitente?.razonSocial ?? 'Correo Argentino',
                              destinationLabel: [destinoCity, selectedCountry?.label].filter(Boolean).join(', '),
                              orderNumber: destinoOrderNum || undefined,
                            },
                          },
                        })
                      }
                    : undefined
                }
                payLabel={commercial ? 'Pagar' : 'Finalizar'}
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

      <ConfirmDialog
        isOpen={pendingCategory !== null}
        onClose={() => setPendingCategory(null)}
        onConfirm={confirmCategoryChange}
        title="¿Querés cambiar la categoría?"
        description="Recordá que esto es una declaración jurada. Verificá que el cambio de categoría sea el correcto para lo que querés enviar"
        cancelLabel="Cancelar"
        confirmLabel="Cambiar y eliminar"
      />

      <InfoConsiderationsModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
      />

      <AddArticleModal
        isOpen={isArticleModalOpen}
        kind={articleKind}
        onClose={() => { setArticleModalOpen(false); setEditingArticle(null) }}
        initialValues={editingArticle ?? undefined}
        onSubmit={(input) => {
          if (editingArticle !== null) {
            setArticles((current) =>
              current.map((a) => (a.id === editingArticle.id ? { ...input, id: editingArticle.id } : a)),
            )
            setEditingArticle(null)
          } else {
            const article: DeclaredArticle = { ...input, id: crypto.randomUUID() }
            setArticles((current) => [...current, article])
          }
        }}
      />
    </PageContainer>
  )
}
