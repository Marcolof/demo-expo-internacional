/** Lectura de feature flags desde un componente. */

import { useActiveUser } from '@/core/session/activeUser'
import type { FeatureFlag, FeatureFlagState } from '@/core/featureFlags/featureFlags'

/** ¿Está encendido este flag? */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  const { featureFlags } = useActiveUser()
  return featureFlags[flag]
}

/** Todos los flags, para el `FeatureFlagSwitcher` y el `StateInspector`. */
export function useFeatureFlags(): FeatureFlagState {
  const { featureFlags } = useActiveUser()
  return featureFlags
}
