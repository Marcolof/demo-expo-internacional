import { useState } from 'react'
import logo from '@/assets/img/CorreoArgentino-MiCorreo.png'
import { SIDEBAR_DRAWER, SIDEBAR_RAIL } from '@/core/navigation/navigation.config'
import { cn } from '@/shared/lib/cn'
import styles from './Sidebar.module.css'

export interface SidebarProps {
  readonly isDrawerOpen: boolean
  readonly onCloseDrawer: () => void
}

function Chevron({ isOpen }: { readonly isOpen: boolean }) {
  return (
    <svg
      className={cn(styles.itemChevron, isOpen && styles.itemChevronOpen)}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
    </svg>
  )
}

/**
 * Sidebar — réplica del riel y del offcanvas del HTML de referencia.
 * Ningún ítem navega: es chrome de maqueta.
 */
export function Sidebar({ isDrawerOpen, onCloseDrawer }: SidebarProps) {
  const [openGroups, setOpenGroups] = useState<ReadonlySet<string>>(new Set())

  const toggleGroup = (id: string) => {
    setOpenGroups((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <>
      {/* --- Riel de iconos (desktop), como `#contenedorSidebarPagina` --- */}
      <nav className={styles.rail} aria-label="Navegación principal">
        <ul className={styles.railList}>
          {SIDEBAR_RAIL.map((item) => (
            <li
              key={item.id}
              className={cn(styles.railItem, item.mobileOnly && styles.railItemMobileOnly)}
            >
              <span
                className={styles.railLink}
                title={item.label}
                aria-label={item.label}
                role="img"
              >
                <img src={item.icon} alt="" className={styles.railIcon} />
              </span>
            </li>
          ))}
        </ul>
      </nav>

      {/* --- Cajón deslizante (mobile / offcanvas) --- */}
      {isDrawerOpen && (
        <>
          <div className={styles.backdrop} onClick={onCloseDrawer} />
          <nav className={styles.drawer} aria-label="Navegación principal">
            <div className={styles.drawerHeader}>
              <span>
                <img src={logo} alt="Correo Argentino — MiCorreo" className={styles.drawerLogo} />
              </span>
              <button
                type="button"
                className={styles.drawerClose}
                onClick={onCloseDrawer}
                aria-label="Cerrar menú"
              >
                &times;
              </button>
            </div>

            <div className={styles.drawerBody}>
              <ul>
                {SIDEBAR_DRAWER.map((item) => {
                  const hasChildren = (item.children?.length ?? 0) > 0
                  const isOpen = openGroups.has(item.id)

                  return (
                    <li
                      key={item.id}
                      className={cn(styles.item, item.mobileOnly && styles.itemMobileOnly)}
                    >
                      {hasChildren ? (
                        <button
                          type="button"
                          className={styles.itemToggle}
                          onClick={() => toggleGroup(item.id)}
                          aria-expanded={isOpen}
                        >
                          <img src={item.icon} alt="" className={styles.itemIcon} />
                          <span className={styles.itemLabel}>{item.label}</span>
                          <Chevron isOpen={isOpen} />
                        </button>
                      ) : (
                        <span className={styles.itemLink}>
                          <img src={item.icon} alt="" className={styles.itemIcon} />
                          <span className={styles.itemLabel}>{item.label}</span>
                        </span>
                      )}

                      {hasChildren && isOpen && (
                        <ul className={styles.subList}>
                          {item.children?.map((child) => (
                            <li key={child}>
                              <span className={styles.subLink}>{child}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </nav>
        </>
      )}
    </>
  )
}
