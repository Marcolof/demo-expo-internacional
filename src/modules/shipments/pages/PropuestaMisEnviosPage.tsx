import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { SelectOption } from '@/core/types/common'
import { PageContainer } from '@/shared/layout/PageContainer'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Tabs, type TabsProps } from '@/shared/ui/Tabs'
import { ScopeSwitch } from '../components/ScopeSwitch'
import { PROVINCE_OPTIONS } from '../mocks/branches.mocks'
import { shipmentsStore } from '../stores/session.store'
import styles from './PropuestaMisEnviosPage.module.css'

/* ── Mocks de filtros ─────────────────────────────────────────────── */

const INTEGRACION_OPTIONS: readonly SelectOption[] = [
  { value: 'micorreo', label: 'MiCorreo' },
  { value: 'correo',   label: 'Correo Argentino' },
  { value: 'api',      label: 'API externa' },
]

const NORDEN_OPTIONS: readonly SelectOption[] = [
  { value: 'ORD-10045', label: 'ORD-10045' },
  { value: 'ORD-10046', label: 'ORD-10046' },
  { value: 'ORD-10047', label: 'ORD-10047' },
  { value: 'ORD-10048', label: 'ORD-10048' },
  { value: 'ORD-10039', label: 'ORD-10039' },
]

/* ── Tipos y datos de tabla ───────────────────────────────────────── */

type EnvioTab = 'pendientes' | 'pagados' | 'usuario'

interface EnvioRow {
  readonly id: string
  readonly integracion: string
  readonly nOrden: string
  readonly origen: string
  readonly destinatario: string
  readonly destino: string
  readonly detalles: string
  readonly usuario: string
  readonly estado: 'Validado' | 'Pendiente' | 'En camino'
}

const ENVIOS_MOCK: readonly EnvioRow[] = [
  {
    id: 'E-001',
    integracion: 'MiCorreo',
    nOrden: 'ORD-10045',
    origen: 'Pickup – Benjamín Matienzo 5548 –',
    destinatario: 'Juan Perez',
    destino: 'Austria – Salzburgo',
    detalles: '2kg – 15x12x10cm',
    usuario: 'Santiago',
    estado: 'Validado',
  },
  {
    id: 'E-002',
    integracion: 'Correo',
    nOrden: 'ORD-10046',
    origen: 'Descripción de material genérico.',
    destinatario: 'Juan Perez',
    destino: 'Austria – Salzburgo',
    detalles: '2kg – 15x12x10cm',
    usuario: 'Santiago',
    estado: 'Validado',
  },
  {
    id: 'E-003',
    integracion: 'Correo',
    nOrden: 'ORD-10047',
    origen: 'Suc. – Cdp CABA – Sur',
    destinatario: 'Juan Perez',
    destino: 'Suc. Banfield',
    detalles: '2kg – 15x12x10cm',
    usuario: 'Santiago',
    estado: 'Validado',
  },
  {
    id: 'E-004',
    integracion: 'Correo',
    nOrden: 'ORD-10048',
    origen: 'Descripción de material genérico.',
    destinatario: 'Juan Perez',
    destino: 'Suc. Banfield',
    detalles: '2kg – 15x12x10cm',
    usuario: 'Santiago',
    estado: 'Validado',
  },
]

/* ── Íconos inline ────────────────────────────────────────────────── */

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

/* ── Componente ───────────────────────────────────────────────────── */

const TABS: TabsProps['items'] = [
  { id: 'pendientes', label: 'Pendientes' },
  { id: 'pagados',    label: 'Pagados' },
  { id: 'usuario',    label: 'Envíos de usuario' },
]

const INTEGRACION_ROW_MAP: Record<string, string> = {
  micorreo: 'micorreo',
  correo: 'correo',
  api: 'api externa',
}

const MENU_ITEMS = ['Ver detalle', 'Modificar', 'Duplicar', 'Cotizar', 'Eliminar']

