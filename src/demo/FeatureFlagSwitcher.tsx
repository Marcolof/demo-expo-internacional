import { FEATURE_FLAGS, FEATURE_FLAG_LABELS } from '@/core/featureFlags/featureFlags'
import { useActiveUser } from '@/core/session/activeUser'
import type { LoadState } from '@/core/types/common'
import styles from './DemoToolbar.module.css'

const LOAD_STATES: readonly { readonly value: LoadState; readonly label: string }[] = [
  { value: 'success', label: 'Datos cargados' },
  { value: 'loading', label: 'Cargando' },
  { value: 'error', label: 'Error de carga' },
  { value: 'idle', label: 'Sin iniciar' },
]

/** Enciende y apaga feature flags, y fuerza el estado de carga de las pantallas. */
export function FeatureFlagSwitcher() {
  const { featureFlags, setFeatureFlag, loadState, setLoadState } = useActiveUser()

  return (
    <div className={styles.section}>
      <p className={styles.sectionTitle}>Flags y estado de carga</p>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Estado de carga</span>
        <select
          className={styles.select}
          value={loadState}
          onChange={(event) => setLoadState(event.currentTarget.value as LoadState)}
        >
          {LOAD_STATES.map((state) => (
            <option key={state.value} value={state.value}>
              {state.label}
            </option>
          ))}
        </select>
        <span className={styles.hint}>
          Sirve para mostrar spinners y pantallas de error sin backend.
        </span>
      </label>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Feature flags</span>
        <div className={styles.toggleList}>
          {FEATURE_FLAGS.map((flag) => (
            <label key={flag} className={styles.toggle}>
              <input
                type="checkbox"
                checked={featureFlags[flag]}
                onChange={(event) => setFeatureFlag(flag, event.currentTarget.checked)}
              />
              {FEATURE_FLAG_LABELS[flag]}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
