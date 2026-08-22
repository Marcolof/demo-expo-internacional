import { useNavigate } from 'react-router-dom'
import boxesIcon from '@/assets/icons/boxes.svg'
import { PageContainer } from '@/shared/layout/PageContainer'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Tabs } from '@/shared/ui/Tabs'
import { ScopeSwitch } from '../components/ScopeSwitch'
import styles from './InternationalBulkShipmentPage.module.css'

/**
 * Vista Masivo en construcción (MVP1).
 * Chrome de tabs + ScopeSwitch alineado como Individual (NewShipmentPage):
 * el borde inferior del switch coincide con la base de Individual / Masivo.
 */
export function InternationalBulkShipmentPage() {
  const navigate = useNavigate()

  const onScopeChange = (scope: 'nacional' | 'internacional') => {
    if (scope === 'nacional') navigate('/')
  }

  return (
    <PageContainer width="full">
      <div className={styles.page}>
        <header className={styles.header}>
          <h3 className={styles.title}>Nuevo envío | Paquetería</h3>

          <ScopeSwitch
            className={styles.scopeSwitchMobileOnly}
            value="internacional"
            onChange={onScopeChange}
          />

          <div className={styles.chromeRow}>
            <Tabs
              items={[
                { id: 'individual', label: 'Individual', to: '/internacional' },
                { id: 'masivo', label: 'Masivo' },
              ]}
              activeId="masivo"
              onChange={() => {}}
              className={styles.loadTabs}
            />

            <ScopeSwitch
              className={styles.scopeSwitchDesktopOnly}
              value="internacional"
              onChange={onScopeChange}
            />
          </div>
        </header>

        <div className={styles.comingSoon}>
          <EmptyState
            title="Próximamente vas a poder realizar múltiples envíos internacionales a la vez"
            description="Con los envíos masivos vas a poder cargar un archivo CSV con varios envíos y procesarlos de forma simultánea, sin tener que completar cada envío de manera individual."
            iconSrc={boxesIcon}
            iconPosition="bottom"
            titleTone="brand"
          />
        </div>
      </div>
    </PageContainer>
  )
}
