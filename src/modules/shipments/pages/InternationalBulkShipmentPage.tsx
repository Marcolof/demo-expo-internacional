import { useNavigate } from 'react-router-dom'
import boxesIcon from '@/assets/icons/boxes.svg'
import { PageContainer } from '@/shared/layout/PageContainer'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Tabs } from '@/shared/ui/Tabs'
import { ScopeSwitch } from '../components/ScopeSwitch'
import styles from './InternationalBulkShipmentPage.module.css'

/**
 * Vista Masivo en construcción (MVP1).
 * Layout de una sola columna a todo el ancho (sin grilla 2 col de NewShipment)
 * para centrar el empty state sin afectar Individual / nacional.
 */
export function InternationalBulkShipmentPage() {
  const navigate = useNavigate()

  return (
    <PageContainer width="full">
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <h3 className={styles.title}>Nuevo envío | Paquetería</h3>

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
              className={styles.loadTabs}
            />
          </div>

          <ScopeSwitch
            className={styles.scopeSwitchDesktopOnly}
            value="internacional"
            onChange={(scope) => {
              if (scope === 'nacional') navigate('/')
            }}
          />
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
