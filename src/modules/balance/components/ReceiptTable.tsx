import { useState } from 'react'
import { formatDate } from '@/shared/lib/formatDate'
import { formatMoney } from '@/shared/lib/formatCurrency'
import { Badge } from '@/shared/ui/Badge'
import type { BadgeTone } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { DataTable } from '@/shared/ui/DataTable'
import type { DataTableColumn } from '@/shared/ui/DataTable'
import { Pagination } from '@/shared/ui/Pagination'
import { useToast } from '@/shared/ui/Toast'
import type { Receipt } from '../types/balance.types'
import { RECEIPT_TYPE_LABELS } from '../types/balance.types'
import styles from './ReceiptTable.module.css'

export interface ReceiptTableProps {
  readonly receipts: readonly Receipt[]
  readonly isLoading?: boolean
}

/** Filas por página. El paginador recién aparece si hay más que esto. */
const PAGE_SIZE = 10

/** El tono es decisión de la vista: el tipo de comprobante no sabe de colores. */
const TYPE_TONE: Record<Receipt['type'], BadgeTone> = {
  FACTURA_A: 'info',
  FACTURA_B: 'info',
  FACTURA_E: 'info',
  NOTA_CREDITO: 'warning',
  RECIBO: 'neutral',
}

/** Grilla de comprobantes con descarga simulada. */
export function ReceiptTable({ receipts, isLoading = false }: ReceiptTableProps) {
  const { showToast } = useToast()
  const [page, setPage] = useState(1)

  const pageCount = Math.max(1, Math.ceil(receipts.length / PAGE_SIZE))
  // Al cambiar de escenario la lista se acorta: la página guardada puede quedar
  // fuera de rango, así que se recorta en el render y no con un efecto.
  const currentPage = Math.min(page, pageCount)
  const visible = receipts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const columns: readonly DataTableColumn<Receipt>[] = [
    {
      id: 'number',
      header: 'Comprobante',
      render: (receipt) => <span className={styles.number}>{receipt.number}</span>,
    },
    {
      id: 'type',
      header: 'Tipo',
      render: (receipt) => (
        <Badge tone={TYPE_TONE[receipt.type]}>{RECEIPT_TYPE_LABELS[receipt.type]}</Badge>
      ),
    },
    {
      id: 'issuedAt',
      header: 'Fecha',
      render: (receipt) => formatDate(receipt.issuedAt),
    },
    {
      id: 'total',
      header: 'Total',
      align: 'right',
      render: (receipt) => <span className={styles.total}>{formatMoney(receipt.total)}</span>,
    },
    {
      id: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (receipt) => (
        <Button
          variant="link"
          size="sm"
          onClick={() => {
            showToast(
              `La descarga del comprobante ${receipt.number} es simulada en esta maqueta.`,
              'info',
            )
          }}
        >
          Descargar
        </Button>
      ),
    },
  ]

  return (
    <div className={styles.wrapper}>
      <DataTable
        columns={columns}
        rows={visible}
        getRowId={(receipt) => receipt.id}
        isLoading={isLoading}
        caption="Comprobantes emitidos de la cuenta"
        emptyState={<p className={styles.empty}>Todavía no hay comprobantes emitidos.</p>}
      />

      {receipts.length > PAGE_SIZE && (
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          onPageChange={setPage}
          totalItems={receipts.length}
          pageSize={PAGE_SIZE}
        />
      )}
    </div>
  )
}
