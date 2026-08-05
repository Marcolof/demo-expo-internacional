import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './PageContainer.module.css'

export type PageWidth = 'narrow' | 'full'

export interface PageContainerProps {
  readonly children: ReactNode
  /** `full` para pantallas que manejan su propia grilla (la réplica de alta). */
  readonly width?: PageWidth
  readonly className?: string
}

/** Envoltorio del contenido de una pantalla. */
export function PageContainer({ children, width = 'narrow', className }: PageContainerProps) {
  return (
    <div className={cn(styles.content, styles[width], className)}>{children}</div>
  )
}
