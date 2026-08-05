import type { Id } from '@/core/types/common'

/** Artículo declarado en un envío internacional (paso Declaración). */
export interface DeclaredArticle {
  readonly id: Id
  readonly description: string
  readonly harmonizedCode: string
  readonly quantity: number
  readonly unitPriceUsd: number
  readonly unitWeightKg: number
}

/** Datos del formulario, antes de asignarles `id`. */
export type DeclaredArticleInput = Omit<DeclaredArticle, 'id'>

export function articleTotalPriceUsd(article: DeclaredArticle): number {
  return article.quantity * article.unitPriceUsd
}

export function articleTotalWeightKg(article: DeclaredArticle): number {
  return article.quantity * article.unitWeightKg
}
