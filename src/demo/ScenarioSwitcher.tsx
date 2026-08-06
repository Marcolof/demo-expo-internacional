import { useActiveScenario } from '@/core/session/activeScenario'
import { SCENARIO_CATALOG, scenariosByModule } from './scenarioCatalog'
import styles from './DemoToolbar.module.css'

/**
 * Elige el escenario activo. Escribe `?scenario=` en la URL, así el estado se
 * puede compartir por link con Desarrollo.
 */
export function ScenarioSwitcher() {
  const { scenarioId, setScenarioId } = useActiveScenario()
  const grouped = scenariosByModule()

  const current = SCENARIO_CATALOG.find((entry) => entry.id === scenarioId)

  return (
    <div className={styles.section}>
      <p className={styles.sectionTitle}>Escenario</p>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Escenario activo</span>
        <select
          className={styles.select}
          value={scenarioId ?? ''}
          onChange={(event) => {
            const value = event.currentTarget.value
            setScenarioId(value === '' ? null : value)
          }}
        >
          <option value="">Por defecto (sin escenario)</option>
          {[...grouped.entries()].map(([moduleName, entries]) => (
            <optgroup key={moduleName} label={moduleName}>
              {entries.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <span className={styles.hint}>
          {current === undefined
            ? 'Cada pantalla muestra sus datos por defecto.'
            : `${current.description} (módulo: ${current.module})`}
        </span>
      </label>
    </div>
  )
}
