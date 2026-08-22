import circleMinusIcon from '@/assets/icons/circle-minus.svg'
import circlePlusIcon from '@/assets/icons/circle-plus.svg'
import { Input } from '@/shared/ui/Input'
import styles from './DestinoFields.module.css'

/** Doc funcional §8.5: hasta 3 líneas de dirección, 50 caracteres cada una. */
export const MAX_ADDRESS_LINES = 3
export const ADDRESS_LINE_MAX_LENGTH = 50

/**
 * Domicilio de destino (Figma 5589:10467).
 * N° de orden y “País de destino seleccionado” se removieron (revisión 2).
 */
export interface DestinoFieldsProps {
  readonly province: string
  readonly onProvinceChange: (value: string) => void
  readonly city: string
  readonly onCityChange: (value: string) => void
  readonly postalCode: string
  readonly onPostalCodeChange: (value: string) => void
  readonly addressLines: readonly string[]
  readonly onAddressLineChange: (index: number, value: string) => void
  readonly onAddAddressLine: () => void
  readonly onRemoveAddressLine: (index: number) => void
}

export function DestinoFields({
  province,
  onProvinceChange,
  city,
  onCityChange,
  postalCode,
  onPostalCodeChange,
  addressLines,
  onAddressLineChange,
  onAddAddressLine,
  onRemoveAddressLine,
}: DestinoFieldsProps) {
  const canAddAddressLine = addressLines.length < MAX_ADDRESS_LINES

  return (
    <div className={styles.fields}>
      <h4 className={styles.title}>Destino</h4>

      <Input
        id="destination-province"
        label="Provincia / Estado"
        value={province}
        onChange={(event) => onProvinceChange(event.currentTarget.value)}
      />

      <div className={styles.row}>
        <Input id="destination-city" label="Ciudad" value={city} onChange={(event) => onCityChange(event.currentTarget.value)} />
        <Input
          id="destination-postal-code"
          label="Código postal"
          value={postalCode}
          onChange={(event) => onPostalCodeChange(event.currentTarget.value)}
        />
      </div>

      <div className={styles.addressLines}>
        <h5 className={styles.addressTitle}>Dirección</h5>
        <p className={styles.addressDescription}>
          Ingresá la dirección de entrega tal como debe figurar en el envío. Incluí calle, número y datos
          adicionales como piso, departamento, torre o edificio.
        </p>

        {addressLines.map((line, index) => (
          <div key={index} className={styles.addressLineGroup}>
            <div className={styles.addressLineRow}>
              <Input
                id={`destination-address-${index + 1}`}
                label={`Dirección ${index + 1}`}
                maxLength={ADDRESS_LINE_MAX_LENGTH}
                value={line}
                onChange={(event) => onAddressLineChange(index, event.currentTarget.value)}
                className={styles.addressLineInput}
              />
              {index > 0 && (
                <button
                  type="button"
                  className={styles.lineButton}
                  onClick={() => onRemoveAddressLine(index)}
                  aria-label={`Eliminar dirección ${index + 1}`}
                >
                  <img src={circleMinusIcon} alt="" className={styles.lineIcon} />
                </button>
              )}
            </div>
            <span className={styles.charCounter}>
              Caracteres {line.length}/{ADDRESS_LINE_MAX_LENGTH}
            </span>
          </div>
        ))}

        {canAddAddressLine && (
          <button type="button" className={styles.addLine} onClick={onAddAddressLine}>
            <img src={circlePlusIcon} alt="" className={styles.addLineIcon} />
            Agregar otra línea de dirección
          </button>
        )}
      </div>
    </div>
  )
}
