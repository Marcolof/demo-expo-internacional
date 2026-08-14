import { useNavigate } from 'react-router-dom'
import boxesIcon from '@/assets/icons/boxes.svg'
import { PageContainer } from '@/shared/layout/PageContainer'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Tabs } from '@/shared/ui/Tabs'
import { ScopeSwitch } from '../components/ScopeSwitch'
import layout from './NewShipmentPage.module.css'
import styles from './InternationalBulkShipmentPage.module.css'

/**
 * Vista Masivo en construcción (MVP1).
 * Se conserva el módulo CSS y componentes de carga CSV (BulkShipmentSummary, etc.)
 * para reactivar en una iteración posterior sin reescribir el flujo.
 */
export function InternationalBulkShipmentPage() {
  const navigate = useNavigate()

  return (
    <PageContainer width="full">
      <div className={layout.prin}>
        <div className={layout.carga}>
          <h3 className={layout.title}>Nuevo envío | Paquetería</h3>

          <ScopeSwitch
            className={styles.scopeSwitchMobileOnly}
            value="internacional"
            onChange={(scope) => {
              if (scope === 'nacional') navigate('/')
            }}
          />

          <Tabs
            items={[
              { id: 'individual', label: 'Individual', to: '/internacional' },
              { id: 'masivo', label: 'Masivo' },
            ]}
            activeId="masivo"
            onChange={() => {}}
            className={layout.loadTabs}
          />

          <div className={styles.comingSoon}>
            <EmptyState
              title="Próximamente vas a poder realizar múltiples envíos internacionales a la vez"
              description="Con los envíos masivos vas a poder cargar un archivo CSV con varios envíos y procesarlos de forma simultánea, sin tener que completar cada envío de manera individual."
              iconSrc={boxesIcon}
            />
          </div>
        </div>

        <div className={layout.resumen}>
          <div className={layout.resumenCenter}>
            <div className={layout.infoRe}>
              <ScopeSwitch
                className={layout.scopeSwitch}
                value="internacional"
                onChange={(scope) => {
                  if (scope === 'nacional') navigate('/')
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
