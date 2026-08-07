/**
 * Artículos y documentos declarados de ejemplo (paso Declaración, envío
 * internacional). Nada de esto sale de VUCE ni de un backend real: son datos
 * fijos para poblar la maqueta con la vista "FILLED".
 *
 * El código armonizado sigue el formato de ejemplo acordado con el equipo:
 * dos letras + 9 dígitos + "AR" (ej. RR123456789AR).
 */

import type { DeclaredArticle } from '../types/article.types'

export const DECLARED_ARTICLES_SEED: readonly DeclaredArticle[] = [
  {
    id: 'art-001',
    description: 'Remera de algodón',
    harmonizedCode: 'RR123456789AR',
    quantity: 12,
    unitPriceUsd: 8.5,
    unitWeightKg: 0.2,
  },
  {
    id: 'art-002',
    description: 'Zapatillas urbanas',
    harmonizedCode: 'RR234567891AR',
    quantity: 6,
    unitPriceUsd: 22,
    unitWeightKg: 0.9,
  },
  {
    id: 'art-003',
    description: 'Mochila de nylon',
    harmonizedCode: 'RR345678912AR',
    quantity: 3,
    unitPriceUsd: 15,
    unitWeightKg: 0.6,
  },
]

/** Documentos declarados de ejemplo (categoría "Documento", Figma §5.5). */
export const DECLARED_DOCUMENTS_SEED: readonly DeclaredArticle[] = [
  {
    id: 'doc-001',
    description: 'Sucesión herencia',
    harmonizedCode: 'RR123456789AR',
    quantity: 10,
    unitPriceUsd: 30,
    unitWeightKg: 0.1,
  },
  {
    id: 'doc-002',
    description: 'Contrato de compraventa',
    harmonizedCode: 'RR234567891AR',
    quantity: 3,
    unitPriceUsd: 50,
    unitWeightKg: 0.1,
  },
  {
    id: 'doc-003',
    description: 'Certificado de origen',
    harmonizedCode: 'RR345678912AR',
    quantity: 1,
    unitPriceUsd: 15,
    unitWeightKg: 0.05,
  },
]
