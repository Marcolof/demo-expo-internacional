import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { INFO_VIGENTE_PATH, VUCE_URL } from '../constants/summary-detail.constants'
import styles from './InfoConsiderationsModal.module.css'

export type InfoConsiderationsVariant = 'commercial' | 'nonCommercial'

export interface InfoConsiderationsModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly variant?: InfoConsiderationsVariant
}

const LETTERED_ITEMS = [
  'a) sometida a un régimen aduanero o a un tratamiento operativo específicamente normado para el control aduanero o;',
  'b) alcanzada por cupos de exportación o;',
  'c) se requiere de la intervención de terceros organismos para la exportación, o',
  'd) la mercadería está sujeta a prohibiciones de carácter no económicas.',
] as const

const BULLETS = [
  'Existen restricciones y/o condiciones de ingreso por la vía postal en el país de destino',
  'La existencia de vuelos para la vía postal al país de destino',
  'La lista de mercadería que la Unión Postal Universal (UPU) prohíbe enviar por la red postal internacional',
  'La lista de mercadería que, por razones de seguridad, no pueden ser transportadas por la vía aérea',
] as const

function ConsiderationsBullets({ linkLabel }: { readonly linkLabel: string }) {
  return (
    <ul className={styles.bullets}>
      {BULLETS.map((text) => (
        <li key={text}>
          {text}{' '}
          (
          <a href={INFO_VIGENTE_PATH} target="_blank" rel="noreferrer">
            {linkLabel}
          </a>
          ).
        </li>
      ))}
    </ul>
  )
}

export function InfoConsiderationsModal({
  isOpen,
  onClose,
  variant = 'commercial',
}: InfoConsiderationsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Información a tener en cuenta"
      size="xl"
      className={cn(
        styles.dialog,
        variant === 'nonCommercial' ? styles.dialogCompact : styles.dialogTall,
      )}
      bodyClassName={cn(styles.body, variant === 'nonCommercial' && styles.bodyCompact)}
      footerClassName={cn(styles.footer, variant === 'nonCommercial' && styles.footerCompact)}
      footer={
        <Button variant="primary" className={styles.entendido} onClick={onClose}>
          Entendido
        </Button>
      }
    >
      {renderBody(variant)}
    </Modal>
  )
}

function renderBody(variant: InfoConsiderationsVariant) {
  switch (variant) {
    case 'commercial':
      return (
        <>
          <p>
            Te recordamos que la vía postal para la exportación con finalidad comercial no puede ser
            utilizada si la mercadería que pretendes exportar está:
          </p>

          <div className={styles.lettered}>
            {LETTERED_ITEMS.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>

          <p>
            Podés chequear el régimen legal y tributario de tu mercadería en la página de la Ventanilla
            Única de Comercio Exterior Argentina (VUCE) ingresando su descripción o su posición
            arancelaria:{' '}
            <a href={VUCE_URL} target="_blank" rel="noreferrer">
              {VUCE_URL}
            </a>
          </p>

          <p>También revisá y controlá aquí si:</p>
          <ConsiderationsBullets linkLabel="clic aquí" />
        </>
      )
    case 'nonCommercial':
      return (
        <>
          <p>También revisá y controlá aquí si:</p>
          <ConsiderationsBullets linkLabel="hacé click acá" />
        </>
      )
    default: {
      const _exhaustive: never = variant
      return _exhaustive
    }
  }
}
