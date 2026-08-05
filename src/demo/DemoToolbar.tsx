import { useState } from 'react'
import { ROLE_LABELS } from '@/core/auth/roles'
import { useActiveScenario } from '@/core/session/activeScenario'
import { useActiveUser } from '@/core/session/activeUser'
import { FeatureFlagSwitcher } from './FeatureFlagSwitcher'
import { ScenarioSwitcher } from './ScenarioSwitcher'
import { StateInspector } from './StateInspector'
import { UserSwitcher } from './UserSwitcher'
import styles from './DemoToolbar.module.css'

/**
 * Barra de herramientas de la maqueta.
 *
 * NO forma parte del producto. Permite cambiar usuario, rol, permisos, flags,
 * escenario y estado de carga en vivo durante una demo. Se puede apagar con el
 * feature flag `DEMO_TOOLBAR`.
 */
export function DemoToolbar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { user, loadState, reset } = useActiveUser()
  const { scenarioId } = useActiveScenario()

  return (
    <div className={styles.toolbar}>
      <div className={styles.bar}>
        <span className={styles.tag}>Maqueta</span>

        <div className={styles.summary}>
          <span className={styles.summaryItem}>
            Usuario: <span className={styles.summaryValue}>{user.firstName}</span>
          </span>
          <span className={styles.summaryItem}>
            Rol: <span className={styles.summaryValue}>{ROLE_LABELS[user.role]}</span>
          </span>
          <span className={styles.summaryItem}>
            Escenario:{' '}
            <span className={styles.summaryValue}>{scenarioId ?? 'por defecto'}</span>
          </span>
          {loadState !== 'success' && (
            <span className={styles.summaryItem}>
              Carga: <span className={styles.summaryValue}>{loadState}</span>
            </span>
          )}
        </div>

        <span className={styles.spacer} />

        <button type="button" className={styles.action} onClick={reset}>
          Reiniciar
        </button>
        <button
          type="button"
          className={styles.action}
          onClick={() => setIsExpanded((expanded) => !expanded)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Ocultar controles' : 'Mostrar controles'}
        </button>
      </div>

      {isExpanded && (
        <div className={styles.panel}>
          <ScenarioSwitcher />
          <UserSwitcher />
          <FeatureFlagSwitcher />
          <StateInspector />
        </div>
      )}
    </div>
  )
}
