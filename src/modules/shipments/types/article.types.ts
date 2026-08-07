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

/**
 * Categoría "Documento" (doc funcional §5.5) cambia el vocabulario de toda la
 * sección de contenido ("artículo" → "documento") y el ícono de la tarjeta
 * (Figma 7944:15282), pero **no** un campo distinto: el requerimiento (§5.6)
 * exige código armonizado, cantidad, valor y peso por igual para ambos tipos
 * de finalidad, y no describe una estructura de campos separada para
 * "documento". Esta suposición queda registrada en ANALISIS-FUNCIONAL.md
 * §3.1 para confirmar contra el diseño.
 */
export type ArticleKind = 'ARTICLE' | 'DOCUMENT'

export interface ArticleKindText {
  readonly addButtonLabel: string
  readonly modalTitle: string
  readonly descriptionLabel: string
  readonly descriptionHint: string
  readonly emptyStateTitle: string
  readonly quantityTotalLabel: string
  readonly removeActionLabel: string
}

export const ARTICLE_KIND_TEXT: Record<ArticleKind, ArticleKindText> = {
  ARTICLE: {
    addButtonLabel: 'Agregar artículo',
    modalTitle: 'Agregar artículo',
    descriptionLabel: 'Descripción del artículo',
    descriptionHint: 'Ej.: Remera de algodón.',
    emptyStateTitle: 'Acá vas a ver los artículos que agregues',
    quantityTotalLabel: 'Cantidad de artículos',
    removeActionLabel: 'Eliminar artículo',
  },
  DOCUMENT: {
    addButtonLabel: 'Agregar documento',
    modalTitle: 'Agregar documento',
    descriptionLabel: 'Descripción del documento',
    descriptionHint: 'Ej.: Contrato de compraventa.',
    emptyStateTitle: 'Acá vas a ver los documentos que agregues',
    quantityTotalLabel: 'Cantidad de documentos',
    removeActionLabel: 'Eliminar documento',
  },
}
