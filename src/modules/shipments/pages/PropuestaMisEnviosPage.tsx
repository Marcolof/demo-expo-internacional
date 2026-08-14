import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { SelectOption } from '@/core/types/common'
import internacionalIcon from '@/assets/icons/internacional.svg'
import { PageContainer } from '@/shared/layout/PageContainer'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Tabs, type TabsProps } from '@/shared/ui/Tabs'
import { ScopeSwitch } from '../components/ScopeSwitch'
import { PROVINCE_OPTIONS } from '../mocks/branches.mocks'
import { shipmentsStore, wizardStore } from '../stores/session.store'
import type { SessionShipment } from '../stores/session.store'
import styles from './PropuestaMisEnviosPage.module.css'

type EnvioTab = 'pendientes' | 'pagados' | 'usuario'
type EnvioScope = 'nacional' | 'internacional'

interface EnvioRow {
  readonly id: string
  readonly scope: EnvioScope
  /** Si false, no se lista (p. ej. seed oculto). Default true. */
  readonly show?: boolean
  readonly integracion: string
  readonly nOrden: string
  readonly origen: string
  readonly destinatario: string
  readonly destino: string
  readonly detalles: string
  readonly usuario: string
  readonly estado: string
  readonly commercial?: boolean
  readonly fecha?: string
  readonly seguimiento?: string
  readonly direccion?: string
}

const INTEGRACION_OPTIONS: readonly SelectOption[] = [
  { value: 'micorreo', label: 'MiCorreo' },
  { value: 'correo', label: 'Correo Argentino' },
  { value: 'api', label: 'API externa' },
]

const NORDEN_OPTIONS: readonly SelectOption[] = [
  { value: 'ORD-10045', label: 'ORD-10045' },
  { value: 'ORD-10046', label: 'ORD-10046' },
  { value: 'ORD-10047', label: 'ORD-10047' },
  { value: 'ORD-10048', label: 'ORD-10048' },
  { value: 'ORD-10039', label: 'ORD-10039' },
]

const TN_OPTIONS: readonly SelectOption[] = [
  { value: 'tn', label: 'TN' },
  { value: 'norden', label: 'N° de orden' },
]

const FECHA_OPTIONS: readonly SelectOption[] = [
  { value: 'todas', label: 'Todas...' },
]

const DESTINO_OPTIONS: readonly SelectOption[] = [
  { value: 'at', label: 'Austria' },
  { value: 'uy', label: 'Uruguay' },
  { value: 'us', label: 'Estados Unidos' },
]

/** Pendientes (mix intl + nacional en destino, producto según scope). */
const ENVIOS_PENDIENTES_SEED: readonly EnvioRow[] = [
  {
    id: 'E-001',
    scope: 'internacional',
    integracion: 'MiCorreo',
    nOrden: 'ORD-10045',
    origen: 'Pickup – Benjamín Matienzo 5548 –',
    destinatario: 'Juan Perez',
    destino: 'Austria – Salzburgo',
    detalles: '2kg – 15x12x10cm',
    usuario: 'Santiago',
    estado: 'Validado',
    commercial: true,
    show: true,
  },
  {
    id: 'E-002',
    scope: 'internacional',
    integracion: 'MiCorreo',
    nOrden: 'ORD-10046',
    origen: 'Descripción de material genérico.',
    destinatario: 'Juan Perez',
    destino: 'Austria – Salzburgo',
    detalles: '2kg – 15x12x10cm',
    usuario: 'Santiago',
    estado: 'Validado',
    show: true,
  },
  {
    id: 'E-003',
    scope: 'nacional',
    integracion: 'Correo',
    nOrden: 'ORD-10047',
    origen: 'Suc. – Cdp CABA – Sur',
    destinatario: 'Juan Perez',
    destino: 'Suc. Banfield',
    detalles: '2kg – 15x12x10cm',
    usuario: 'Santiago',
    estado: 'Validado',
    show: true,
  },
  {
    id: 'E-004',
    scope: 'nacional',
    integracion: 'Correo',
    nOrden: 'ORD-10048',
    origen: 'Descripción de material genérico.',
    destinatario: 'Juan Perez',
    destino: 'Suc. Banfield',
    detalles: '2kg – 15x12x10cm',
    usuario: 'Santiago',
    estado: 'Validado',
    show: true,
  },
]

