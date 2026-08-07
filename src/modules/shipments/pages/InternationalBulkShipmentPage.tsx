import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { PageContainer } from '@/shared/layout/PageContainer'
import { Alert } from '@/shared/ui/Alert'
import { Button } from '@/shared/ui/Button'
import { Tabs } from '@/shared/ui/Tabs'
import { ScopeSwitch } from '../components/ScopeSwitch'
import { BulkShipmentSummary } from '../components/BulkShipmentSummary'
import type { BulkSummaryData } from '../components/BulkShipmentSummary'
import layout from './NewShipmentPage.module.css'
import styles from './InternationalBulkShipmentPage.module.css'

/** Datos simulados: la maqueta no parsea el archivo, sólo imita el resultado. */
const MOCK_BULK_DATA: BulkSummaryData = {
  homeAddresses: 5,
  packages: 40,
  shipments: 40,
}

/** Nombre de archivo simulado: no existe ningún archivo real, ni se abre un
 * diálogo del sistema — "Subir" sólo hace de cuenta que se importó éste. */
const MOCK_FILE_NAME = 'documento.csv'

function DownloadIcon() {
  return (
    <svg className={styles.downloadIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2 19V15C2 14.4477 2.44772 14 3 14C3.55228 14 4 14.4477 4 15V19C4 19.2652 4.10543 19.5195 4.29297 19.707C4.48051 19.8946 4.73478 20 5 20H19C19.2652 20 19.5195 19.8946 19.707 19.707C19.8946 19.5195 20 19.2652 20 19V15C20 14.4477 20.4477 14 21 14C21.5523 14 22 14.4477 22 15V19C22 19.7957 21.6837 20.5585 21.1211 21.1211C20.5585 21.6837 19.7957 22 19 22H5C4.20435 22 3.44152 21.6837 2.87891 21.1211C2.3163 20.5585 2 19.7957 2 19ZM11 3C11 2.44772 11.4477 2 12 2C12.5523 2 13 2.44772 13 3V12.5859L16.293 9.29297C16.6835 8.90244 17.3165 8.90244 17.707 9.29297C18.0976 9.68349 18.0976 10.3165 17.707 10.707L12.707 15.707C12.3165 16.0976 11.6835 16.0976 11.293 15.707L6.29297 10.707L6.22461 10.6309C5.90426 10.2381 5.92685 9.65908 6.29297 9.29297C6.65908 8.92685 7.23809 8.90426 7.63086 9.22461L7.70703 9.29297L11 12.5859V3Z"
      />
    </svg>
  )
}

/**
 * Carga masiva del flujo internacional (Figma 5658:21808). Pantalla estática
 * a propósito: "Subir" sólo simula el resultado con datos mock, no parsea
 * ningún archivo real. El panel de Resumen es otro componente
 * (`BulkShipmentSummary`, sin stepper), distinto del de carga individual.
 */
export function InternationalBulkShipmentPage() {
  const navigate = useNavigate()
  const [bulkData, setBulkData] = useState<BulkSummaryData | null>(null)

  return (
    <PageContainer width="full">
      <div className={layout.prin}>
        <div className={layout.carga}>
          <h3 className={layout.title}>Nuevo envío | Paquetería</h3>

          {/* Sólo en responsive: en desktop este switch vive en el panel de Resumen. */}
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

          <div className={styles.content}>
            <h4 className={styles.sectionTitle}>Cargá tu envío en 2 pasos</h4>

            <div className={styles.step}>
              <p className={styles.stepTitle}>
                <strong>Paso 1 -</strong> Descargá la plantilla e ingresá tus envíos.
              </p>

              <ul className={styles.downloadList}>
                <li>
                  <button type="button" className={styles.downloadLink}>
                    <DownloadIcon />
                    Plantilla de carga internacional
                  </button>
                </li>
                <li>
                  <button type="button" className={styles.downloadLink}>
                    <DownloadIcon />
                    Ejemplo de carga internacional
                  </button>
                </li>
                <li className={styles.downloadRow}>
                  <button type="button" className={styles.downloadLink}>
                    <DownloadIcon />
                    Guía de carga y catálogos actualizados
                  </button>
                  <span className={styles.updatedAt}>Última actualización: 01/08/26</span>
                </li>
              </ul>
            </div>

            <div className={styles.step}>
              <p className={styles.stepTitle}>
                <strong>Paso 2 -</strong> Descargá la plantilla e ingresá tus envíos.
              </p>

              <div className={styles.uploadRow}>
                <Button
                  variant="secondary"
                  className={styles.uploadButton}
                  onClick={() => setBulkData(MOCK_BULK_DATA)}
                >
                  Subir
                </Button>
                <div className={styles.dropzone}>O arrastrá el archivo</div>
              </div>

              {bulkData !== null && (
                <>
                  <div className={styles.uploadedFile}>
                    <span className={styles.fileName}>{MOCK_FILE_NAME}</span>
                    <button type="button" className={styles.removeFile} onClick={() => setBulkData(null)}>
                      Eliminar
                    </button>
                  </div>

                  <Alert tone="success">La importación se realizó con éxito.</Alert>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={layout.resumen}>
          <div className={layout.resumenCenter}>
            <div className={layout.infoRe}>
              <ScopeSwitch
                className={cn(layout.scopeSwitch, styles.scopeSwitchDesktopOnly)}
                value="internacional"
                onChange={(scope) => {
                  if (scope === 'nacional') navigate('/')
                }}
              />

              <BulkShipmentSummary data={bulkData} onPay={() => navigate('/checkout')} />
            </div>
          </div>
        </div>

        <div className={layout.navActions}>
          <div className={layout.navActionsInner}>
            <div className={layout.navActionsStart}>
              <Button variant="tertiary" onClick={() => navigate('/')}>
                Cancelar
              </Button>
            </div>
            <div className={layout.navActionsEnd}>
              <Button variant="primary" size="step" disabled={bulkData === null}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
