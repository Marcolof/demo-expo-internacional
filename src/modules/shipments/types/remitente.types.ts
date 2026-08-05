/**
 * Remitente comercial (razón social + CUIT), para el panel Resumen del
 * envío internacional comercial.
 *
 * `direccionFiscal` es el domicilio legal de la razón social; `direccionRemitente`
 * es el domicilio puntual desde el que se despacha este envío (pueden diferir,
 * ej. casa central vs. depósito).
 */
export interface Remitente {
  readonly cuit: string
  readonly razonSocial: string
  readonly direccionFiscal: string
  readonly direccionRemitente: string
  readonly email?: string
  readonly telefono?: string
}
