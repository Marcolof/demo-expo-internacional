import type { SelectOption } from '@/core/types/common'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { SHIPMENT_STATUS_LABELS } from '../types/shipment.types'
import type { Shipment, ShipmentScope, ShipmentStatus } from '../types/shipment.types'
import styles from './ShipmentFilters.module.css'

export interface ShipmentFilterValues {
  /** Busca en número de orden, seguimiento y nombre del destinatario. */
  readonly search: string
  readonly status: ShipmentStatus | ''
  readonly scope: ShipmentScope | ''
}

export const EMPTY_SHIPMENT_FILTERS: ShipmentFilterValues = {
  search: '',
  status: '',
  scope: '',
}

const STATUS_OPTIONS: readonly SelectOption[] = (
  Object.keys(SHIPMENT_STATUS_LABELS) as readonly ShipmentStatus[]
).map((status) => ({ value: status, label: SHIPMENT_STATUS_LABELS[status] }))

const SCOPE_OPTIONS: readonly SelectOption[] = [
  { value: 'NACIONAL', label: 'Nacional' },
  { value: 'INTERNACIONAL', label: 'Internacional' },
]

export interface ShipmentFiltersProps {
  readonly values: ShipmentFilterValues
  readonly onChange: (values: ShipmentFilterValues) => void
  readonly resultCount: number
  readonly totalCount: number
}

/**
 * Filtros de la grilla. El filtrado en sí lo hace `filterShipments`, exportada
 * acá abajo, para que la página no repita la lógica.
 */
export function ShipmentFilters({
  values,
  onChange,
  resultCount,
  totalCount,
}: ShipmentFiltersProps) {
  const hasFilters =
    values.search !== '' || values.status !== '' || values.scope !== ''

  return (
    <div className={styles.filters}>
      <Input
        id="filtro-busqueda"
        label="Buscar por orden, seguimiento o destinatario"
        value={values.search}
        onChange={(event) => onChange({ ...values, search: event.currentTarget.value })}
      />

      <Select
        id="filtro-estado"
        label="Estado"
        placeholderOption="Todos"
        placeholderOptionValue=""
        options={STATUS_OPTIONS}
        value={values.status}
        onChange={(event) =>
          onChange({ ...values, status: event.currentTarget.value as ShipmentStatus | '' })
        }
      />

      <Select
        id="filtro-alcance"
        label="Tipo de envío"
        placeholderOption="Todos"
        placeholderOptionValue=""
        options={SCOPE_OPTIONS}
        value={values.scope}
        onChange={(event) =>
          onChange({ ...values, scope: event.currentTarget.value as ShipmentScope | '' })
        }
      />

      <Button
        variant="link"
        className={styles.reset}
        disabled={!hasFilters}
        onClick={() => onChange(EMPTY_SHIPMENT_FILTERS)}
      >
        Limpiar filtros
      </Button>

      <span className={styles.count}>
        Mostrando {resultCount} de {totalCount} envíos
      </span>
    </div>
  )
}

/** Aplica los filtros. Se exporta junto al componente porque son una unidad. */
export function filterShipments(
  shipments: readonly Shipment[],
  filters: ShipmentFilterValues,
): readonly Shipment[] {
  const search = filters.search.trim().toLowerCase()

  return shipments.filter((shipment) => {
    if (filters.status !== '' && shipment.status !== filters.status) return false
    if (filters.scope !== '' && shipment.scope !== filters.scope) return false

    if (search === '') return true

    const haystack = [shipment.orderNumber, shipment.trackingCode, shipment.destination.name]
      .filter((part): part is string => part !== undefined)
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}
