/**
 * Une clases CSS descartando `false`, `null` y `undefined`.
 * Reemplazo mínimo de `clsx` — no vale traer una dependencia para esto.
 *
 *   cn(styles.button, isActive && styles.active)
 */
export type ClassValue = string | false | null | undefined

export function cn(...values: readonly ClassValue[]): string {
  return values.filter((value): value is string => typeof value === 'string' && value !== '').join(' ')
}
