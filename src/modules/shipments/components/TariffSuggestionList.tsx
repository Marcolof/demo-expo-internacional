import { useEffect } from 'react'
import { cn } from '@/shared/lib/cn'
import type { TariffPositionSuggestion } from '../types/tariff-position.types'
import styles from './TariffSuggestionList.module.css'

export interface TariffSuggestionListProps {
  readonly id: string
  readonly suggestions: readonly TariffPositionSuggestion[]
  readonly activeId: string | undefined
  readonly onSelect: (suggestion: TariffPositionSuggestion) => void
}

/**
 * Lista de sugerencias de posición arancelaria bajo "Descripción del artículo".
 * Cada card muestra capítulo (categoría), denominación y código NCM, más el
 * sello "IA" de clasificación orientativa.
 */
export function TariffSuggestionList({
  id,
  suggestions,
  activeId,
  onSelect,
}: TariffSuggestionListProps) {
  useEffect(() => {
    if (activeId === undefined) return
    const option = document.getElementById(`${id}-${activeId}`)
    const list = option?.parentElement
    if (option === null || list == null) return

    const optionTop = option.offsetTop
    const optionBottom = optionTop + option.offsetHeight
    if (optionTop < list.scrollTop) {
      list.scrollTop = optionTop
    } else if (optionBottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = optionBottom - list.clientHeight
    }
  }, [activeId, id])

  return (
    <ul id={id} className={styles.list} role="listbox" aria-label="Posiciones arancelarias sugeridas">
      {suggestions.map((suggestion) => {
        const optionId = `${id}-${suggestion.id}`
        const isActive = suggestion.id === activeId

        return (
          <li
            key={suggestion.id}
            id={optionId}
            role="option"
            aria-selected={isActive}
            className={cn(styles.option, isActive && styles.optionActive)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(suggestion)}
          >
            <div className={styles.body}>
              <span className={styles.category}>{suggestion.category}</span>
              <span className={styles.product}>{suggestion.productName}</span>
              <span className={styles.code}>{suggestion.tariffPosition}</span>
            </div>
            <span className={styles.iaBadge} aria-label="Sugerencia de inteligencia artificial">
              IA
            </span>
          </li>
        )
      })}
    </ul>
  )
}
