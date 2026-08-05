/**
 * Chrome de navegación de la maqueta (réplica visual del HTML de referencia).
 *
 * Ningún ítem navega: son datos para pintar el sidebar y el menú de usuario.
 * La única ruta real de la app es `/` (Nuevo envío | Paquetería).
 *
 * Los íconos son los PNG originales del sitio real, recortados a mano
 * (`documentation/` no lo detalla porque fue un ajuste puntual de assets, no
 * de código): cada uno traía un margen transparente distinto dentro del
 * canvas (32×32, 22×25, 22×21, 28×28, 39×39…), así que aunque comparten color
 * y estilo, se veían de tamaños distintos en el riel. Se recortó el margen
 * transparente de cada uno para que el dibujo ocupe una proporción pareja
 * de su lienzo — el archivo sigue siendo el mismo PNG de producción.
 */

import addIcon from '@/assets/icons/add.png'
import cajaIcon from '@/assets/icons/caja.png'
import enchufeIcon from '@/assets/icons/enchufe.png'
import homeIcon from '@/assets/icons/home.png'
import monedaIcon from '@/assets/icons/moneda.png'
import personaIcon from '@/assets/icons/persona.png'
import serviciosIcon from '@/assets/icons/servicios.png'

/** Única ruta de la maqueta. */
export const ROUTES = {
  newShipment: '/',
} as const

/** Ítem del riel desktop (iconos, como `#contenedorSidebarPagina`). */
export interface SidebarRailItem {
  readonly id: string
  readonly label: string
  readonly icon: string
  /** En el original sólo aparecen en el riel mobile (`d-lg-none`). */
  readonly mobileOnly?: boolean
}

/**
 * Riel lateral del HTML de referencia:
 * Panel, Mis Envíos, Servicios, Mi Saldo, Integraciones
 * (+ Mi perfil / Nuevo envío sólo en mobile).
 */
export const SIDEBAR_RAIL: readonly SidebarRailItem[] = [
  { id: 'panel', label: 'Panel', icon: homeIcon },
  { id: 'mis-envios', label: 'Mis Envios - Pendientes', icon: cajaIcon },
  { id: 'servicios', label: 'Servicios - Oficios judiciales', icon: serviciosIcon },
  { id: 'mi-saldo', label: 'Mi Saldo - Movimientos saldo', icon: monedaIcon },
  { id: 'integraciones', label: 'Integraciones', icon: enchufeIcon },
  { id: 'mi-perfil', label: 'Mi perfil', icon: personaIcon, mobileOnly: true },
  { id: 'nuevo-envio', label: 'Nuevo envío', icon: addIcon, mobileOnly: true },
]

/** Entrada del cajón mobile (offcanvas). */
export interface SidebarDrawerItem {
  readonly id: string
  readonly label: string
  readonly icon: string
  readonly children?: readonly string[]
  /** En el original: `d-lg-none`. */
  readonly mobileOnly?: boolean
}

/**
 * Menú del offcanvas del HTML de referencia.
 * Los hijos se muestran al expandir; no navegan.
 */
export const SIDEBAR_DRAWER: readonly SidebarDrawerItem[] = [
  { id: 'panel', label: 'Panel', icon: homeIcon },
  {
    id: 'mis-envios',
    label: 'Mis envíos',
    icon: cajaIcon,
    children: ['Envios pagados', 'Envios pendientes', 'Envíos de usuarios'],
  },
  {
    id: 'servicios',
    label: 'Servicios',
    icon: serviciosIcon,
    children: ['Oficios judiciales', 'Mis Comunicaciones Digitales'],
  },
  {
    id: 'mi-saldo',
    label: 'Mi saldo',
    icon: monedaIcon,
    children: ['Saldo: $*** ARS', 'Recargar saldo', 'Movimientos', 'Comprobantes'],
  },
  { id: 'integraciones', label: 'Integraciones', icon: enchufeIcon },
  {
    id: 'mi-cuenta',
    label: 'Mi cuenta',
    icon: personaIcon,
    mobileOnly: true,
    children: [
      'Mi Perfil',
      'Agregar Usuarios',
      'Mis Promociones',
      'Estadísticas',
      'Ingresar Reclamos',
      'Cerrar sesión',
    ],
  },
  { id: 'nuevo-envio', label: 'Nuevo envío', icon: addIcon, mobileOnly: true },
]

/** Ítems del desplegable "Mi cuenta" del header (HTML de referencia). */
export const HEADER_USER_MENU: readonly string[] = [
  'Mi Perfil',
  'Agregar Usuarios',
  'Mis Promociones',
  'Estadísticas',
  'Ingresar Reclamos',
  'Cerrar sesión',
]
