/**
 * Favoritos de Origen (paso 3) para envíos internacionales.
 *
 * Persistidos en localStorage para sobrevivir “siguiente sesión” de la maqueta.
 * Independiente de `wizardStore` (memoria del envío actual, se limpia al pagar).
 *
 * Skip Paquete → Destino solo si `rememberRemitente` y `rememberBranch` son true.
 */

const STORAGE_KEY = 'micorreo.intl.originFavorites'

export interface OriginFavorites {
  readonly rememberRemitente: boolean
  readonly remitenteCuit: string
  readonly rememberBranch: boolean
  readonly province: string
  readonly branchId: string
}

const EMPTY: OriginFavorites = {
  rememberRemitente: false,
  remitenteCuit: '',
  rememberBranch: false,
  province: '',
  branchId: '',
}

function isOriginFavorites(value: unknown): value is OriginFavorites {
  if (value === null || typeof value !== 'object') return false
  const o = value as Record<string, unknown>
  return (
    typeof o.rememberRemitente === 'boolean' &&
    typeof o.remitenteCuit === 'string' &&
    typeof o.rememberBranch === 'boolean' &&
    typeof o.province === 'string' &&
    typeof o.branchId === 'string'
  )
}

function readRaw(): OriginFavorites {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return EMPTY
    const parsed: unknown = JSON.parse(raw)
    return isOriginFavorites(parsed) ? parsed : EMPTY
  } catch {
    return EMPTY
  }
}

function writeRaw(next: OriginFavorites): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Demo: silenciar cuota / modo privado.
  }
}

export const originFavoritesStore = {
  get: (): OriginFavorites => readRaw(),

  /** True cuando ambos bloques están marcados para recordar (habilita skip). */
  canSkipOrigen: (): boolean => {
    const fav = readRaw()
    return fav.rememberRemitente && fav.rememberBranch
  },

  setRemitente: (remember: boolean, remitenteCuit: string): void => {
    const prev = readRaw()
    writeRaw({
      ...prev,
      rememberRemitente: remember,
      remitenteCuit: remember ? remitenteCuit : prev.remitenteCuit,
    })
  },

  setBranch: (remember: boolean, province: string, branchId: string): void => {
    const prev = readRaw()
    writeRaw({
      ...prev,
      rememberBranch: remember,
      province: remember ? province : prev.province,
      branchId: remember ? branchId : prev.branchId,
    })
  },

  /** Sobrescribe valores favoritos de los bloques cuyo checkbox sigue activo. */
  persistFromOrigen: (params: {
    readonly rememberRemitente: boolean
    readonly remitenteCuit: string
    readonly rememberBranch: boolean
    readonly province: string
    readonly branchId: string
  }): void => {
    const prev = readRaw()
    writeRaw({
      rememberRemitente: params.rememberRemitente,
      remitenteCuit: params.rememberRemitente ? params.remitenteCuit : prev.remitenteCuit,
      rememberBranch: params.rememberBranch,
      province: params.rememberBranch ? params.province : prev.province,
      branchId: params.rememberBranch ? params.branchId : prev.branchId,
    })
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  },
}
