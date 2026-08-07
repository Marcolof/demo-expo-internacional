import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/layout/PageContainer'
import { Button } from '@/shared/ui/Button'
import styles from './PropuestaMisEnviosPage.module.css'

interface Propuesta {
  readonly id: string
  readonly destino: string
  readonly servicio: string
  readonly peso: string
  readonly precio: string
  readonly estado: 'pendiente' | 'guardada'
}

const PROPUESTAS_MOCK: readonly Propuesta[] = [
  {
    id: 'P-2024-001',
    destino: 'Estados Unidos — Houston, TX',
    servicio: 'EMS Paquetería',
    peso: '1,2 kg',
    precio: '$15.000,00',
    estado: 'guardada',
  },
  {
    id: 'P-2024-002',
    destino: 'España — Madrid',
    servicio: 'Encomienda Internacional',
    peso: '0,8 kg',
    precio: '$10.000,00',
    estado: 'pendiente',
  },
]

function BoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function PropuestaMisEnviosPage() {
  const navigate = useNavigate()

  return (
    <PageContainer width="full">
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h2 className={styles.title}>Mis envíos</h2>
            <p className={styles.subtitle}>Propuestas guardadas listas para pagar</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/internacional')}>
            Nuevo envío
          </Button>
        </div>

        <div className={styles.list}>
          {PROPUESTAS_MOCK.map((p) => (
            <div key={p.id} className={styles.card}>
              <div className={styles.cardIcon}>
                <BoxIcon />
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <span className={styles.cardId}>{p.id}</span>
                  <span className={p.estado === 'guardada' ? styles.badgeGuardada : styles.badgePendiente}>
                    {p.estado === 'guardada' ? (
                      <>
                        <CheckIcon />
                        Guardada
                      </>
                    ) : (
                      'Pendiente'
                    )}
                  </span>
                </div>
                <p className={styles.cardDestino}>{p.destino}</p>
                <div className={styles.cardMeta}>
                  <span>{p.servicio}</span>
                  <span className={styles.dot}>·</span>
                  <span>{p.peso}</span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <span className={styles.cardPrecio}>{p.precio}</span>
                <Button variant="primary" size="sm" onClick={() => navigate('/checkout')}>
                  Pagar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