/** Pagados: nacionales + internacionales. */
const ENVIOS_PAGADOS_SEED: readonly EnvioRow[] = [
  {
    id: 'P-001',
    scope: 'internacional',
    integracion: 'MiCorreo',
    nOrden: '-',
    origen: 'Suc. Banfield',
    destinatario: 'Juan Perez',
    destino: 'Austria - Salzburgo',
    detalles: '2kg – 15x12x10cm',
    usuario: 'Sofia',
    estado: 'En preparación',
    fecha: '27/03/2026',
    seguimiento: '00005512558336L3812C601',
    direccion: 'Getreidegasse 55677',
    show: true,
  },
  {
    id: 'P-002',
    scope: 'nacional',
    integracion: 'MiCorreo',
    nOrden: 'ORD-20011',
    origen: 'Suc. CABA Sur',
    destinatario: 'Ana Gómez',
    destino: 'Suc. Banfield',
    detalles: '1kg – 20x15x10cm',
    usuario: 'Sofia',
    estado: 'En preparación',
    fecha: '26/03/2026',
    seguimiento: '00005512558336N99001',
    direccion: 'Av. Mitre 1200',
    show: true,
  },
  {
    id: 'P-003',
    scope: 'internacional',
    integracion: 'Correo',
    nOrden: 'ORD-20012',
    origen: 'Suc. Retiro',
    destinatario: 'Global Parts INC.',
    destino: 'Uruguay - Montevideo',
    detalles: '3kg – 30x20x15cm',
    usuario: 'Marco',
    estado: 'En camino',
    fecha: '25/03/2026',
    seguimiento: '00005512558336I44002',
    direccion: 'Calle 18 de Julio 900',
    show: true,
  },
]

const TABS: TabsProps['items'] = [
  { id: 'pendientes', label: 'Pendientes' },
  { id: 'pagados', label: 'Pagados' },
  { id: 'usuario', label: 'Envíos de usuario' },
]

const MENU_PENDIENTES = ['Ver detalle', 'Modificar', 'Duplicar', 'Cotizar', 'Eliminar'] as const
const MENU_PAGADOS = ['Ver detalle', 'Duplicar', 'Eliminar'] as const

function sessionToRow(s: SessionShipment): EnvioRow {
  return {
    id: s.id,
    scope: s.commercial !== undefined ? 'internacional' : 'internacional',
    integracion: s.integracion,
    nOrden: s.nOrden,
    origen: s.origen,
    destinatario: s.destinatario,
    destino: s.destino,
    detalles: s.detalles,
    usuario: s.usuario,
    estado: s.estado,
    commercial: s.commercial,
  }
}

function PackageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

