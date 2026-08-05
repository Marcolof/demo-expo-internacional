import { formatCurrency } from '@/shared/lib/formatCurrency'
import { Checkbox, RadioGroup } from '@/shared/ui/Checkbox'
import { Input, Textarea } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import type { Money, SelectOption } from '@/core/types/common'
import {
  branchesByProvince,
  FREQUENT_MEASURE_OPTIONS,
  PROVINCE_OPTIONS,
  SAVED_ORIGIN_ADDRESSES,
} from '../mocks/shipments.mocks'
import {
  POSTAL_SERVICE_DELIVERY_TIMES,
  POSTAL_SERVICE_LABELS,
} from '../types/shipment.types'
import type { DeliveryKind, NationalProduct, OriginKind } from '../types/shipment.types'
import type { NewShipmentErrors, NewShipmentFormValues, ShipmentStep } from './shipment.schema'
import styles from './ShipmentForm.module.css'

const DELIVERY_KIND_OPTIONS: readonly SelectOption[] = [
  { value: 'DOMICILIO', label: 'Entrega en Domicilio' },
  { value: 'SUCURSAL', label: 'Entrega en Sucursal' },
]

const PRODUCTS: readonly NationalProduct[] = ['PAQAR_HOY', 'PAQAR_EXPRESO', 'PAQAR_CLASICO']

export interface ShipmentFormProps {
  readonly values: NewShipmentFormValues
  readonly errors: NewShipmentErrors
  /** Cambio de un campo. El `key` tipado evita tocar campos inexistentes. */
  readonly onChange: <K extends keyof NewShipmentFormValues>(
    field: K,
    value: NewShipmentFormValues[K],
  ) => void
  /** Paso visible. El original muestra un paso a la vez y oculta los otros. */
  readonly currentStep: ShipmentStep
  /** Precios cotizados por producto. Vacío = todavía no se cotizó. */
  readonly quotedPrices?: Readonly<Partial<Record<NationalProduct, Money>>>
  readonly onSaveMeasure?: () => void
  readonly disabled?: boolean
}

/**
 * Formulario del alta de envío nacional (columna izquierda).
 *
 * DECISIÓN DE ARQUITECTURA
 * Es un componente controlado y sin estado propio: todo entra por `values` y
 * sale por `onChange`. La validación y el avance de pasos son de la página, así
 * este archivo se puede reusar para "modificar envío" sin cambios.
 */
