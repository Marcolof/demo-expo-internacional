import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import type { SelectOption } from '@/core/types/common'
import { PageContainer } from '@/shared/layout/PageContainer'
import { formatDimensionsCm, formatUsd, formatWeightKg } from '@/shared/lib/formatCurrency'
import { useStepFlow } from '@/shared/hooks/useStepFlow'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Switch } from '@/shared/ui/Switch'
import { ScopeSwitch } from '../components/ScopeSwitch'
import { INTERNATIONAL_STEPS } from '../components/InternationalStepper'
import { InternationalSummary } from '../components/InternationalSummary'
import { AddArticleModal } from '../components/AddArticleModal'
import { ArticleAccordionItem } from '../components/ArticleAccordionItem'
import { articleTotalPriceUsd, articleTotalWeightKg } from '../types/article.types'
import type { DeclaredArticle } from '../types/article.types'
import { DECLARED_ARTICLES_SEED } from '../mocks/articles.mocks'
import { REMITENTES_SEED } from '../mocks/remitentes.mocks'
import { FREQUENT_MEASURE_OPTIONS } from '../mocks/shipments.mocks'
import packageOpenIcon from '@/assets/icons/package-open.svg'
import layout from './NewShipmentPage.module.css'
import styles from './InternationalShipmentPage.module.css'

/**
 * Pasos con contenido real construido. El resto queda desbloqueable por el
 * stepper pero sin formulario todavía — "Siguiente" no avanza más allá del
 * último paso con contenido (ver comentario en el botón, más abajo).
 */
const LAST_BUILT_STEP = 'Origen'

/** Países de destino (subconjunto para la maqueta). */
const DESTINATION_COUNTRIES: readonly SelectOption[] = [
  { value: 'BR', label: 'Brasil' },
  { value: 'CL', label: 'Chile' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'ES', label: 'España' },
]

/**
 * Categorías. Comercial: "Envío de mercadería" (no editable). No comercial:
 * Regalo / Documento / Muestra comercial (ver documentación funcional §5.5).
 */
const NON_COMMERCIAL_CATEGORIES: readonly SelectOption[] = [
  { value: 'REGALO', label: 'Regalo' },
  { value: 'DOCUMENTO', label: 'Documento' },
  { value: 'MUESTRA', label: 'Muestra comercial' },
]

const COMMERCIAL_CATEGORY_VALUE = 'MERCADERIA'

