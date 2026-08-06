import type { KeyboardEvent, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './DataTable.module.css'

export type DataTableAlign = 'left' | 'center' | 'right'

export interface DataTableColumn<TRow> {
  readonly id: string
  readonly header: string
  readonly render: (row: TRow) => ReactNode
  readonly align?: DataTableAlign
  readonly width?: string
  readonly headerHint?: string
}

export interface DataTableProps<TRow> {
  readonly columns: readonly DataTableColumn<TRow>[]
  readonly rows: readonly TRow[]
  readonly getRowId: (row: TRow) => string
  readonly onRowClick?: (row: TRow) => void
  readonly emptyState?: ReactNode
  readonly caption?: string
  readonly isLoading?: boolean
}

const ALIGN_CLASS: Record<DataTableAlign, string | undefined> = {
  left: styles.alignLeft,
  center: styles.alignCenter,
  right: styles.alignRight,
}

/** Filas fantasma mientras carga. */
const SKELETON_ROWS = 3

/**
 * Tabla genérica con el look de `.mcr-table`: filas separadas, con sombra y
 * esquinas redondeadas.
 *
 * No conoce los datos: cada columna trae su propio `render`. Siempre va dentro
 * de un contenedor con scroll horizontal para que una tabla ancha no ensanche
 * la página.
 */
export function DataTable<TRow>({
  columns,
  rows,
  getRowId,
  onRowClick,
  emptyState,
  caption,
  isLoading = false,
}: DataTableProps<TRow>) {
  const isClickable = onRowClick !== undefined

  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, row: TRow) => {
    if (onRowClick === undefined) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onRowClick(row)
  }

  return (
    <div className={styles.scroller}>
      <table className={styles.table}>
        {caption !== undefined && caption !== '' && (
          <caption className={styles.caption}>{caption}</caption>
        )}

        <thead className={styles.head}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                style={column.width !== undefined ? { width: column.width } : undefined}
                className={cn(styles.headerCell, ALIGN_CLASS[column.align ?? 'left'])}
              >
                {column.header}
                {column.headerHint !== undefined && column.headerHint !== '' && (
                  <small className={styles.headerHint}>{column.headerHint}</small>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading &&
            Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <tr key={`skeleton-${String(index)}`} className={styles.row}>
                {columns.map((column) => (
                  <td key={column.id} className={styles.cell}>
                    <span className={styles.skeleton} />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading && rows.length === 0 && (
            <tr className={styles.row}>
              <td colSpan={columns.length} className={cn(styles.cell, styles.emptyCell)}>
                {emptyState}
              </td>
            </tr>
          )}

          {!isLoading &&
            rows.map((row) => (
              <tr
                key={getRowId(row)}
                className={cn(styles.row, isClickable && styles.rowClickable)}
                tabIndex={isClickable ? 0 : undefined}
                onClick={isClickable ? () => onRowClick?.(row) : undefined}
                onKeyDown={isClickable ? (event) => handleKeyDown(event, row) : undefined}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(styles.cell, ALIGN_CLASS[column.align ?? 'left'])}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