export function ShipmentForm({
  values,
  errors,
  onChange,
  currentStep,
  quotedPrices,
  onSaveMeasure,
  disabled = false,
}: ShipmentFormProps) {
  const originBranchOptions = branchesByProvince(values.originProvinceCode)
  const destinationBranchOptions = branchesByProvince(values.branchProvinceCode)
  const hasQuote = quotedPrices !== undefined && Object.keys(quotedPrices).length > 0

  return (
    <div className={styles.form}>
      {/* ------------------------------ ORIGEN ------------------------------ */}
      {currentStep === 'ORIGEN' && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Origen</span>
          </div>

          {/* `col-12 col-lg-6` del HTML de referencia: los campos no ocupan todo el ancho. */}
          <div className={styles.originColumn}>
            <Input
              id="inputOrigen"
              label="Nombre y apellido / Razón social"
              value={values.originName}
              error={errors.originName}
              disabled={disabled}
              tooltip="El nombre de la empresa que realiza el envío o si lo realizás vos, tu nombre y apellido"
              onChange={(event) => onChange('originName', event.currentTarget.value)}
            />

            {/* Dos `.form-check.col-6` alineados a la izquierda dentro de la columna. */}
            <div className={styles.originKind}>
              <RadioGroup<OriginKind>
                name="sucursal-pickup"
                inline
                className={styles.originRadios}
                disabled={disabled}
                value={values.originKind}
                onChange={(next) => onChange('originKind', next)}
                options={[
                  { value: 'PICKUP', label: 'Pick Up' },
                  { value: 'SUCURSAL', label: 'Sucursal' },
                ]}
              />
            </div>

            {values.originKind === 'PICKUP' ? (
              <Select
                id="dirOrigen"
                label="Dirección de origen"
                options={SAVED_ORIGIN_ADDRESSES}
                value={values.originAddressId}
                error={errors.originAddressId}
                disabled={disabled}
                tooltip="La dirección desde la que retiramos el paquete"
                onChange={(event) => onChange('originAddressId', event.currentTarget.value)}
              />
            ) : (
              <>
                <Select
                  id="sucursalProvinciaOrigen"
                  label="Provincia"
                  options={PROVINCE_OPTIONS}
                  value={values.originProvinceCode}
                  error={errors.originProvinceCode}
                  disabled={disabled}
                  tooltip="Elegí la provincia y luego la localidad de la misma desde donde enviás"
                  onChange={(event) => {
                    onChange('originProvinceCode', event.currentTarget.value)
                    onChange('originBranchCode', '')
                  }}
                />

                <Select
                  id="sucursalOrigen"
                  label="Sucursal de origen"
                  options={originBranchOptions}
                  value={values.originBranchCode}
                  error={errors.originBranchCode}
                  disabled={disabled || originBranchOptions.length === 0}
                  tooltip="Marcaste que llevás el paquete a la sucursal, ahora podés indicar a cuál."
                  onChange={(event) => onChange('originBranchCode', event.currentTarget.value)}
                />

                <Checkbox
                  id="recordarSucursalCheckBox"
                  label="Utilizar esta sucursal para próximos envíos"
                  checked={values.rememberBranch}
                  disabled={disabled}
                  onChange={(checked) => onChange('rememberBranch', checked)}
                />
              </>
            )}
          </div>
        </section>
      )}

      {/* ----------------------------- PAQUETE ----------------------------- */}
      {currentStep === 'PAQUETE' && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Medidas del paquete (cm)</span>
            {onSaveMeasure !== undefined && (
              <button
                type="button"
                className={styles.saveMeasure}
                onClick={onSaveMeasure}
                disabled={disabled}
              >
                Guardar medida
              </button>
            )}
          </div>

          <div className={styles.grid}>
            <Select
              id="medidasFrecuentes"
              label="Medidas frecuentes"
              className={styles.spanFull}
              options={FREQUENT_MEASURE_OPTIONS}
              value={values.frequentMeasureId}
              disabled={disabled}
              tooltip="Medidas frecuentes"
              onChange={(event) => onChange('frequentMeasureId', event.currentTarget.value)}
            />

            <div className={styles.measuresRow}>
              <Input
                id="largo"
                label="Largo"
                inputMode="decimal"
                value={values.lengthCm}
                error={errors.lengthCm}
                disabled={disabled}
                tooltip="Largo en centímetros del paquete que enviás"
                onChange={(event) => onChange('lengthCm', event.currentTarget.value)}
              />
              <Input
                id="ancho"
                label="Ancho"
                inputMode="decimal"
                value={values.widthCm}
                error={errors.widthCm}
                disabled={disabled}
                tooltip="Ancho en centímetros del paquete que enviás"
                onChange={(event) => onChange('widthCm', event.currentTarget.value)}
              />
              <Input
                id="alto"
                label="Alto"
                inputMode="decimal"
                value={values.heightCm}
                error={errors.heightCm}
                disabled={disabled}
                tooltip="Altura en centímetros del paquete que enviás"
                onChange={(event) => onChange('heightCm', event.currentTarget.value)}
              />
            </div>

            <Input
              id="peso"
              label="Peso (kg)"
              inputMode="decimal"
              value={values.weightKg}
              error={errors.weightKg}
              disabled={disabled}
              tooltip="Peso en kilogramos del paquete que enviás"
              onChange={(event) => onChange('weightKg', event.currentTarget.value)}
            />

            <div>
              <Input
                id="valorContenido"
                label="Valor del contenido ($)"
                inputMode="decimal"
                value={values.declaredValue}
                error={errors.declaredValue}
                disabled={disabled}
                tooltip="Qué valor monetario en moneda o mercancía declarás que estás enviando en tu paquete. NO CONSTITUYE UN SEGURO"
                onChange={(event) => onChange('declaredValue', event.currentTarget.value)}
              />
              <small className={styles.helperText}>No constituye un seguro</small>
            </div>
          </div>
        </section>
      )}

      {/* ----------------------------- DESTINO ----------------------------- */}
      {currentStep === 'DESTINO' && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Destino</span>
          </div>

          <input
            id="nroOpcional"
            className={styles.orderNumber}
            placeholder="N° de orden (opcional)"
            title="Número de orden (opcional)"
            value={values.orderNumber}
            disabled={disabled}
            onChange={(event) => onChange('orderNumber', event.currentTarget.value)}
          />

          <div className={styles.grid}>
            <Select
              id="tipoEntrega"
              label="Tipo de entrega"
              className={styles.spanFull}
              options={DELIVERY_KIND_OPTIONS}
              value={values.deliveryKind}
              error={errors.deliveryKind}
              disabled={disabled}
              tooltip="Tipo de entrega"
              onChange={(event) =>
                onChange('deliveryKind', event.currentTarget.value as DeliveryKind | '')
              }
            />

            {values.deliveryKind === 'SUCURSAL' && (
              <>
                <Input
                  id="nars2"
                  label="Nombre y apellido / Razón social"
                  className={styles.spanFull}
                  value={values.branchRecipientName}
                  error={errors.branchRecipientName}
                  disabled={disabled}
                  tooltip="Nombre de la empresa que recibirá el paquete o el nombre y apellido de la persona que lo hará"
                  onChange={(event) =>
                    onChange('branchRecipientName', event.currentTarget.value)
                  }
                />

                <Select
                  id="provincia2"
                  label="Provincia"
                  options={PROVINCE_OPTIONS}
                  value={values.branchProvinceCode}
                  error={errors.branchProvinceCode}
                  disabled={disabled}
                  tooltip="Provincia a la que enviás el paquete"
                  onChange={(event) => {
                    onChange('branchProvinceCode', event.currentTarget.value)
                    onChange('branchDestinationCode', '')
                  }}
                />

                <Select
                  id="sucursalDestino2"
                  label="Sucursal de destino"
                  options={destinationBranchOptions}
                  value={values.branchDestinationCode}
                  error={errors.branchDestinationCode}
                  disabled={disabled || destinationBranchOptions.length === 0}
                  tooltip="Como has marcado «Sucursal de destino» debés elegir aquí qué sucursal"
                  onChange={(event) =>
                    onChange('branchDestinationCode', event.currentTarget.value)
                  }
                />

                <Input
                  id="correoElectronico2"
                  label="Correo electrónico"
                  type="email"
                  value={values.branchEmail}
                  error={errors.branchEmail}
                  disabled={disabled}
                  tooltip="Correo electrónico de la empresa o persona a la que va dirigido el paquete"
                  onChange={(event) => onChange('branchEmail', event.currentTarget.value)}
                />

                <div className={styles.phoneRow}>
                  <Input
                    id="codAreaPaqSuc"
                    label="Cód. Área (sin 0)"
                    inputMode="numeric"
                    minLength={2}
                    maxLength={4}
                    value={values.branchAreaCode}
                    error={errors.branchAreaCode}
                    disabled={disabled}
                    tooltip="Código de área del celular de la empresa o persona a la que va dirigido el paquete"
                    onChange={(event) => onChange('branchAreaCode', event.currentTarget.value)}
                  />
                  <Input
                    id="celularPaqSuc"
                    label="Celular (sin 15)"
                    inputMode="numeric"
                    minLength={6}
                    maxLength={8}
                    value={values.branchMobile}
                    error={errors.branchMobile}
                    disabled={disabled}
                    tooltip="Número de teléfono celular de la empresa o persona a la que va dirigido el paquete"
                    onChange={(event) => onChange('branchMobile', event.currentTarget.value)}
                  />
                </div>
              </>
            )}

            {values.deliveryKind === 'DOMICILIO' && (
              <>
                <Input
                  id="nars"
                  label="Nombre y apellido / Razón social"
                  className={styles.spanFull}
                  value={values.homeRecipientName}
                  error={errors.homeRecipientName}
                  disabled={disabled}
                  tooltip="Nombre de la empresa que recibirá el paquete o el nombre y apellido de la persona que lo hará"
                  onChange={(event) => onChange('homeRecipientName', event.currentTarget.value)}
                />

                <Select
                  id="provincia"
                  label="Provincia"
                  options={PROVINCE_OPTIONS}
                  value={values.homeProvinceCode}
                  error={errors.homeProvinceCode}
                  disabled={disabled}
                  tooltip="Provincia a la que enviás el paquete"
                  onChange={(event) => onChange('homeProvinceCode', event.currentTarget.value)}
                />

                <Input
                  id="localidad"
                  label="Localidad"
                  value={values.homeCity}
                  error={errors.homeCity}
                  disabled={disabled}
                  tooltip="Indicá la localidad a la cual va dirigido el paquete"
                  onChange={(event) => onChange('homeCity', event.currentTarget.value)}
                />

                <Input
                  id="direCompleta"
                  label="Dirección (calle, altura, piso y dpto.)"
                  className={styles.spanFull}
                  value={values.homeAddress}
                  error={errors.homeAddress}
                  disabled={disabled}
                  tooltip="Dirección de la empresa a la que se le envía o de quién recibe"
                  onChange={(event) => onChange('homeAddress', event.currentTarget.value)}
                />

                <Input
                  id="cpCpa"
                  label="CP (CPA)"
                  inputMode="numeric"
                  maxLength={4}
                  value={values.homePostalCode}
                  error={errors.homePostalCode}
                  disabled={disabled}
                  tooltip="Código postal del domicilio de destino del paquete consignado arriba. Solo los 4 números, por ejemplo: 1842"
                  onChange={(event) => onChange('homePostalCode', event.currentTarget.value)}
                />

                <Input
                  id="correoElectronico"
                  label="Correo electrónico"
                  type="email"
                  value={values.homeEmail}
                  error={errors.homeEmail}
                  disabled={disabled}
                  tooltip="Correo electrónico de la empresa o persona a la que va dirigido el paquete"
                  onChange={(event) => onChange('homeEmail', event.currentTarget.value)}
                />

                <div className={styles.phoneRow}>
                  <Input
                    id="codAreaPaqDom"
                    label="Cód. Área (sin 0)"
                    inputMode="numeric"
                    minLength={2}
                    maxLength={4}
                    value={values.homeAreaCode}
                    error={errors.homeAreaCode}
                    disabled={disabled}
                    tooltip="Código de área del celular de la empresa o persona a la que va dirigido el paquete"
                    onChange={(event) => onChange('homeAreaCode', event.currentTarget.value)}
                  />
                  <Input
                    id="celularPaqDom"
                    label="Celular (sin 15)"
                    inputMode="numeric"
                    minLength={6}
                    maxLength={10}
                    value={values.homeMobile}
                    error={errors.homeMobile}
                    disabled={disabled}
                    tooltip="Número de teléfono celular de la empresa o persona a la que va dirigido el paquete"
                    onChange={(event) => onChange('homeMobile', event.currentTarget.value)}
                  />
                </div>

                <Textarea
                  id="observaciones"
                  label="Observaciones (opcional)"
                  className={styles.spanFull}
                  maxLength={30}
                  value={values.homeObservations}
                  disabled={disabled}
                  tooltip="Observaciones que consideres necesarias acerca del domicilio de entrega"
                  onChange={(event) => onChange('homeObservations', event.currentTarget.value)}
                />
              </>
            )}
          </div>

          {/* Los productos se habilitan recién cuando hay cotización, igual que
              en el original (`#tipoProduc` arranca oculto y con los radios
              deshabilitados). */}
          {hasQuote && (
            <div className={styles.products}>
              <RadioGroup<NationalProduct>
                name="tipoProduc"
                legend="Elegí el servicio"
                disabled={disabled}
                value={values.product === '' ? null : values.product}
                onChange={(next) => onChange('product', next)}
                options={PRODUCTS.map((product) => {
                  const price = quotedPrices[product]
                  return {
                    value: product,
                    label: POSTAL_SERVICE_LABELS[product],
                    description: POSTAL_SERVICE_DELIVERY_TIMES[product],
                    disabled: price === undefined,
                    trailing:
                      price !== undefined ? (
                        <span className={styles.productRow}>
                          <span className={styles.productPrice}>
                            {formatCurrency(price.amount, price.currency)}
                          </span>
                        </span>
                      ) : undefined,
                  }
                })}
              />
            </div>
          )}
        </section>
      )}
    </div>
  )
}