const COMMERCIAL_CATEGORIES: readonly SelectOption[] = [
  { value: COMMERCIAL_CATEGORY_VALUE, label: 'Envío de mercadería' },
]

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
  const {
    current: currentStep,
    currentIndex,
    unlocked,
    goTo,
    next,
    back,
  } = useStepFlow(INTERNATIONAL_STEPS, 'Declaración')
  const [country, setCountry] = useState('-1')
  const [commercial, setCommercial] = useState(false)
  const [category, setCategory] = useState('-1')
  const [declarationAccepted, setDeclarationAccepted] = useState(false)
  const [articles, setArticles] = useState<readonly DeclaredArticle[]>([])
  const [isArticleModalOpen, setArticleModalOpen] = useState(false)
  const [frequentMeasureId, setFrequentMeasureId] = useState('-1')
  const [lengthCm, setLengthCm] = useState('')
  const [widthCm, setWidthCm] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [packageWeightKg, setPackageWeightKg] = useState('')

  const categoryOptions = commercial ? COMMERCIAL_CATEGORIES : NON_COMMERCIAL_CATEGORIES

  /**
   * Fines comerciales tiene una única categoría posible ("Envío de mercadería"):
   * se autoselecciona y el campo queda bloqueado (Figma node 8040:120160).
   * Al volver a no comercial, se limpia para que el usuario elija de nuevo.
   *
   * También precarga los artículos con el dataset de ejemplo (`articles.mocks.ts`)
   * para mostrar la vista "FILLED"; al desactivar el switch se vuelve a vaciar.
   */
  const setCommercialAndCategory = (next: boolean) => {
    setCommercial(next)
    setCategory(next ? COMMERCIAL_CATEGORY_VALUE : '-1')
    setArticles(next ? DECLARED_ARTICLES_SEED : [])
  }

  /** País y categoría completos habilitan "Agregar artículo" (ver doc funcional §5.5). */
  const canAddArticle = country !== '-1' && category !== '-1'

  const totalArticles = articles.length
  const totalValueUsd = articles.reduce((sum, article) => sum + articleTotalPriceUsd(article), 0)
  const totalWeightKg = articles.reduce((sum, article) => sum + articleTotalWeightKg(article), 0)
  const categoryLabel = categoryOptions.find((option) => option.value === category)?.label

  const removeArticle = (article: DeclaredArticle) => {
    setArticles((current) => current.filter((item) => item.id !== article.id))
  }

  const hasMeasures = lengthCm !== '' && widthCm !== '' && heightCm !== ''
  const measuresLabel = hasMeasures
    ? formatDimensionsCm(Number(lengthCm.replace(',', '.')) || 0, Number(widthCm.replace(',', '.')) || 0, Number(heightCm.replace(',', '.')) || 0)
    : undefined
  const weightLabel =
    packageWeightKg === '' ? undefined : formatWeightKg(Number(packageWeightKg.replace(',', '.')) || 0)

  return (
    <PageContainer width="full">
      <div className={layout.prin}>
        {/* Columna izquierda: título, tabs y formulario de Declaración */}
        <div className={layout.carga}>
          <h3 className={layout.title}>Nuevo envío | Paquetería</h3>

          <div className={layout.loadTabs} role="tablist" aria-label="Tipo de carga">
            <div className={layout.loadTablist}>
              <button type="button" role="tab" aria-selected="true" className={layout.loadTabActive}>
                Individual
              </button>
              <span role="tab" aria-selected="false" className={layout.loadTabInactive}>
                Masivo
              </span>
            </div>
          </div>

          <div className={styles.form}>
            {currentStep === 'Declaración' && (
              <>
                {/* País de destino */}
                <section className={styles.section}>
                  <h4 className={styles.sectionTitle}>Seleccioná el país de destino</h4>
                  <Select
                    id="destination-country"
                    label="País de destino"
                    options={DESTINATION_COUNTRIES}
                    value={country}
                    onChange={(event) => setCountry(event.currentTarget.value)}
                  />
                </section>

                {/* Declaración jurada de contenido */}
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

                    <Checkbox
                      id="declaration-accepted"
                      label="Confirmo que la información ingresada en esta declaración jurada es correcta y completa."
                      checked={declarationAccepted}
                      onChange={setDeclarationAccepted}
                    />
                  </div>
                </section>
              </>
            )}

            {/* Medidas del paquete (Figma 8040:120196) */}
            {currentStep === 'Paquete' && (
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
                    onChange={(event) => setPackageWeightKg(event.currentTarget.value)}
                  />
                </div>
              </section>
            )}

            {/*
             * Paso "Origen": todavía sin formulario real (llega en otra
             * iteración). Existe para poder probar la navegación del stepper
             * de punta a punta — ver LAST_BUILT_STEP.
             */}
            {currentStep === 'Origen' && (
              <section className={styles.section}>
                <h4 className={styles.sectionTitle}>Origen</h4>
                <p className={styles.hint}>
                  Este paso todavía no tiene formulario — placeholder para probar la navegación del stepper.
                </p>
              </section>
            )}
          </div>
        </div>

        {/* Columna derecha: switch de alcance + panel de resumen internacional */}
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
                origen={REMITENTES_SEED[0]}
              />
            </div>
          </div>
        </div>

        {/* Cancelar / Siguiente */}
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
                onClick={next}
                disabled={currentStep === LAST_BUILT_STEP}
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
        onSubmit={(input) => {
          const article: DeclaredArticle = { ...input, id: crypto.randomUUID() }
          setArticles((current) => [...current, article])
        }}
      />
    </PageContainer>
  )
}
