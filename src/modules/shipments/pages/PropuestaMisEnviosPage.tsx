import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/layout/PageContainer'
import styles from './PropuestaMisEnviosPage.module.css'

/* ── Tipos y datos mock ───────────────────────────────────────────── */

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
    nOrden: '-',
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
    nOrden: '-',
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
    nOrden: '-',
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
    nOrden: '-',
    origen: 'Descripción de material genérico.',
    destinatario: 'Juan Perez',
    destino: 'Suc. Banfield',
    detalles: '2kg – 15x12x10cm',
    usuario: 'Santiago',
    estado: 'Validado',
  },
]

/* ── Íconos inline ────────────────────────────────────────────────── */

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
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

/* ── Componente ───────────────────────────────────────────────────── */

export function PropuestaMisEnviosPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<EnvioTab>('pendientes')
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set())
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  /* Filtros (visuales — sin lógica de filtrado real en la maqueta) */
  const [destinatario, setDestinatario] = useState('')
  const [provincia, setProvincia] = useState('')
  const [sucursal, setSucursal] = useState('')
  const [integracion, setIntegracion] = useState('todos')
  const [nOrden, setNOrden] = useState('todos')

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

  /* Selección */
  const allIds = ENVIOS_MOCK.map((r) => r.id)
  const allSelected = allIds.every((id) => selectedIds.has(id))
  const someSelected = allIds.some((id) => selectedIds.has(id)) && !allSelected

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(allIds))
  }

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const TABS: { id: EnvioTab; label: string }[] = [
    { id: 'pendientes', label: 'Pendientes' },
    { id: 'pagados',    label: 'Pagados' },
    { id: 'usuario',    label: 'Envíos de usuario' },
  ]

  const MENU_ITEMS = ['Ver detalle', 'Modificar', 'Duplicar', 'Cotizar', 'Eliminar']

  return (
    <PageContainer width="full">
      <div className={styles.page}>

        {/* ── Encabezado ─────────────────────────────────────────── */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Mis envíos</h1>

          <div className={styles.scopeToggle}>
            <button
              type="button"
              className={styles.scopeBtn}
              onClick={() => navigate('/')}
            >
              Nacional
            </button>
            <button
              type="button"
              className={`${styles.scopeBtn} ${styles.scopeBtnActive}`}
            >
              <GlobeIcon />
              Internacional
            </button>
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────── */}
        <div className={styles.tabBar} role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={activeTab === tab.id ? styles.tabActive : styles.tabInactive}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Filtros ────────────────────────────────────────────── */}
        <div className={styles.filters}>
          <div className={styles.filtersGrid}>
            <input
              className={styles.filterInput}
              type="text"
              placeholder="Destinatario"
              value={destinatario}
              onChange={(e) => setDestinatario(e.target.value)}
            />

            <div className={styles.filterSelectWrap}>
              <label className={styles.filterSelectLabel}>Provincia de destino</label>
              <select
                className={styles.filterSelect}
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
              >
                <option value="">Todas...</option>
                <option value="BA">Buenos Aires</option>
                <option value="CA">CABA</option>
                <option value="CO">Córdoba</option>
              </select>
              <span className={styles.filterSelectChevron}>▾</span>
            </div>

            <input
              className={styles.filterInput}
              type="text"
              placeholder="Sucursal de destino"
              value={sucursal}
              onChange={(e) => setSucursal(e.target.value)}
            />

            <div className={styles.filterSelectWrap}>
              <label className={styles.filterSelectLabel}>Integración</label>
              <select
                className={styles.filterSelect}
                value={integracion}
                onChange={(e) => setIntegracion(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="micorreo">MiCorreo</option>
                <option value="correo">Correo</option>
              </select>
              <span className={styles.filterSelectChevron}>▾</span>
            </div>
          </div>

          <div className={styles.filtersRow2}>
            <div className={styles.filterSelectWrap}>
              <label className={styles.filterSelectLabel}>N de orden</label>
              <select
                className={`${styles.filterSelect} ${styles.filterSelectFull}`}
                value={nOrden}
                onChange={(e) => setNOrden(e.target.value)}
              >
                <option value="todos">Todos...</option>
              </select>
              <span className={styles.filterSelectChevron}>▾</span>
            </div>
          </div>

          <div className={styles.filtersActions}>
            <button type="button" className={styles.clearBtn} onClick={() => { setDestinatario(''); setProvincia(''); setSucursal(''); setIntegracion('todos'); setNOrden('todos') }}>
              Limpiar filtros
            </button>
            <button type="button" className={styles.consultarBtn}>
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
              {ENVIOS_MOCK.map((row) => (
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
                    <span className={styles.productoIcon}>
                      <PackageIcon />
                    </span>
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
