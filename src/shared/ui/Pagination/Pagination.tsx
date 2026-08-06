import { Button } from '@/shared/ui/Button'
import styles from './Pagination.module.css'

export interface PaginationProps {
  /** Página actual, base 1. */
  readonly page: number
  readonly pageCount: number
  readonly onPageChange: (page: number) => void
  readonly totalItems?: number
  readonly pageSize?: number
}

/** Cantidad de slots visibles antes de recortar con elipsis. */
const MAX_VISIBLE = 7

type PaginationItem =
  | { readonly kind: 'page'; readonly page: number }
  | { readonly kind: 'gap'; readonly id: string }

/**
 * Arma la lista de slots: primera, última, la ventana alrededor de la actual y
 * elipsis en los huecos. Siempre devuelve como máximo `MAX_VISIBLE` números.
 */
function buildItems(page: number, pageCount: number): readonly PaginationItem[] {
  if (pageCount <= MAX_VISIBLE) {
    return Array.from({ length: pageCount }, (_, index) => ({
      kind: 'page' as const,
      page: index + 1,
    }))
  }

  const shown = new Set<number>([1, pageCount])

  if (page <= 4) {
    // Cerca del principio: se estira la ventana hacia adelante.
    for (let candidate = 2; candidate <= 5; candidate += 1) shown.add(candidate)
  } else if (page >= pageCount - 3) {
    // Cerca del final: se estira hacia atrás.
    for (let candidate = pageCount - 4; candidate <= pageCount - 1; candidate += 1) shown.add(candidate)
  } else {
    shown.add(page - 1)
    shown.add(page)
    shown.add(page + 1)
  }

  const sorted = [...shown].filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b)

  const items: PaginationItem[] = []
  let previous = 0
  for (const current of sorted) {
    if (previous !== 0 && current - previous > 1) {
      items.push({ kind: 'gap', id: `gap-${String(previous)}` })
    }
    items.push({ kind: 'page', page: current })
    previous = current
  }

  return items
}

/** Paginador genérico: no sabe qué se está paginando. */
export function Pagination({ page, pageCount, onPageChange, totalItems, pageSize }: PaginationProps) {
  const items = buildItems(page, pageCount)
  const isFirst = page <= 1
  const isLast = page >= pageCount

  const showRange = totalItems !== undefined && pageSize !== undefined && totalItems > 0
  const rangeFrom = (page - 1) * (pageSize ?? 0) + 1
  const rangeTo = Math.min(page * (pageSize ?? 0), totalItems ?? 0)

  return (
    <nav className={styles.pagination} aria-label="Paginación">
      {showRange && (
        <p className={styles.range}>
          Mostrando {rangeFrom}-{rangeTo} de {totalItems}
        </p>
      )}

      <div className={styles.controls}>
        <Button
          variant="secondary"
          size="sm"
          disabled={isFirst}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>

        <ul className={styles.pages}>
          {items.map((item) =>
            item.kind === 'gap' ? (
              <li key={item.id} className={styles.gap} aria-hidden="true">
                &hellip;
              </li>
            ) : (
              <li key={`page-${String(item.page)}`}>
                <Button
                  variant={item.page === page ? 'primary' : 'secondary'}
                  size="sm"
                  aria-label={`Página ${String(item.page)}`}
                  aria-current={item.page === page ? 'page' : undefined}
                  onClick={() => onPageChange(item.page)}
                >
                  {item.page}
                </Button>
              </li>
            ),
          )}
        </ul>

        <Button
          variant="secondary"
          size="sm"
          disabled={isLast}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </nav>
  )
}
