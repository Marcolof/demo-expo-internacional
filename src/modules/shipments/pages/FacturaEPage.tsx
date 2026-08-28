import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/layout/PageContainer'
import { useScrollToTop } from '@/shared/hooks/useScrollToTop'
import { useActiveUser } from '@/core/session/activeUser'
import { formatCuitMask } from '@/shared/lib/validators'
import { formatAmountOnly, parseAmountOnly } from '@/shared/lib/formatCurrency'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { InfoTooltip } from '@/shared/ui/Tooltip'
import { COUNTRIES } from '@/shared/lib/countries'
import {
  FACTURA_E_CUIT_LEGEND,
  FACTURA_E_DEMO_FX_ARS,
  FACTURA_E_SEED,
  type FacturaERow,
} from '../mocks/factura-e.mocks'
import { InternationalShipmentDetailModal } from '../components/InternationalShipmentDetailModal'
import { resolveFacturaEDetail } from '../mocks/international-shipment-detail.mocks'
import type { InternationalShipmentDetail } from '../types/international-shipment-detail.types'
import { wizardStore } from '../stores/session.store'
import styles from './FacturaEPage.module.css'

const SHIPPING_SERVICE_PRICES_ARS: Record<string, number> = {
  EMS: 15000,
  ENCOMIENDA: 10000,
  PEQUENO_PAQUETE: 7500,
  EMS_DOCUMENTACION: 8000,
}

const SHIPPING_SERVICE_TO_POSTAL: Record<string, string> = {
  EMS: 'EMS_PAQUETERIA',
  ENCOMIENDA: 'ENCOMIENDA_INTERNACIONAL',
  PEQUENO_PAQUETE: 'PEQUENO_PAQUETE',
  EMS_DOCUMENTACION: 'EMS_DOCUMENTACION',
}

const SHIPPING_SERVICE_LABELS: Record<string, string> = {
  EMS: 'EMS Paquetería',
  ENCOMIENDA: 'Encomienda Internacional',
  PEQUENO_PAQUETE: 'Pequeño Paquete',
  EMS_DOCUMENTACION: 'EMS Documentación',
}

interface MoneyDrafts {
  readonly monto: string
  readonly tipoCambio: string
}

function sanitizeArAmountInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.,]/g, '')
  const comma = cleaned.indexOf(',')
  if (comma === -1) return cleaned
  const intPart = cleaned.slice(0, comma).replace(/,/g, '')
  const decimals = cleaned.slice(comma + 1).replace(/[^\d]/g, '').slice(0, 2)
  return `${intPart},${decimals}`
}

function isPositiveAmountDraft(raw: string): boolean {
  const parsed = parseAmountOnly(raw)
  return parsed !== undefined && parsed > 0
}

function buildInitialRows(snap: ReturnType<typeof wizardStore.get>): FacturaERow[] {
  const base = [...FACTURA_E_SEED]
  if (snap === null) return base
  const countryLabel = COUNTRIES.find((c) => c.value === snap.country)?.label ?? snap.country
  const totalUsd = snap.articles.reduce((sum, a) => sum + a.quantity * a.unitPriceUsd, 0)
  base.unshift({
    id: 'fe-current',
    destinatario: snap.recipientName || snap.recipientRazonSocial || 'Envío actual',
    destino: [snap.destinoCity, countryLabel].filter(Boolean).join(' - ') || countryLabel,
    nOrden: snap.destinoOrderNum.trim() || 'ORD-10049',
    facturaE: snap.facturaE || 'FE-0001-00000108',
    montoUsd: totalUsd || 245,
    tipoCambioArs: FACTURA_E_DEMO_FX_ARS,
  })
  return base
}

function draftsFromRows(rows: readonly FacturaERow[]): Record<string, MoneyDrafts> {
  return Object.fromEntries(
    rows.map((row) => [
      row.id,
      {
        monto: formatAmountOnly(row.montoUsd),
        tipoCambio: formatAmountOnly(row.tipoCambioArs),
      },
    ]),
  )
}

interface CurrencyFieldProps {
  readonly currency: 'USD' | 'ARS'
  readonly value: string
  readonly ariaLabel: string
  readonly invalid?: boolean
  readonly readOnly?: boolean
  readonly onChange?: (value: string) => void
  readonly onBlur?: () => void
}

