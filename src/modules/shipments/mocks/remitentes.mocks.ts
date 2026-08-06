/**
 * Remitentes de ejemplo para el panel Resumen del envío internacional
 * comercial (sección "Origen", Figma 8040:120132 / captura de referencia).
 *
 * CUITs FICTICIOS con formato válido (XX-XXXXXXXX-X) — no corresponden a
 * contribuyentes reales, sólo sirven para poblar la maqueta.
 *
 * `findRemitenteByCuit` queda preparado para la próxima iteración: un paso de
 * búsqueda por CUIT antes de llegar a esta pantalla, que hoy no existe todavía.
 */

import type { Remitente } from '../types/remitente.types'

export const REMITENTES_SEED: readonly Remitente[] = [
  {
    cuit: '30-71659554-9',
    razonSocial: 'Loforte Encomiendas SRL',
    direccionFiscal: 'Cuenca 4567, San Martín, Buenos Aires',
    direccionRemitente: 'Av. Doctor Arturo Frondizi 4567, Pilar, Buenos Aires',
    email: 'comex@loforte-encomiendas.com.ar',
    telefono: '11 4567-8901',
  },
  {
    cuit: '30-70839221-4',
    razonSocial: 'Andes Textil S.A.',
    direccionFiscal: 'Ruta 9 Km 45, Pilar, Buenos Aires',
    direccionRemitente: 'Ruta 9 Km 45, Pilar, Buenos Aires',
    email: 'exportaciones@andestextil.com.ar',
    telefono: '11 4890-2233',
  },
  {
    cuit: '30-69541287-6',
    razonSocial: 'Marolio Hogar S.R.L.',
    direccionFiscal: 'Av. Juan B. Justo 3120, Rosario, Santa Fe',
    direccionRemitente: 'Zona Franca Rosario, Santa Fe',
    email: 'comercioexterior@marolio-hogar.com.ar',
    telefono: '341 555-7788',
  },
]

/** Búsqueda por CUIT — placeholder para el paso de "buscar remitente" de la próxima iteración. */
export function findRemitenteByCuit(cuit: string): Remitente | undefined {
  return REMITENTES_SEED.find((remitente) => remitente.cuit === cuit)
}
