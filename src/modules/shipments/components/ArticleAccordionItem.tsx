import { useState } from 'react'
import { formatUsd, formatWeightKg } from '@/shared/lib/formatCurrency'
import { cn } from '@/shared/lib/cn'
import { articleTotalPriceUsd, articleTotalWeightKg } from '../types/article.types'
import type { DeclaredArticle } from '../types/article.types'
import styles from './ArticleAccordionItem.module.css'

export interface ArticleAccordionItemProps {
  readonly article: DeclaredArticle
  readonly onEdit?: (article: DeclaredArticle) => void
  readonly onRemove: (article: DeclaredArticle) => void
  /** Abierto al montar (por defecto, el último agregado). */
  readonly defaultOpen?: boolean
  /** Artículo restringido para el país de destino seleccionado. */
  readonly invalid?: boolean
}

/**
 * `boxes.svg` traído inline (no `<img>`) para poder pintarlo con
 * `currentColor`: el color lo define `.icon` en CSS a partir del token
 * `--correo-yellow`, en vez del hex fijo que trae el asset original.
 */
function BoxesIcon() {
  return (
    <svg className={styles.icon} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 1.33447C12.5441 1.33447 13.0775 1.48311 13.5439 1.76318L13.5449 1.76221L16.5449 3.56299L16.707 3.66748C17.0774 3.92378 17.3863 4.26062 17.6094 4.65381C17.8642 5.10305 17.9988 5.61096 18 6.12744V9.93408L21.5449 12.063L21.707 12.1675C22.0774 12.4238 22.3863 12.7606 22.6094 13.1538C22.8642 13.6031 22.9988 14.111 23 14.6274V17.8726C22.9988 18.3891 22.8642 18.8969 22.6094 19.3462C22.3545 19.7954 21.9877 20.171 21.5449 20.437V20.438L18.5449 22.2378L18.5439 22.2368C18.113 22.4956 17.6249 22.6399 17.124 22.6606C17.0833 22.6657 17.0421 22.6704 17 22.6704C16.9576 22.6704 16.916 22.6658 16.875 22.6606C16.3744 22.6398 15.8867 22.4954 15.4561 22.2368V22.2378L12 20.1655L8.54395 22.2378L8.54297 22.2368C8.11221 22.4953 7.62466 22.6399 7.12402 22.6606C7.08332 22.6657 7.04207 22.6704 7 22.6704C6.95759 22.6704 6.91602 22.6658 6.875 22.6606C6.37421 22.6397 5.88587 22.4956 5.45508 22.2368L2.45508 20.438V20.437C2.01232 20.171 1.64552 19.7954 1.39062 19.3462C1.13576 18.8969 1.00118 18.3891 1 17.8726V14.6274L1.00684 14.4351C1.03678 13.9855 1.16752 13.5471 1.39062 13.1538C1.64553 12.7046 2.01234 12.329 2.45508 12.063L6 9.93408V6.12744C6.00121 5.61096 6.13579 5.10305 6.39062 4.65381C6.64553 4.2046 7.01234 3.82898 7.45508 3.56299L10.4551 1.76221V1.76318C10.9217 1.48285 11.4557 1.33447 12 1.33447ZM3 17.8677L3.00879 17.9966C3.02556 18.1236 3.06631 18.2467 3.12988 18.3589C3.2147 18.5084 3.3371 18.6335 3.48438 18.7222L6 20.2319V17.0649L3 15.2612V17.8677ZM18 17.0649V20.2319L20.5156 18.7222C20.6629 18.6335 20.7853 18.5084 20.8701 18.3589C20.9547 18.2097 20.9993 18.0411 21 17.8696V15.2612L18 17.0649ZM8 17.0659V20.231L11 18.4321V15.2661L8 17.0659ZM13 18.4321L16 20.231V17.0659L13 15.2661V18.4321ZM3.94824 13.4985L7.00098 15.3335L10.0557 13.5005L6.99902 11.6655L3.94824 13.4985ZM13.9434 13.5005L16.998 15.3335L20.0508 13.4985L17 11.6655L13.9434 13.5005ZM8 9.93408L11 11.7339V8.56494L8 6.76123V9.93408ZM13 8.56494V11.7339L16 9.93408V6.76123L13 8.56494ZM12 3.33447C11.8187 3.33447 11.6408 3.38375 11.4854 3.47705L11.4844 3.47803L8.94824 4.99854L12 6.83252L15.0508 4.99854L12.5156 3.47803L12.5146 3.47705C12.3592 3.38375 12.1813 3.33447 12 3.33447Z"
      />
    </svg>
  )
}

function Chevron({ open }: { readonly open: boolean }) {
  return (
    <svg
      className={cn(styles.chevron, open && styles.chevronOpen)}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-.867 13.14A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.86L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

/**
 * Artículo declarado, en acordeón (Figma 7944:15068). Header con ícono +
 * descripción + cantidad + chevron; al expandir muestra el detalle y las
 * acciones Eliminar / Editar.
 */
export function ArticleAccordionItem({ article, onEdit, onRemove, defaultOpen = false, invalid = false }: ArticleAccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={cn(styles.card, invalid && styles.cardInvalid)}>
      <button type="button" className={styles.header} onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <BoxesIcon />
        <span className={styles.description}>{article.description}</span>
        <span className={styles.quantity}>Cant {article.quantity}</span>
        <Chevron open={open} />
      </button>

      {open && (
        <>
          <div className={styles.rows}>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Código armonizado</span>
              <span className={styles.rowValue}>{article.harmonizedCode}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Valor en dólares unitario</span>
              <span className={styles.rowValue}>{formatUsd(article.unitPriceUsd)}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Total en dólares</span>
              <span className={styles.rowValue}>{formatUsd(articleTotalPriceUsd(article))}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Peso unitario</span>
              <span className={styles.rowValue}>{formatWeightKg(article.unitWeightKg)}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Peso total</span>
              <span className={styles.rowValue}>{formatWeightKg(articleTotalWeightKg(article))}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.remove} onClick={() => onRemove(article)}>
              <TrashIcon />
              Eliminar artículo
            </button>

            {onEdit !== undefined && (
              <button type="button" className={styles.edit} onClick={() => onEdit(article)}>
                Editar
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