export function PropuestaMisEnviosPage() {
  const navigate = useNavigate()
  useLocation()
  const [listScope, setListScope] = useState<EnvioScope>('internacional')
  const [activeTab, setActiveTab] = useState<EnvioTab>('pendientes')
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set())
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLTableCellElement>(null)

  const [destinatario, setDestinatario] = useState('')
  const [provincia, setProvincia] = useState('-1')
  const [integracion, setIntegracion] = useState('-1')
  const [nOrden, setNOrden] = useState('-1')
  const [tnType, setTnType] = useState('tn')
  const [fechaDesde, setFechaDesde] = useState('todas')
  const [fechaHasta, setFechaHasta] = useState('')
  const [provOrigen, setProvOrigen] = useState('-1')
  const [destinoFilter, setDestinoFilter] = useState('-1')

  const [sessionRows, setSessionRows] = useState<readonly EnvioRow[]>(() =>
    shipmentsStore.get().map(sessionToRow),
  )

  useEffect(() => {
    setSessionRows(shipmentsStore.get().map(sessionToRow))
  }, [])

  const pendientesRows = useMemo(
    () =>
      [...sessionRows, ...ENVIOS_PENDIENTES_SEED].filter(
        (row) => row.show !== false && row.scope === listScope,
      ),
    [sessionRows, listScope],
  )

  const [visiblePendientes, setVisiblePendientes] = useState<readonly EnvioRow[]>(() =>
    [...shipmentsStore.get().map(sessionToRow), ...ENVIOS_PENDIENTES_SEED].filter(
      (row) => row.show !== false && row.scope === 'internacional',
    ),
  )
  const [visiblePagados, setVisiblePagados] = useState<readonly EnvioRow[]>(() =>
    ENVIOS_PAGADOS_SEED.filter((row) => row.show !== false && row.scope === 'internacional'),
  )

  const visibleRows = activeTab === 'pagados' ? visiblePagados : visiblePendientes

  useEffect(() => {
    const filterByScope = (rows: readonly EnvioRow[]) =>
      rows.filter((row) => row.show !== false && row.scope === listScope)
    setVisiblePendientes(filterByScope([...sessionRows, ...ENVIOS_PENDIENTES_SEED]))
    setVisiblePagados(filterByScope(ENVIOS_PAGADOS_SEED))
    setSelectedIds(new Set())
  }, [listScope, sessionRows])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setSelectedIds(new Set())
    setOpenMenuId(null)
  }, [activeTab])

  const allIds = visibleRows.map((r) => r.id)
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id))
  const someSelected = allIds.some((id) => selectedIds.has(id)) && !allSelected

  const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(allIds))
  const toggleRow = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const clearFilters = () => {
    setDestinatario('')
    setProvincia('-1')
    setIntegracion('-1')
    setNOrden('-1')
    setTnType('tn')
    setFechaDesde('todas')
    setFechaHasta('')
    setProvOrigen('-1')
    setDestinoFilter('-1')
    if (activeTab === 'pagados') setVisiblePagados(ENVIOS_PAGADOS_SEED)
    else setVisiblePendientes(pendientesRows)
    setSelectedIds(new Set())
  }

  const onTabChange = (id: string) => {
    setActiveTab(id as EnvioTab)
  }

  const menuItems = activeTab === 'pagados' ? MENU_PAGADOS : MENU_PENDIENTES

  return (
    <PageContainer width="full">
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Mis envíos</h1>
          <div className={styles.scopeSwitchWrap}>
            <ScopeSwitch
              value={listScope}
              onChange={(scope) => {
                setListScope(scope)
              }}
            />
          </div>
        </div>

        <Tabs
          items={TABS}
          activeId={activeTab}
          onChange={onTabChange}
          grow={false}
          ariaLabel="Tipo de envío"
          className={styles.tabsRow}
        />

        {activeTab !== 'usuario' && (
          <div className={styles.filters}>
            {activeTab === 'pendientes' ? (
              <>
                <div className={styles.filtersGrid}>
                  <Input
                    id="filter-destinatario"
                    label="Destinatario"
                    value={destinatario}
                    onChange={(e) => setDestinatario(e.currentTarget.value)}
                  />
                  <Select
                    id="filter-provincia"
                    label="Provincia de destino"
                    options={PROVINCE_OPTIONS}
                    value={provincia}
                    onChange={(e) => setProvincia(e.currentTarget.value)}
                    placeholderOption="Todas..."
                  />
                  <Input id="filter-sucursal" label="Sucursal de destino" value="" onChange={() => {}} />
                  <Select
                    id="filter-integracion"
                    label="Integración"
                    options={INTEGRACION_OPTIONS}
                    value={integracion}
                    onChange={(e) => setIntegracion(e.currentTarget.value)}
                    placeholderOption="Todas..."
                  />
                </div>
                <Select
                  id="filter-norden"
                  label="N° de orden"
                  options={NORDEN_OPTIONS}
                  value={nOrden}
                  onChange={(e) => setNOrden(e.currentTarget.value)}
                  placeholderOption="Todos..."
                />
              </>
            ) : (
              <>
                <div className={styles.filtersGrid}>
                  <Select
                    id="filter-tn"
                    label="TN"
                    options={TN_OPTIONS}
                    value={tnType}
                    onChange={(e) => setTnType(e.currentTarget.value)}
                    placeholderOption={null}
                  />
                  <Input
                    id="filter-destinatario-pagados"
                    label="Destinatario"
                    value={destinatario}
                    onChange={(e) => setDestinatario(e.currentTarget.value)}
                  />
                  <Select
                    id="filter-fecha-desde"
                    label="Fecha desde"
                    options={FECHA_OPTIONS}
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.currentTarget.value)}
                    placeholderOption={null}
                  />
                  <Input
                    id="filter-fecha-hasta"
                    label="Fecha hasta"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.currentTarget.value)}
                  />
                </div>
                <div className={styles.filtersGrid}>
                  <Select
                    id="filter-prov-origen"
                    label="Provincia de origen"
                    options={PROVINCE_OPTIONS}
                    value={provOrigen}
                    onChange={(e) => setProvOrigen(e.currentTarget.value)}
                    placeholderOption="Todas..."
                  />
                  <Select
                    id="filter-destino"
                    label="Destino"
                    options={DESTINO_OPTIONS}
                    value={destinoFilter}
                    onChange={(e) => setDestinoFilter(e.currentTarget.value)}
                    placeholderOption="Todos..."
                  />
                  <Select
                    id="filter-integracion-pagados"
                    label="Integración"
                    options={INTEGRACION_OPTIONS}
                    value={integracion}
                    onChange={(e) => setIntegracion(e.currentTarget.value)}
                    placeholderOption="Todas..."
                  />
                  <Select
                    id="filter-norden-pagados"
                    label="N° de orden"
                    options={NORDEN_OPTIONS}
                    value={nOrden}
                    onChange={(e) => setNOrden(e.currentTarget.value)}
                    placeholderOption="Todos..."
                  />
                </div>
              </>
            )}

            <div className={styles.filtersActions}>
              <button type="button" className={styles.clearBtn} onClick={clearFilters}>
                Limpiar filtros
              </button>
              <Button variant="primary" size="sm" disabled>
                Consultar
              </Button>
            </div>
          </div>
        )}

        {activeTab !== 'usuario' && (
          <>
            <div className={styles.tableControls}>
              <span className={styles.selectedCount}>{selectedIds.size} Seleccionado</span>
              <div className={styles.tableControlsRight}>
                <button type="button" className={styles.filtrarBtn}>
                  <FilterIcon />
                  Filtrar
                </button>
                {activeTab === 'pendientes' ? (
                  <button
                    type="button"
                    className={styles.cotizarBtn}
                    disabled={selectedIds.size === 0}
                    onClick={() => {
                      const selected = visibleRows.filter((row) => selectedIds.has(row.id))
                      const anyCommercial =
                        selected.some((row) => row.commercial === true) ||
                        wizardStore.get()?.commercial === true
                      if (anyCommercial) {
                        navigate('/internacional/factura-e')
                        return
                      }
                      navigate('/checkout')
                    }}
                  >
                    Cotizar
                  </button>
                ) : (
                  <Button variant="secondary" size="sm" disabled>
                    Generar rótulo
                  </Button>
                )}
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.tableHead}>
                    <th className={styles.thCheck}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected
                        }}
                        onChange={toggleAll}
                        aria-label="Seleccionar todos"
                      />
                    </th>
                    <th className={styles.thMenu} />
                    <th className={styles.th}>Producto</th>
                    <th className={styles.th}>Integración</th>
                    <th className={styles.th}>N° de orden</th>
                    {activeTab === 'pagados' && (
                      <>
                        <th className={styles.th}>Fecha</th>
                        <th className={styles.th}>Seguimiento</th>
                      </>
                    )}
                    <th className={styles.th}>Origen</th>
                    <th className={styles.th}>Destinatario</th>
                    <th className={styles.th}>Destino</th>
                    {activeTab === 'pagados' ? (
                      <th className={styles.th}>Dirección</th>
                    ) : (
                      <th className={styles.th}>
                        Detalles
                        <span className={styles.thSub}>(alto x largo x ancho)</span>
                      </th>
                    )}
                    {activeTab === 'pendientes' && <th className={styles.th}>Usuario</th>}
                    <th className={styles.th}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr
                      key={row.id}
                      className={[
                        styles.tableRow,
                        selectedIds.has(row.id) ? styles.tableRowSelected : '',
                        openMenuId === row.id ? styles.tableRowMenuOpen : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <td className={styles.tdCheck}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={selectedIds.has(row.id)}
                          onChange={() => toggleRow(row.id)}
                          aria-label={`Seleccionar ${row.id}`}
                        />
                      </td>
                      <td className={styles.tdMenu} ref={openMenuId === row.id ? menuRef : undefined}>
                        <button
                          type="button"
                          className={styles.menuTrigger}
                          onClick={() => setOpenMenuId((prev) => (prev === row.id ? null : row.id))}
                          aria-label="Más opciones"
                        >
                          <DotsIcon />
                        </button>
                        {openMenuId === row.id && (
                          <div className={styles.contextMenu}>
                            {menuItems.map((item) => (
                              <button
                                key={item}
                                type="button"
                                className={`${styles.contextMenuItem} ${item === 'Eliminar' ? styles.contextMenuItemDanger : ''}`}
                                onClick={() => setOpenMenuId(null)}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className={styles.td}>
                        <span
                          className={styles.productoIcon}
                          title={row.scope === 'internacional' ? 'Internacional' : 'Nacional'}
                        >
                          {row.scope === 'internacional' ? (
                            <img src={internacionalIcon} alt="" width={20} height={20} />
                          ) : (
                            <PackageIcon />
                          )}
                        </span>
                      </td>
                      <td className={styles.td}>{row.integracion}</td>
                      <td className={styles.td}>{row.nOrden}</td>
                      {activeTab === 'pagados' && (
                        <>
                          <td className={styles.td}>{row.fecha ?? '—'}</td>
                          <td className={styles.td}>
                            <span className={styles.seguimiento}>
                              {row.seguimiento ?? '—'}
                              {row.seguimiento !== undefined && (
                                <button
                                  type="button"
                                  className={styles.copyBtn}
                                  aria-label="Copiar seguimiento"
                                  onClick={() => {
                                    void navigator.clipboard?.writeText(row.seguimiento ?? '')
                                  }}
                                >
                                  <CopyIcon />
                                </button>
                              )}
                            </span>
                          </td>
                        </>
                      )}
                      <td className={styles.td}>{row.origen}</td>
                      <td className={styles.td}>{row.destinatario}</td>
                      <td className={styles.td}>{row.destino}</td>
                      <td className={styles.td}>
                        {activeTab === 'pagados' ? (row.direccion ?? '—') : row.detalles}
                      </td>
                      {activeTab === 'pendientes' && <td className={styles.td}>{row.usuario}</td>}
                      <td className={styles.td}>
                        <span className={styles.estadoText}>{row.estado}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'usuario' && (
          <p className={styles.emptyTab}>Todavía no hay envíos de usuario para mostrar.</p>
        )}
      </div>
    </PageContainer>
  )
}
