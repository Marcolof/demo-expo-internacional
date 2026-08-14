import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/layout/PageContainer'
import { useScrollToTop } from '@/shared/hooks/useScrollToTop'
import { formatCuitMask, isMoneyAmount } from '@/shared/lib/validators'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { COUNTRIES } from '@/shared/lib/countries'
import { FACTURA_E_SEED, type FacturaERow } from '../mocks/factura-e.mocks'
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

/**
 * Paso intermedio Factura E (flujo comercial). Datos mock + filas agregadas
 * en memoria de sesión (sin persistencia).
 */
export function FacturaEPage() {
  const navigate = useNavigate()
  useScrollToTop()
  const snap = wizardStore.get()
  const [cuit, setCuit] = useState('30-12345678-0')
  const [rows, setRows] = useState<readonly FacturaERow[]>(() => {
    const base = [...FACTURA_E_SEED]
    if (snap !== null) {
      const countryLabel = COUNTRIES.find((c) => c.value === snap.country)?.label ?? snap.country
      const totalUsd = snap.articles.reduce(
        (sum, a) => sum + a.quantity * a.unitPriceUsd,
        0,
      )
      base.unshift({
        id: 'fe-current',
        destinatario: snap.recipientName || snap.recipientRazonSocial || 'Envío actual',
        destino: [snap.destinoCity, countryLabel].filter(Boolean).join(' - ') || countryLabel,
        nOrden: snap.destinoOrderNum.trim() || 'ORD-10049',
        facturaE: snap.facturaE || '00001-000000108',
        montoUsd: totalUsd || 1500,
      })
    }
    return base
  })
  const [montoDrafts, setMontoDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (snap !== null
        ? [
            {
              id: 'fe-current',
              montoUsd:
                snap.articles.reduce((sum, a) => sum + a.quantity * a.unitPriceUsd, 0) || 1500,
            },
            ...FACTURA_E_SEED,
          ]
        : FACTURA_E_SEED
      ).map((row) => [row.id, row.montoUsd.toFixed(2).replace('.', ',')]),
    ),
  )
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const allFacturasComplete = rows.every((row) => row.facturaE.trim() !== '')
  const allMontosValid = rows.every((row) => isMoneyAmount(montoDrafts[row.id] ?? '', false) === null)

  const addRow = () => {
    const nextIndex = rows.length + 1
    const id = `fe-new-${Date.now()}`
    setRows((current) => [
      ...current,
      {
        id,
        destinatario: `Nuevo destinatario ${nextIndex}`,
        destino: 'Pendiente',
        nOrden: `ORD-${String(10049 + nextIndex)}`,
        facturaE: '',
        montoUsd: 0,
      },
    ])
    setMontoDrafts((current) => ({ ...current, [id]: '0,00' }))
  }

  const goCheckout = () => {
    if (!allFacturasComplete || !allMontosValid) return
    const service = snap?.shippingService ?? 'EMS'
    const priceArs = SHIPPING_SERVICE_PRICES_ARS[service] ?? 15000
    const totalValueUsd = rows.reduce((sum, row) => {
      const draft = montoDrafts[row.id]
      return sum + (draft !== undefined ? parseMoneyInput(draft) : row.montoUsd)
    }, 0)
    const countryLabel = COUNTRIES.find((c) => c.value === snap?.country)?.label

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
          <p className={styles.hint}>
            Para solicitar la Factura E, completá manualmente el CUIT correspondiente.
          </p>
          <div className={styles.cuitField}>
            <Input
              id="factura-e-cuit"
              label="CUIT"
              value={cuit}
              onChange={(event) => setCuit(formatCuitMask(event.currentTarget.value))}
            />
          </div>
        </header>

        <div className={styles.toolbar}>
          <Button variant="secondary" onClick={addRow}>
            Agregar ítem
          </Button>
        </div>

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
                        onChange={(event) => {
                          const value = event.currentTarget.value
                          setRows((current) =>
                            current.map((item) =>
                              item.id === row.id ? { ...item, facturaE: value } : item,
                            ),
                          )
                        }}
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
                              const parsed = parseMoneyInput(value)
                              setRows((current) =>
                                current.map((item) =>
                                  item.id === row.id ? { ...item, montoUsd: parsed } : item,
                                ),
                              )
                            }
                          }}
                        />
                      </label>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className={styles.footer}>
          <Button variant="tertiary" onClick={() => navigate('/internacional')}>
            Cancelar
          </Button>
          <div className={styles.footerEnd}>
            <Button variant="secondary" onClick={() => navigate('/internacional')}>
              Atrás
            </Button>
            <Button variant="secondary" disabled>
              Guardar
            </Button>
            <Button
              variant="primary"
              disabled={!allFacturasComplete || !allMontosValid}
              onClick={goCheckout}
            >
              Pagar
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
