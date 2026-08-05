import { useEffect, useRef, useState } from 'react'
import addIcon from '@/assets/icons/add.png'
import togglerIcon from '@/assets/icons/navbar-toggler.svg'
import logo from '@/assets/img/CorreoArgentino-MiCorreo.png'
import { userInitial } from '@/core/auth/currentUser'
import { HEADER_USER_MENU } from '@/core/navigation/navigation.config'
import { cn } from '@/shared/lib/cn'
import { usePermissions } from '@/shared/hooks/usePermissions'
import styles from './Header.module.css'

/**
 * Barra superior — réplica visual del HTML de referencia.
 *
 * Layout: [hamburguesa][logo] ———— [Nuevo envío][usuario]
 * Padding derecho (>=992px) según estilos.css + pe-4 del bloque usuario.
 */
export function Header() {
  const { user } = usePermissions()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isUserMenuOpen) return

    const onPointerDown = (event: MouseEvent) => {
      if (userMenuRef.current !== null && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsUserMenuOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isUserMenuOpen])

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        {/* .btn-menu — estático */}
        <span className={styles.btnMenu} aria-hidden="true">
          <img src={togglerIcon} alt="" className={styles.togglerIcon} />
        </span>

        {/* #navbarTogglerDemo01 */}
        <div className={styles.main}>
          <span className={styles.brand}>
            <img src={logo} alt="Correo Argentino — MiCorreo" className={styles.brandLogo} />
          </span>

          <div className={styles.actions}>
            <span className={styles.newShipment}>
              <img src={addIcon} alt="" className={styles.newShipmentIcon} />
              Nuevo envío
            </span>

            <div className={styles.user} ref={userMenuRef}>
              <div className={styles.avatar} aria-hidden="true">
                <span className={styles.avatarLetter}>{userInitial(user)}</span>
              </div>

              <button
                type="button"
                className={styles.userTrigger}
                onClick={() => setIsUserMenuOpen((open) => !open)}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
              >
                <span className={styles.userGreeting}>Hola, {user.firstName}</span>
                <span className={styles.userSubtitle}>
                  Mi cuenta
                  <svg
                    className={cn(styles.chevron, isUserMenuOpen && styles.chevronOpen)}
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                  </svg>
                </span>
              </button>

              {isUserMenuOpen && (
                <div className={styles.dropdown} role="menu">
                  {HEADER_USER_MENU.map((label) => {
                    if (label === 'Cerrar sesión') {
                      return (
                        <div key={label}>
                          <hr className={styles.dropdownDivider} />
                          <button type="button" role="menuitem" className={styles.dropdownItem}>
                            {label}
                          </button>
                        </div>
                      )
                    }

                    return (
                      <button key={label} type="button" role="menuitem" className={styles.dropdownItem}>
                        {label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
