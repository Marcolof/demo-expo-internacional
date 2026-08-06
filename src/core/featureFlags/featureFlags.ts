/**
 * Feature flags de la maqueta.
 *
 * Sirven para mostrarle a Desarrollo el MISMO código con una funcionalidad
 * encendida o apagada, sin ramas paralelas. La navegación y los módulos los
 * leen con `useFeatureFlag`.
 */

export type FeatureFlag =
  /** Habilita el alta de envíos internacionales (Paquetería Internacional). */
  | 'INTERNATIONAL_SHIPMENTS'
  /** Habilita la sección Mis Comunicaciones Digitales en la navegación. */
  | 'DIGITAL_COMMUNICATIONS'
  /** Habilita la pestaña "Masivo" del alta de envíos. */
  | 'BULK_UPLOAD'
  /** Habilita el módulo Mi Saldo completo (saldo, recarga, comprobantes). */
  | 'BALANCE_MODULE'
  /** Muestra el bloque de Representación ante Aduana en envíos comerciales. */
  | 'CUSTOMS_REPRESENTATION'
  /** Exige código armonizado también en envíos sin fines comerciales. */
  | 'HARMONIZED_CODE_REQUIRED'
  /** Habilita Pick Up como origen. En la etapa 1 de internacional no aplica. */
  | 'PICKUP_ORIGIN'
  /** Muestra la barra de herramientas de demostración. */
  | 'DEMO_TOOLBAR'

export const FEATURE_FLAGS: readonly FeatureFlag[] = [
  'INTERNATIONAL_SHIPMENTS',
  'DIGITAL_COMMUNICATIONS',
  'BULK_UPLOAD',
  'BALANCE_MODULE',
  'CUSTOMS_REPRESENTATION',
  'HARMONIZED_CODE_REQUIRED',
  'PICKUP_ORIGIN',
  'DEMO_TOOLBAR',
]

export const FEATURE_FLAG_LABELS: Record<FeatureFlag, string> = {
  INTERNATIONAL_SHIPMENTS: 'Envíos internacionales',
  DIGITAL_COMMUNICATIONS: 'Comunicaciones Digitales',
  BULK_UPLOAD: 'Carga masiva',
  BALANCE_MODULE: 'Módulo Mi Saldo',
  CUSTOMS_REPRESENTATION: 'Representación ante Aduana',
  HARMONIZED_CODE_REQUIRED: 'Código armonizado obligatorio',
  PICKUP_ORIGIN: 'Origen Pick Up',
  DEMO_TOOLBAR: 'Barra de demostración',
}

export type FeatureFlagState = Readonly<Record<FeatureFlag, boolean>>

/**
 * Valores por defecto.
 *
 * `HARMONIZED_CODE_REQUIRED` arranca en `true` porque el cambio más reciente
 * del requerimiento lo vuelve obligatorio en ambos flujos (comercial y no
 * comercial). `PICKUP_ORIGIN` arranca en `true` porque el HTML de referencia
 * — que es nacional — lo tiene activo; en internacional etapa 1 no aplica.
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlagState = {
  INTERNATIONAL_SHIPMENTS: true,
  DIGITAL_COMMUNICATIONS: true,
  BULK_UPLOAD: true,
  BALANCE_MODULE: true,
  CUSTOMS_REPRESENTATION: true,
  HARMONIZED_CODE_REQUIRED: true,
  PICKUP_ORIGIN: true,
  DEMO_TOOLBAR: true,
}

export function isFeatureEnabled(state: FeatureFlagState, flag: FeatureFlag): boolean {
  return state[flag]
}
