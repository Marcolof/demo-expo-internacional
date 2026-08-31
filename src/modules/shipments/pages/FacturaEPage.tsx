import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/layout/PageContainer'
import { useScrollToTop } from '@/shared/hooks/useScrollToTop'
import { useActiveUser } from '@/core/session/activeUser'
import { formatCuitMask } from '@/shared/lib/validators'
import { formatAmountOnly } from '@/shared/lib/formatCurrency'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { InfoTooltip } from '@/shared/ui/Tooltip'
import { COUNTRIES } from '@/shared/lib/countries'
import { useToast } from '@/shared/ui/Toast'
import {
  FACTURA_E_CUIT_LEGEND,
  FACTURA_E_DEMO_FX_ARS,
  FACTURA_E_SEED,
  type FacturaERow,
} from '../mocks/factura-e.mocks'
import { InternationalShipmentDetailModal } from '../components/InternationalShipmentDetailModal'
import { resolveFacturaEDetail } from '../mocks/international-shipment-detail.mocks'
import { articleTotalPriceUsd } from '../types/article.types'
import type { InternationalShipmentDetail } from '../types/international-shipment-detail.types'
import { wizardStore, markWizardShipmentPaid } from '../stores/session.store'
import styles from './FacturaEPage.module.css'

function buildInitialRows(snap: ReturnType<typeof wizardStore.get>): FacturaERow[] {
  const base = [...FACTURA_E_SEED]
  if (snap === null) return base
  const countryLabel = COUNTRIES.find((c) => c.value === snap.country)?.label ?? snap.country
  const totalUsd = snap.articles.reduce((sum, article) => sum + articleTotalPriceUsd(article), 0)
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

interface MoneyValueProps {
  readonly currency: 'USD' | 'ARS'
  readonly amount: number
}

function MoneyValue({ currency, amount }: MoneyValueProps) {
  return (
    <span className={styles.moneyField}>
      <span className={styles.moneyCurrency}>{currency}</span>
      <span className={styles.moneyValue}>{formatAmountOnly(amount)}</span>
    </span>
  )
}

/**
 * Factura E (flujo comercial, después de pagar en checkout).
 * Monto, tipo de cambio y total ARS vienen del envío y no se editan acá.
 * Pagar cierra el flujo y vuelve a Mis envíos / Pagados.
 */
export function FacturaEPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useActiveUser()
  useScrollToTop()
  const snap = wizardStore.get()
  const [cuit, setCuit] = useState(() => formatCuitMask(user.cuit))
  const [rows, setRows] = useState<readonly FacturaERow[]>(() => buildInitialRows(snap))
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [detail, setDetail] = useState<InternationalShipmentDetail | null>(null)

  useEffect(() => {
    if (menuOpenId === null) return
    const close = () => setMenuOpenId(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpenId])

  const canPay = rows.every((row) => row.facturaE.trim() !== '') && cuit.trim() !== ''

  const patchRow = (id: string, patch: Partial<FacturaERow>) => {
    setRows((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const removeRow = (id: string) => {
    setRows((current) => current.filter((item) => item.id !== id))
    setMenuOpenId(null)
  }

  const handlePay = () => {
    if (!canPay) return
    markWizardShipmentPaid()
    showToast('Pago simulado con éxito.', 'success')
    wizardStore.clear()
    navigate('/propuesta/mis-envios', { state: { paymentResult: 'success', tab: 'pagados' } })
  }

  return (
    <PageContainer width="full">
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.titleRow}>
            <span>Facturación del envío</span>
            <InfoTooltip content="Completá el CUIT y el N° de factura de cada envío comercial." />
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
              {rows.map((row) => (
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
                    <MoneyValue currency="USD" amount={row.montoUsd} />
                  </td>
                  <td>
                    <MoneyValue currency="ARS" amount={row.tipoCambioArs} />
                  </td>
                  <td>
                    <MoneyValue currency="ARS" amount={row.montoUsd * row.tipoCambioArs} />
                  </td>
                </tr>
              ))}
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
            <Button variant="primary" disabled={!canPay} onClick={handlePay}>
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
