import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Money } from '@/core/types/common'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { PageContainer } from '@/shared/layout/PageContainer'
import { formatCurrency, formatWeightKg } from '@/shared/lib/formatCurrency'
import { Button } from '@/shared/ui/Button'
import { ShipmentSummary } from '../components/ShipmentSummary'
import type { SummaryRow } from '../components/ShipmentSummary'
import { initialNewShipmentForm } from '../forms/shipment.defaults'
import type { NewShipmentFormValues, ShipmentStep } from '../forms/shipment.schema'
import { ShipmentForm } from '../forms/ShipmentForm'
import { ScopeSwitch } from '../components/ScopeSwitch'
import {
  BRANCHES,
  PROVINCIAS,
  SAVED_ORIGIN_ADDRESSES,
} from '../mocks/shipments.mocks'
import type { NationalProduct } from '../types/shipment.types'
import styles from './NewShipmentPage.module.css'

const EMPTY = '-'
const noop = () => undefined

/**
 * Alta de envío — réplica de `/envioCla`.
 *
 * Estructura del HTML de referencia (`#prin.row.justify-content-center`):
 *   .carga.col-md-6          → formulario
 *   #resumenMobile.col-md-6  → resumen (interno centrado con #infoRe.col-10)
 *   order-md-3               → Cancelar / Siguiente
 *   #seccionPagar.order-md-4 → Pagar
 */
export function NewShipmentPage() {
  const { user } = usePermissions()
  const navigate = useNavigate()
  const [values, setValues] = useState<NewShipmentFormValues>(() => initialNewShipmentForm(user))
  const currentStep: ShipmentStep = 'ORIGEN'
  const quotedPrices: Readonly<Partial<Record<NationalProduct, Money>>> = {}

  const handleChange = <K extends keyof NewShipmentFormValues>(
    field: K,
    value: NewShipmentFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const originRows: readonly SummaryRow[] = useMemo(() => {
    const address =
      values.originKind === 'PICKUP'
        ? SAVED_ORIGIN_ADDRESSES.find((option) => option.value === values.originAddressId)?.label
        : (() => {
            const branch = BRANCHES.find((item) => item.code === values.originBranchCode)
            const province = PROVINCIAS.find((item) => item.code === values.originProvinceCode)
            if (branch === undefined) return undefined
            return `SUC: ${branch.name}${province !== undefined ? `, ${province.name}` : ''}`
          })()

    return [
      {
        label: 'Nombre y apellido / Razón social',
        value: values.originName === '' ? EMPTY : values.originName,
      },
      { label: 'Dirección', value: address ?? EMPTY },
    ]
  }, [
    values.originKind,
    values.originAddressId,
    values.originBranchCode,
    values.originProvinceCode,
    values.originName,
  ])

  const packageRows: readonly SummaryRow[] = useMemo(() => {
    const hasMeasures =
      values.lengthCm !== '' && values.widthCm !== '' && values.heightCm !== ''

    return [
      {
        label: 'Medidas',
        value: hasMeasures
          ? `${values.lengthCm} x ${values.widthCm} x ${values.heightCm} cm`
          : EMPTY,
      },
      {
        label: 'Peso',
        value:
          values.weightKg === ''
            ? EMPTY
            : formatWeightKg(Number(values.weightKg.replace(',', '.')) || 0),
      },
      {
        label: 'Valor',
        value:
          values.declaredValue === ''
            ? EMPTY
            : formatCurrency(Number(values.declaredValue.replace(',', '.')) || 0),
      },
    ]
  }, [values.lengthCm, values.widthCm, values.heightCm, values.weightKg, values.declaredValue])

  const destinationRows: readonly SummaryRow[] = useMemo(() => {
    if (values.deliveryKind === 'SUCURSAL') {
      const branch = BRANCHES.find((item) => item.code === values.branchDestinationCode)
      return [
        {
          label: 'Nombre y apellido / Razón social',
          value: values.branchRecipientName === '' ? EMPTY : values.branchRecipientName,
        },
        { label: 'Sucursal de destino', value: branch === undefined ? EMPTY : `SUC: ${branch.name}` },
      ]
    }

    if (values.deliveryKind === 'DOMICILIO') {
      const province = PROVINCIAS.find((item) => item.code === values.homeProvinceCode)
      const location = [values.homeCity, province?.name].filter(
        (part): part is string => part !== undefined && part !== '',
      )
      return [
        {
          label: 'Nombre y apellido / Razón social',
          value: values.homeRecipientName === '' ? EMPTY : values.homeRecipientName,
        },
        {
          label: 'Dirección',
          value:
            values.homeAddress === ''
              ? EMPTY
              : `${values.homeAddress}${location.length > 0 ? `, ${location.join(', ')}` : ''}`,
        },
      ]
    }

    return [{ label: 'Destino', value: EMPTY }]
  }, [
    values.deliveryKind,
    values.branchRecipientName,
    values.branchDestinationCode,
    values.homeRecipientName,
    values.homeAddress,
    values.homeCity,
    values.homeProvinceCode,
  ])

  return (
    <PageContainer width="full">
      {/* #prin.row.justify-content-center */}
      <div className={styles.prin}>
        {/* .carga.col-12.col-md-6.px-1.px-5 */}
        <div className={styles.carga}>
          <h3 className={styles.title}>Nuevo envío | Paquetería</h3>

          <div className={styles.loadTabs} role="tablist" aria-label="Tipo de carga">
            <div className={styles.loadTablist}>
              <button type="button" role="tab" aria-selected="true" className={styles.loadTabActive}>
                Individual
              </button>
              <span role="tab" aria-selected="false" className={styles.loadTabInactive}>
                Masivo
              </span>
            </div>
          </div>

          <ShipmentForm
            values={values}
            errors={{}}
            onChange={handleChange}
            currentStep={currentStep}
            quotedPrices={quotedPrices}
            onSaveMeasure={noop}
          />
        </div>

        {/* #resumenMobile.col-12.col-md-6 */}
        <div className={styles.resumen}>
          {/* .row.justify-content-center.mx-3.mx-md-2.px-md-4 */}
          <div className={styles.resumenCenter}>
            {/* #infoRe.col-10 */}
            <div className={styles.infoRe}>
              {/* Switch Nacional / Internacional (Figma 5578:12020), encima del
                  resumen. Su borde superior alinea con la base de los tabs
                  Individual / Masivo de la izquierda (ver .infoRe en el CSS). */}
              <ScopeSwitch
                className={styles.scopeSwitch}
                value="nacional"
                onChange={(scope) => {
                  if (scope === 'internacional') navigate('/internacional')
                }}
              />

              <ShipmentSummary
                currentStep={currentStep}
                origin={originRows}
                packageRows={packageRows}
                destination={destinationRows}
                onEditStep={noop}
                readOnly
                payButton={
                  <Button variant="primary" shape="square" fullWidth disabled onClick={noop}>
                    Pagar
                  </Button>
                }
              />
            </div>
          </div>
        </div>

        {/* Cancelar / Siguiente — order-md-3 */}
        <div className={styles.navActions}>
          <div className={styles.navActionsInner}>
            <div className={styles.navActionsStart}>
              <Button variant="tertiary" onClick={noop}>
                Cancelar
              </Button>
            </div>
            <div className={styles.navActionsEnd}>
              <Button variant="primary" size="step" onClick={noop}>
                Siguiente
              </Button>
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  )
}
