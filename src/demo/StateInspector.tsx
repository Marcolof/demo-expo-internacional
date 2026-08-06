import { useLocation } from 'react-router-dom'
import { effectivePermissions } from '@/core/auth/currentUser'
import { useActiveScenario } from '@/core/session/activeScenario'
import { useActiveUser } from '@/core/session/activeUser'
import styles from './DemoToolbar.module.css'

/**
 * Volcado del estado de la sesión simulada.
 *
 * Es la herramienta clave para las demos: permite mostrarle a Desarrollo con
 * qué permisos y flags EXACTOS se está viendo la pantalla, sin abrir devtools.
 */
export function StateInspector() {
  const { user, featureFlags, loadState } = useActiveUser()
  const { scenarioId } = useActiveScenario()
  const { pathname, search } = useLocation()

  const snapshot = {
    ruta: `${pathname}${search}`,
    escenario: scenarioId ?? '(por defecto)',
    estadoDeCarga: loadState,
    usuario: {
      id: user.id,
      nombre: `${user.firstName} ${user.lastName}`,
      rol: user.role,
      cuit: user.cuit,
    },
    permisosEfectivos: [...effectivePermissions(user)].sort(),
    permisosForzados: user.permissionOverrides,
    flagsEncendidos: Object.entries(featureFlags)
      .filter(([, enabled]) => enabled)
      .map(([flag]) => flag),
  }

  return (
    <div className={styles.section}>
      <p className={styles.sectionTitle}>Estado actual</p>
      <pre className={styles.code}>{JSON.stringify(snapshot, null, 2)}</pre>
    </div>
  )
}
