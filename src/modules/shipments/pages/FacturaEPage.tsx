import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/layout/PageContainer'
import { useScrollToTop } from '@/shared/hooks/useScrollToTop'
import { useActiveUser } from '@/core/session/activeUser'
import { formatCuitMask, isMoneyAmount } from '@/shared/lib/validators'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { COUNTRIES } from '@/shared/lib/countries'
import {
  FACTURA_E_CUIT_LEGEND,
  FACTURA_E_SEED,
  type FacturaERow,
} from '../mocks/factura-e.mocks'
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

function sanitizeMoneyInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.,]/g, '')
  const sep = cleaned.includes(',') ? ',' : cleaned.includes('.') ? '.' : null
  if (sep === null) return cleaned
  const [intPart, ...rest] = cleaned.split(sep)
  const decimals = rest.join('').replace(/[^\d]/g, '').slice(0, 2)
  return decimals.length > 0 ? `${intPart}${sep}${decimals}` : intPart + (cleaned.endsWith(sep) ? sep : '')
}

function parseMoneyInput(raw: string): number {
  const n = Number(raw.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
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
    facturaE: snap.facturaE || '00001-000000108',
    montoUsd: totalUsd || 1500,
    divisa: 'USD',
    tipoCambio: '1',
  })
  return base
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
  const [montoDrafts, setMontoDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(buildInitialRows(snap).map((row) => [row.id, row.montoUsd.toFixed(2).replace('.', ',')])),
  )
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const allFacturasComplete = rows.every((row) => row.facturaE.trim() !== '')
  const allMontosValid = rows.every((row) => isMoneyAmount(montoDrafts[row.id] ?? '', false) === null)
  const allDivisasComplete = rows.every((row) => row.divisa.trim() !== '')
  const allTipoCambioValid = rows.every((row) => {
    const n = Number(row.tipoCambio.replace(',', '.'))
    return row.tipoCambio.trim() !== '' && Number.isFinite(n) && n > 0
  })
  const canPay =
    allFacturasComplete && allMontosValid && allDivisasComplete && allTipoCambioValid && cuit.trim() !== ''

  const patchRow = (id: string, patch: Partial<FacturaERow>) => {
    setRows((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const goCheckout = () => {
    if (!canPay) return
    const service = snap?.shippingService ?? 'EMS'
    const priceArs = SHIPPING_SERVICE_PRICES_ARS[service] ?? 15000
    const totalValueUsd = rows.reduce((sum, row) => {
      const draft = montoDrafts[row.id]
      return sum + (draft !== undefined ? parseMoneyInput(draft) : row.montoUsd)
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
          <h1 className={styles.title}>Facturación del envío</h1>
          <h2 className={styles.subtitle}>Factura E</h2>
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
                <th>Nº de orden</th>
                <th>Factura E</th>
                <th>Monto</th>
                <th>Divisa</th>
                <th>Tipo de cambio</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const montoRaw = montoDrafts[row.id] ?? String(row.montoUsd)
                const montoError = isMoneyAmount(montoRaw, false)
                return (
                  <tr
                    key={row.id}
                    className={`${styles.tableRow} ${menuOpenId === row.id ? styles.tableRowMenuOpen : ''}`}
                  >
                    <td className={styles.tdMenu}>
                      <div className={styles.menuWrap}>
                        <button
                          type="button"
                          className={styles.kebab}
                          aria-label={`Acciones ${row.destinatario}`}
                          onClick={() =>
                            setMenuOpenId((current) => (current === row.id ? null : row.id))
                          }
                        >
                          ⋮
                        </button>
                        {menuOpenId === row.id && (
                          <div className={styles.menu}>
                            <button
                              type="button"
                              className={styles.menuItem}
                              onClick={() => setMenuOpenId(null)}
                            >
                              Ver detalle
                            </button>
                            <button
                              type="button"
                              className={styles.menuItem}
                              onClick={() => {
                                setRows((current) => current.filter((item) => item.id !== row.id))
                                setMontoDrafts((current) => {
                                  const next = { ...current }
                                  delete next[row.id]
                                  return next
                                })
                                setMenuOpenId(null)
                              }}
                            >
                              Quitar
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{row.destinatario}</td>
                    <td>{row.destino}</td>
                    <td>{row.nOrden}</td>
                    <td>
                      <input
                        className={styles.facturaInput}
                        aria-label={`Factura E ${row.destinatario}`}
                        value={row.facturaE}
                        onChange={(event) => patchRow(row.id, { facturaE: event.currentTarget.value })}
                      />
                    </td>
                    <td>
                      <label className={styles.montoField}>
                        <span className={styles.montoCurrency}>USD</span>
                        <input
                          className={`${styles.montoInput} ${montoError !== null ? styles.montoInvalid : ''}`}
                          aria-label={`Monto USD ${row.destinatario}`}
                          inputMode="decimal"
                          value={montoRaw}
                          onChange={(event) => {
                            const value = sanitizeMoneyInput(event.currentTarget.value)
                            setMontoDrafts((current) => ({ ...current, [row.id]: value }))
                            if (isMoneyAmount(value, false) === null) {
                              patchRow(row.id, { montoUsd: parseMoneyInput(value) })
                            }
                          }}
                        />
                      </label>
                    </td>
                    <td>
                      <input
                        className={styles.facturaInput}
                        aria-label={`Divisa ${row.destinatario}`}
                        value={row.divisa}
                        onChange={(event) => patchRow(row.id, { divisa: event.currentTarget.value })}
                      />
                    </td>
                    <td>
                      <input
                        className={styles.facturaInput}
                        aria-label={`Tipo de cambio ${row.destinatario}`}
                        inputMode="decimal"
                        value={row.tipoCambio}
                        onChange={(event) =>
                          patchRow(row.id, { tipoCambio: event.currentTarget.value.replace(/[^\d.,]/g, '') })
                        }
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
            <Button variant="secondary" onClick={() => navigate('/propuesta/mis-envios')}>
              Atrás
            </Button>
            <Button variant="secondary" disabled>
              Guardar
            </Button>
            <Button variant="primary" disabled={!canPay} onClick={goCheckout}>
              Pagar
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