export function PropuestaMisEnviosPage() {
  const navigate = useNavigate()
  useLocation() // suscribirse a cambios de ruta (recarga sesión al volver)
  const [activeTab, setActiveTab] = useState<EnvioTab>('pendientes')
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set())
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  /* Filtros (campos del form) */
  const [destinatario, setDestinatario] = useState('')
  const [provincia, setProvincia]       = useState('-1')
  const [integracion, setIntegracion]   = useState('-1')
  const [nOrden, setNOrden]             = useState('-1')

  /* Envíos de sesión guardados + mock base */
  const [sessionRows, setSessionRows] = useState<readonly EnvioRow[]>(() => shipmentsStore.get())

  /* Re-leer el store al montar (por si volvemos de /internacional con Guardar) */
  useEffect(() => {
    setSessionRows(shipmentsStore.get())
  }, [])

  const ALL_ROWS: readonly EnvioRow[] = [...sessionRows, ...ENVIOS_MOCK]

  /* Filas visibles — se actualizan al hacer clic en "Consultar" */
  const [visibleRows, setVisibleRows] = useState<readonly EnvioRow[]>(() => [
    ...shipmentsStore.get(),
    ...ENVIOS_MOCK,
  ])

  /* Cerrar menú al hacer clic fuera */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* Selección de filas */
  const allIds = visibleRows.map((r) => r.id)
  const allSelected  = allIds.length > 0 && allIds.every((id) => selectedIds.has(id))
  const someSelected = allIds.some((id) => selectedIds.has(id)) && !allSelected

  const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(allIds))
  const toggleRow = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const applyFilters = () => {
    let rows: readonly EnvioRow[] = ALL_ROWS
    if (destinatario.trim() !== '') {
      const q = destinatario.trim().toLowerCase()
      rows = rows.filter((r) => r.destinatario.toLowerCase().includes(q))
    }
    if (integracion !== '-1') {
      const key = INTEGRACION_ROW_MAP[integracion] ?? integracion
      rows = rows.filter((r) => r.integracion.toLowerCase().includes(key))
    }
    if (nOrden !== '-1') {
      rows = rows.filter((r) => r.nOrden === nOrden)
    }
    setVisibleRows(rows)
    setSelectedIds(new Set())
  }

  const clearFilters = () => {
    setDestinatario('')
    setProvincia('-1')
    setIntegracion('-1')
    setNOrden('-1')
    setVisibleRows(ALL_ROWS)
    setSelectedIds(new Set())
  }

  return (
    <PageContainer width="full">
      <div className={styles.page}>

        {/* ── Encabezado ─────────────────────────────────────────── */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Mis envíos</h1>
          <div className={styles.scopeSwitchWrap}>
            <ScopeSwitch
              value="internacional"
              onChange={(scope) => { if (scope === 'nacional') navigate('/') }}
            />
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────── */}
        <Tabs
          items={TABS}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as EnvioTab)}
          grow={false}
          ariaLabel="Tipo de envío"
          className={styles.tabsRow}
        />

        {/* ── Filtros ────────────────────────────────────────────── */}
        <div className={styles.filters}>
          {/* Fila 1: 4 campos */}
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
            <Input
              id="filter-sucursal"
              label="Sucursal de destino"
              value=""
              onChange={() => {}}
            />
            <Select
              id="filter-integracion"
              label="Integración"
              options={INTEGRACION_OPTIONS}
              value={integracion}
              onChange={(e) => setIntegracion(e.currentTarget.value)}
              placeholderOption="Todas..."
            />
          </div>

          {/* Fila 2: N° de orden (ancho completo) */}
          <Select
            id="filter-norden"
            label="N° de orden"
            options={NORDEN_OPTIONS}
            value={nOrden}
            onChange={(e) => setNOrden(e.currentTarget.value)}
            placeholderOption="Todos..."
          />

          {/* Acciones */}
          <div className={styles.filtersActions}>
            <button type="button" className={styles.clearBtn} onClick={clearFilters}>
              Limpiar filtros
            </button>
            <button type="button" className={styles.consultarBtn} onClick={applyFilters}>
              Consultar
            </button>
          </div>
        </div>

        {/* ── Controles de tabla ─────────────────────────────────── */}
        <div className={styles.tableControls}>
          <span className={styles.selectedCount}>{selectedIds.size} Seleccionado</span>
          <div className={styles.tableControlsRight}>
            <button type="button" className={styles.filtrarBtn}>
              <FilterIcon />
              Filtrar
            </button>
            <button type="button" className={styles.cotizarBtn} disabled={selectedIds.size === 0}>
              Cotizar
            </button>
          </div>
        </div>

        {/* ── Tabla ──────────────────────────────────────────────── */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHead}>
                <th className={styles.thCheck}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected }}
                    onChange={toggleAll}
                    aria-label="Seleccionar todos"
                  />
                </th>
                <th className={styles.thMenu} />
                <th className={styles.th}>Producto</th>
                <th className={styles.th}>Integración</th>
                <th className={styles.th}>N° de orden</th>
                <th className={styles.th}>Origen</th>
                <th className={styles.th}>Destinatario</th>
                <th className={styles.th}>Destino</th>
                <th className={styles.th}>
                  Detalles
                  <span className={styles.thSub}>(alto x largo x ancho)</span>
                </th>
                <th className={styles.th}>Usuario</th>
                <th className={styles.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr
                  key={row.id}
                  className={`${styles.tableRow} ${selectedIds.has(row.id) ? styles.tableRowSelected : ''}`}
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
                      onClick={() => setOpenMenuId((prev) => prev === row.id ? null : row.id)}
                      aria-label="Más opciones"
                    >
                      <DotsIcon />
                    </button>
                    {openMenuId === row.id && (
                      <div className={styles.contextMenu}>
                        {MENU_ITEMS.map((item) => (
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
                    <span className={styles.productoIcon}><PackageIcon /></span>
                  </td>
                  <td className={styles.td}>{row.integracion}</td>
                  <td className={styles.td}>{row.nOrden}</td>
                  <td className={styles.td}>{row.origen}</td>
                  <td className={styles.td}>{row.destinatario}</td>
                  <td className={styles.td}>{row.destino}</td>
                  <td className={styles.td}>{row.detalles}</td>
                  <td className={styles.td}>{row.usuario}</td>
                  <td className={styles.td}>
                    <span className={`${styles.badge} ${styles[`badge${row.estado}`]}`}>
                      {row.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  )
}
