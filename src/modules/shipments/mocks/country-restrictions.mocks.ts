/**
 * Restricciones de contenido por país de destino (maqueta).
 * Mapea código ISO → IDs de artículos del seed que NO pueden enviarse.
 *
 * Solo aplica cuando shippingAvailable = true; los países sin servicio
 * (Rusia, Cuba, Corea del Norte) se manejan por separado.
 *
 * Asignación de ejemplo para demo:
 *   UY — no se puede enviar indumentaria (Remera de algodón · art-001)
 *   MX — no se puede enviar calzado       (Zapatillas urbanas · art-002)
 *   ES — no se puede enviar marroquinería (Mochila de nylon  · art-003)
 */
export const COUNTRY_CONTENT_RESTRICTIONS: Readonly<Record<string, readonly string[]>> = {
  UY: ['art-001'],
  MX: ['art-002'],
  ES: ['art-003'],
}