function CurrencyField({
  currency,
  value,
  ariaLabel,
  invalid = false,
  readOnly = false,
  onChange,
  onBlur,
}: CurrencyFieldProps) {
  return (
    <label className={styles.moneyField}>
      <span className={styles.moneyCurrency}>{currency}</span>
      <input
        className={cn(styles.moneyInput, invalid && styles.moneyInvalid, readOnly && styles.moneyReadOnly)}
        aria-label={ariaLabel}
        inputMode={readOnly ? undefined : 'decimal'}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        value={value}
        onChange={
          onChange === undefined
            ? undefined
            : (event) => onChange(sanitizeArAmountInput(event.currentTarget.value))
        }
        onBlur={onBlur}
      />
    </label>
  )
}

/**
 * Paso intermedio Factura E (flujo comercial).
 */
export function FacturaEPage() {
  const navigate = useNavigate()
  const { user } = useActiveUser()
  useScrollToTop()
  const snap = wizardStore.get()
  const [cuit, setCuit] = useState(() => formatCuitMask(user.cuit))
  const [rows, setRows] = useState<readonly FacturaERow[]>(() => buildInitialRows(snap))
  const [drafts, setDrafts] = useState<Record<string, MoneyDrafts>>(() =>
    draftsFromRows(buildInitialRows(snap)),
  )
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [detail, setDetail] = useState<InternationalShipmentDetail | null>(null)

  useEffect(() => {
    if (menuOpenId === null) return
    const close = () => setMenuOpenId(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpenId])

  const allFacturasComplete = rows.every((row) => row.facturaE.trim() !== '')
  const allMontosValid = rows.every((row) => isPositiveAmountDraft(drafts[row.id]?.monto ?? ''))
  const allTipoCambioValid = rows.every((row) => isPositiveAmountDraft(drafts[row.id]?.tipoCambio ?? ''))
  const canPay =
    allFacturasComplete && allMontosValid && allTipoCambioValid && cuit.trim() !== ''

  const patchRow = (id: string, patch: Partial<FacturaERow>) => {
    setRows((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const patchDraft = (id: string, patch: Partial<MoneyDrafts>) => {
    setDrafts((current) => {
      const previous = current[id] ?? { monto: '', tipoCambio: '' }
      return { ...current, [id]: { ...previous, ...patch } }
    })
  }

  const commitAmount = (id: string, field: keyof MoneyDrafts, numericKey: 'montoUsd' | 'tipoCambioArs') => {
    const raw = drafts[id]?.[field] ?? ''
    const parsed = parseAmountOnly(raw)
    if (parsed === undefined) return
    patchDraft(id, { [field]: formatAmountOnly(parsed) })
    patchRow(id, { [numericKey]: parsed })
  }

  const removeRow = (id: string) => {
    setRows((current) => current.filter((item) => item.id !== id))
    setDrafts((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
    setMenuOpenId(null)
  }

  const goCheckout = () => {
    if (!canPay) return
    const service = snap?.shippingService ?? 'EMS'
    const priceArs = SHIPPING_SERVICE_PRICES_ARS[service] ?? 15000
    const totalValueUsd = rows.reduce((sum, row) => {
      const draft = drafts[row.id]?.monto
      return sum + (draft !== undefined ? (parseAmountOnly(draft) ?? row.montoUsd) : row.montoUsd)
    }, 0)
    const countryLabel = COUNTRIES.find((c) => c.value === snap?.country)?.label
    const representationCostArs =
      snap !== null && snap.aduanaRepresentation === false ? 16000 : 0

    navigate('/checkout', {
      state: {
        intl: {
          service: SHIPPING_SERVICE_TO_POSTAL[service] ?? 'EMS_PAQUETERIA',
          servicePriceArs: priceArs,
          serviceLabel: SHIPPING_SERVICE_LABELS[service] ?? 'EMS Paquetería',
          totalValueUsd,
          packageWeightKg: Number(snap?.packageWeightKg) || 0,
          lengthCm: Number(snap?.lengthCm) || 0,
          widthCm: Number(snap?.widthCm) || 0,
          heightCm: Number(snap?.heightCm) || 0,
          originLabel: snap?.origenDisplayName || 'Correo Argentino',
          destinationLabel: [snap?.destinoCity, countryLabel].filter(Boolean).join(', '),
          orderNumber: snap?.destinoOrderNum || undefined,
          representationCostArs,
        },
      },
    })
  }

  return (
    <PageContainer width="full">
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.titleRow}>
            <span>Facturación del envío</span>
            <InfoTooltip content="Completá el CUIT y los datos de Factura E de cada envío comercial." />
          </h1>
          <h2 className={styles.subtitle}>Datos de la factura</h2>
          <p className={styles.hint}>{FACTURA_E_CUIT_LEGEND}</p>
          <div className={styles.cuitField}>
            <Input
              id="factura-e-cuit"
              label="CUIT"
              value={cuit}
              onChange={(event) => setCuit(formatCuitMask(event.currentTarget.value))}
            />
          </div>
        </header>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thMenu} aria-label="Acciones" />
                <th>Destinatario</th>
                <th>Destino</th>
                <th>N° de orden</th>
                <th>N° de factura</th>
                <th>Monto</th>
                <th>Tipo de cambio</th>
                <th className={styles.thTotal}>Total en pesos Argentinos</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const draft = drafts[row.id] ?? {
                  monto: formatAmountOnly(row.montoUsd),
                  tipoCambio: formatAmountOnly(row.tipoCambioArs),
                }
                const montoValue = parseAmountOnly(draft.monto)
                const fxValue = parseAmountOnly(draft.tipoCambio)
                const montoInvalid = !isPositiveAmountDraft(draft.monto)
                const fxInvalid = !isPositiveAmountDraft(draft.tipoCambio)
                const totalArs =
                  montoValue !== undefined && fxValue !== undefined ? montoValue * fxValue : 0

                return (
                  <tr
                    key={row.id}
                    className={`${styles.tableRow} ${menuOpenId === row.id ? styles.tableRowMenuOpen : ''}`}
                  >
                    <td className={styles.tdMenu}>
                      <div
                        className={styles.menuWrap}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          className={styles.kebab}
                          aria-label={`Acciones ${row.destinatario}`}
                          aria-haspopup="menu"
                          aria-expanded={menuOpenId === row.id}
                          onClick={() =>
                            setMenuOpenId((current) => (current === row.id ? null : row.id))
                          }
                        >
                          ⋮
                        </button>
                        {menuOpenId === row.id && (
                          <div className={styles.menu} role="menu">
                            <button
                              type="button"
                              className={styles.menuItem}
                              role="menuitem"
                              onClick={() => {
                                setDetail(resolveFacturaEDetail(row, snap))
                                setMenuOpenId(null)
                              }}
                            >
                              Ver detalle
                            </button>
                            <button
                              type="button"
                              className={styles.menuItem}
                              role="menuitem"
                              onClick={() => removeRow(row.id)}
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={styles.tdText}>{row.destinatario}</td>
                    <td className={styles.tdText}>{row.destino}</td>
                    <td>{row.nOrden}</td>
                    <td>
                      <input
                        className={styles.facturaInput}
                        aria-label={`N° de factura ${row.destinatario}`}
                        value={row.facturaE}
                        onChange={(event) => patchRow(row.id, { facturaE: event.currentTarget.value })}
                      />
                    </td>
                    <td>
                      <CurrencyField
                        currency="USD"
                        ariaLabel={`Monto USD ${row.destinatario}`}
                        value={draft.monto}
                        invalid={montoInvalid}
                        onChange={(value) => {
                          patchDraft(row.id, { monto: value })
                          const parsed = parseAmountOnly(value)
                          if (parsed !== undefined) patchRow(row.id, { montoUsd: parsed })
                        }}
                        onBlur={() => commitAmount(row.id, 'monto', 'montoUsd')}
                      />
                    </td>
                    <td>
                      <CurrencyField
                        currency="ARS"
                        ariaLabel={`Tipo de cambio ${row.destinatario}`}
                        value={draft.tipoCambio}
                        invalid={fxInvalid}
                        onChange={(value) => {
                          patchDraft(row.id, { tipoCambio: value })
                          const parsed = parseAmountOnly(value)
                          if (parsed !== undefined) patchRow(row.id, { tipoCambioArs: parsed })
                        }}
                        onBlur={() => commitAmount(row.id, 'tipoCambio', 'tipoCambioArs')}
                      />
                    </td>
                    <td>
                      <CurrencyField
                        currency="ARS"
                        ariaLabel={`Total en pesos ${row.destinatario}`}
                        value={formatAmountOnly(totalArs)}
                        readOnly
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className={styles.footer}>
          <Button variant="tertiary" onClick={() => navigate('/propuesta/mis-envios')}>
            Cancelar
          </Button>
          <div className={styles.footerEnd}>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Atrás
            </Button>
            <Button variant="primary" disabled={!canPay} onClick={goCheckout}>
              Pagar
            </Button>
          </div>
        </div>
      </div>

      <InternationalShipmentDetailModal
        isOpen={detail !== null}
        detail={detail}
        onClose={() => setDetail(null)}
      />
    </PageContainer>
  )
}
