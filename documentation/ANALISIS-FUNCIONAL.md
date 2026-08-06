# Análisis funcional

**Versión:** 1.0
**Fecha:** 4 de agosto de 2026
**Alcance:** pantalla de referencia (`/envioCla` — Nuevo envío | Paquetería, nacional) y su
relación con el requerimiento de Paquetería Internacional.

Este documento sigue la **Guía de análisis de pantallas** del requerimiento
(sección 21) y separa siempre: funcional · contenido · interacción · negocio · visual.

Cuando algo no está definido, se dice **Pendiente de confirmación funcional**. No se
inventa.

---

## 1. Pantalla analizada: Nuevo envío | Paquetería

### 1.1 Paso del flujo

Alta de envío **nacional**. Es el punto de partida del proyecto: la maqueta la reproduce
en `/` para tener una base visual y de interacción validada antes de construir el flujo
internacional.

> Ojo con la diferencia de flujos. El flujo nacional de la referencia es
> **Origen → Paquete → Destino**. El flujo internacional obligatorio del requerimiento es
> **Declaración → Paquete → Origen → Destino → Pendientes → Checkout → Pagados**.
> No son el mismo flujo y el internacional **no debe** reordenarse para parecerse al nacional.

### 1.2 Objetivo

Cargar remitente y origen, medidas y peso del paquete, destinatario y modalidad de
entrega, cotizar y pagar.

### 1.3 Campos visibles

**Origen**

| Campo (id original) | Tipo | Obligatorio |
|---|---|---|
| `inputOrigen` — Nombre y apellido / Razón social | texto | Sí |
| `checkPickUp` / `checkSucursal` — Pick Up / Sucursal | radio | Sí (Pick Up por defecto) |
| `dirOrigen` — Dirección de origen | select | Sí, si Pick Up |
| `sucursalProvinciaOrigen` — Provincia | select | Sí, si Sucursal |
| `sucursalOrigen` — Sucursal de origen | select | Sí, si Sucursal |
| `recordarSucursalCheckBox` — Utilizar esta sucursal para próximos envíos | checkbox | No |

**Paquete** — «Medidas del paquete (cm)»

| Campo | Tipo | Obligatorio |
|---|---|---|
| `medidasFrecuentes` — Medidas frecuentes | select | No |
| `largo` / `ancho` / `alto` | texto | Sí |
| `peso` — Peso (kg) | texto | Sí |
| `valorContenido` — Valor del contenido ($) | texto | Sí |

**Destino**

| Campo | Tipo | Obligatorio |
|---|---|---|
| `nroOpcional` — N° de orden (opcional) | texto | No |
| `tipoEntrega` — Tipo de entrega | select | Sí |
| *Sucursal:* `nars2`, `provincia2`, `sucursalDestino2`, `correoElectronico2`, `codAreaPaqSuc`, `celularPaqSuc` | mixto | Sí |
| *Domicilio:* `nars`, `provincia`, `localidad`, `direCompleta`, `cpCpa`, `correoElectronico`, `codAreaPaqDom`, `celularPaqDom` | mixto | Sí |
| `observaciones` — Observaciones (opcional), máx. 30 | textarea | No |

**Producto** — `pqHoy` / `pqExpress` / `pqClasic`, deshabilitados hasta que haya cotización.

### 1.4 Validaciones detectadas

Los límites estaban en inputs ocultos de la página, no en el CSS ni en la UI:

| Límite | Valor | Origen |
|---|---|---|
| Lado máximo (largo, ancho, alto) | 200 cm | `maximo_largo` / `maximo_ancho` / `maximo_altura` |
| Suma de los tres lados | 300 cm | `maximo_laa` |
| Peso máximo | 50 kg | `pesoMaximoPermitido` |
| Código postal | 4 dígitos | `cpCpa` con `maxlength=4` |
| Cód. área | 2–4 dígitos | `minlength` / `maxlength` |
| Celular | 6–8 (sucursal) / 6–10 (domicilio) dígitos | `minlength` / `maxlength` |
| Observaciones | 30 caracteres | `maxlength=30` |

Reproducidas en `modules/shipments/forms/shipment.schema.ts`.

> **Nacional ≠ internacional.** El peso máximo nacional es **50 kg**; el internacional
> documentado es **20 kg**, y las medidas internacionales tienen la regla de que dos lados
> no superen 90 × 90 cm. No mezclar los dos conjuntos de límites.

### 1.5 Estados

- Un paso visible a la vez; los otros dos ocultos.
- Los productos arrancan deshabilitados y se habilitan al cotizar.
- **Pagar** arranca deshabilitado y se habilita al elegir servicio.
- Cualquier cambio en los datos **invalida la cotización** (regla del requerimiento,
  sección 11.3). Implementado: cualquier `onChange` limpia los precios.

### 1.6 Mensajes

Textos conservados literales:

- `* Campo obligatorio`
- `No constituye un seguro`
- `*El precio se encuentra sujeto al tarifario vigente al momento del pago.`
- `*La cotización no incluye pickup. Lo verás detallado al momento del pago.`
- `*Consultá las características de los servicios PAQ.AR.`
- `El código postal no se corresponde con la provincia.`

### 1.7 Modales

| Modal original | En la maqueta |
|---|---|
| `#exampleModal` — Guardar en medidas frecuentes | Sí |
| `#guardarInfo` — ¡Guardado exitosamente! | Resuelto con toast |
| `#guardarEnvio` — Guardar envío al salir | Sí |
| `#guardarCambios` — Guardar cambios | Cubierto por el anterior |
| `#myModalGenerico` — mensajes | Reemplazado por `Alert` / `Toast` |
| `#modalLoading` — Cargando… | Cubierto por `loadState` |

### 1.8 Campos mal ubicados o inconsistentes en el original

Hallazgos del análisis del HTML. **No se replicaron** los errores, se corrigieron:

1. **Ids duplicados.** El stepper existe dos veces (mobile y desktop) con los mismos ids
   (`ulenvios`, `lienvio`, `iconop1`…). HTML inválido. En la maqueta hay un solo
   componente `Stepper` que cambia por breakpoint.
2. **`name` duplicado.** `tipoEntrega` aparece en `#tipoEntrega` y en `#tipoEntrega2`.
3. **Tooltip copiado.** `dirOrigen` repite el tooltip de `inputOrigen`, que habla del
   nombre del remitente y no de la dirección. Corregido.
4. **`label for` roto.** En el resumen, `for="pesoT"` apunta a un id que no existe (el
   input es `#pesoTotal`).
5. **Placeholders que no coinciden con su label.** `Cód. Área` vs `Cód. Área (sin 0)`;
   `Celular` vs `Celular (sin 15)`.
6. **Erratas.** `Observacions`, `Normbre`, `Guardar envio`, `Tu envió … enviós`,
   `Modal gurdar cambios`, `El envio se guardo correctamente`, `Ocurrio … intentelo`,
   `jsutify-content-center`, `colo:#49454f`.
7. **CP `00000`.** GC01 documenta `00000` para países sin código postal.
   **Pendiente de confirmación funcional.**
8. **Clases fantasma.** `divisor`, `resumen`, `link-baja`, `carga` se usan en el HTML pero
   no están definidas en ningún CSS.
9. **Datos en atributos equivocados.** Las `<option>` de sucursal guardan el código postal
   en el atributo `class`. En la maqueta el dato es una propiedad del modelo.

### 1.9 Dependencias entre campos

- Provincia → repuebla sucursales y limpia la sucursal elegida.
- Pick Up ↔ Sucursal → alterna dos conjuntos de campos distintos.
- Tipo de entrega → alterna Domicilio ↔ Sucursal.
- Medidas o peso → invalida la cotización y el producto elegido.
- Medidas frecuentes → autocompleta largo, ancho y alto.

---

## 2. Diferencias que impactan el flujo internacional

| Tema | Nacional (referencia) | Internacional (requerimiento) |
|---|---|---|
| Orden del flujo | Origen → Paquete → Destino | **Declaración** → Paquete → Origen → Destino → Pendientes → Checkout → Pagados |
| País | No aplica | Se elige en **Declaración**, no editable en Destino |
| Finalidad | No aplica | Con / sin fines comerciales |
| Servicio | Se elige al final, tras cotizar | Se elige **al final de Destino** |
| Origen | Pick Up o sucursal | Hasta 2 kg: sucursales propias · más de 2 kg: **sólo asiento aduanero** · nunca Puntos Correo |
| Pick Up | Disponible | **No contemplado** en la etapa 1 |
| Peso máximo | 50 kg | 20 kg (confirmar si es universal o por servicio) |
| Medidas | 200 cm por lado, 300 cm de suma | Dos lados no mayores a 90 × 90 cm |
| Peso | Uno solo | **Dos**: peso declarado del contenido ≠ peso total del paquete |
| Documentación | Rótulo | Rótulo, CN23, CP71, chequera EMS, declaración de contenido |
| Aduana | No aplica | Representación ante Aduana, sólo comerciales, activa por defecto |
| ARCA / Factura E | No aplica | Obligatorias en comerciales |

### 2.1 Lo ya preparado en la maqueta

- `ShipmentScope` (`NACIONAL` / `INTERNACIONAL`) y `ShipmentPurpose`.
- Los 4 servicios internacionales con sus plazos textuales del requerimiento.
- Peso volumétrico `L × A × Al / 6000` como **cálculo del sistema**, nunca un input.
- `hasCustomsOffice` en las sucursales, para la regla de los 2 kg.
- `customsRepresentationAccepted` en el modelo, con trazabilidad de la decisión.
- Los 14 estados conceptuales del requerimiento.
- `ConfirmDialog` con `emphasis="cancel"`, necesario para que el modal de Representación
  ante Aduana destaque **Mantener representación** como acción recomendada.
- Feature flags `INTERNATIONAL_SHIPMENTS`, `CUSTOMS_REPRESENTATION`,
  `HARMONIZED_CODE_REQUIRED`, `PICKUP_ORIGIN`.
- **Paso Declaración** completo: país, finalidad (fines comerciales), categoría (Regalo /
  Documento / Muestra comercial / Ayuda familiar / Envío de mercadería), alta de artículos
  con código armonizado obligatorio (`AddArticleModal`), declaración jurada con checkbox, y
  validación para avanzar (§5.5, §5.6).
- **Paso Paquete** completo: medidas frecuentes, largo/ancho/alto, peso del contenido
  (heredado de Declaración) vs. peso del paquete, y sus tres validaciones para avanzar
  (`validatePackageStep` en `InternationalShipmentPage.tsx`):
  - Medidas obligatorias y regla de §6.2 (ver interpretación en §3.1.6).
  - Peso del paquete ≥ peso del contenido declarado (§6.3), con el texto de error exacto
    del requerimiento.
  - Peso máximo 20 kg (§6.4), con el texto de error exacto del requerimiento.
- **Paso Origen** completo: remitente (`SAVED_ORIGIN_ADDRESSES`), provincia y sucursal de
  imposición, filtrada por `hasCustomsOffice` cuando el peso declarado supera 2 kg (§7.2).
  Mapa de la sucursal: placeholder gris (sin mapa real todavía).
- **Paso Destino** — foco de esta etapa, dividido en 3 componentes reutilizables:
  - `DestinatarioFields`: nombre, razón social, código de país + teléfono, correo,
    identificación tributaria. Orden de campos: ver discrepancia en §3.1.7.
  - `DestinoFields`: título + N° de orden (opcional, sin label) en la misma fila; país
    precargado desde Declaración (no editable, §8.4); provincia/estado, ciudad, código
    postal; hasta 3 líneas de dirección con agregar/eliminar (§8.5).
  - `PostalServiceCard`: card de servicio postal con radio, reutilizable — hoy sin reglas
    de disponibilidad (§9.3) ni cotización, sólo selección. Pensada para llevar esas
    validaciones más adelante (`disabled`/`disabledReason`/`trailing` ya contemplados en
    la interfaz).
  - Sin validación para avanzar todavía (a diferencia de Declaración/Paquete): "Siguiente"
    en Destino no valida ni navega (no hay paso siguiente construido).
  - Representación ante Aduana (§8.1 punto 4) **no implementada** — el modelo ya tiene
    `customsRepresentationAccepted` (ver arriba) pero la pantalla/modal no se construyó.
- **Variante "Documento" de la categoría** (§5.5, Figma 7944:15282): al elegir la categoría
  "Documento" en Declaración, toda la sección de contenido cambia su vocabulario de
  "artículo" a "documento" (botón, empty state, modal de alta, acordeón) y el ícono pasa de
  `boxes.svg` a `file-text.svg`. Implementado con un tipo `ArticleKind` (`ARTICLE` |
  `DOCUMENT`) y un diccionario de textos (`ARTICLE_KIND_TEXT` en `article.types.ts`),
  consumido por `AddArticleModal` y `ArticleAccordionItem`. **Los campos del formulario se
  mantuvieron idénticos** (descripción, código armonizado, cantidad, valor unitario, peso
  unitario) porque el requerimiento (§5.6) no describe una estructura distinta para
  "documento" — sólo dice que el código armonizado es obligatorio para ambos tipos, sin
  excepción. No se pudo verificar contra el diseño real de Figma en esta sesión (sin acceso
  al Dev Mode MCP); confirmar que la card de documento en 7944:15282 no oculta o agrega
  campos respecto de la de artículo.

### 2.2 Lo que falta construir

El checkout con recotización, la carga masiva, la documentación UPU, la pantalla de
Representación ante Aduana para comerciales, y la cotización/disponibilidad real del
servicio postal (§9.3). Los 4 pasos del wizard (Declaración/Paquete/Origen/Destino) ya
existen; después de Destino no hay pasos siguientes (Pendientes/Checkout/Pagados).

---

## 3. Definiciones pendientes

Se arrastran del requerimiento (sección 19). **La maqueta no las resuelve por su cuenta.**

| # | Tema | Qué falta definir |
|---|---|---|
| 1 | Designar representante | El instructivo v1.1 agrega una pantalla de CUIT/CUIL al desactivar la representación, pero el modal dice que el usuario debe presentarse personalmente en CPI Retiro. Se contradicen. Definir quién puede representar, si es obligatorio, si reemplaza la presentación personal, si se valida el CUIT y si entra al MVP. |
| 2 | «Atributos» o «tributos» | El cambio más reciente dice *atributos, si los hubiera*; los documentos anteriores dicen **tributos**. No corregir en silencio. |
| 3 | Servicios por país | No existe matriz final. **No está confirmada** la exclusión de Encomienda Internacional para EEUU / UE, y no debe inferirse. |
| 4 | Código armonizado | La regla vigente lo hace obligatorio en ambos flujos. Confirmar impacto en masivo, integraciones, documentos y fuente de consulta. |
| 5 | Restricciones de contenido | Definir fuente o API, catálogo, y si se valida por código, por descripción o por ambos. |
| 6 | Peso máximo | Confirmar si 20 kg es universal, por servicio o configurable por destino. |
| 7 | Plataformas externas / Zonos | **No asumir que Zonos fue aprobado.** Sin definir tipo de integración ni si se cobra o sólo se informa. |
| 8 | Declaración jurada | Confirmar si es checkbox, leyenda o confirmación final, y qué trazabilidad requiere. |
| 9 | Sucursales comerciales | La regla de 2 kg ahora aplica a ambos tipos y reemplaza «comercial siempre con asiento aduanero». Alinear backend, pantallas e instructivos. |
| 10 | Pago y facturación | Facturación, cancelación, devolución de saldo, comprobantes y conciliación. |
| 11 | Peso máximo de la categoría "Documento" | **Revisado el requerimiento completo: no existe ningún límite de peso específico para la categoría "Documento".** Los únicos límites de 2 kg documentados son (a) la regla de sucursales en Origen (§7.2/§9.9: hasta 2 kg sucursales propias, más de 2 kg sólo asiento aduanero) y (b) que el servicio "Pequeño Paquete" no está disponible por encima de 2 kg (§9.3). Ninguno de los dos es un tope propio de la categoría Documento. No implementar una validación de 2 kg para Documento sin que el área funcional lo confirme por escrito. |

### 3.1 Decisiones que la maqueta tomó y hay que validar

Al construirla hicieron falta definiciones que el requerimiento no cubre. Están marcadas
para revisión:

1. **Estados en los que se puede cancelar.** Se bloquea desde `EN_IMPOSICION` en adelante.
2. **«Rescatar».** Se interpretó como recuperar un envío **pagado y no impuesto**,
   devolviendo el importe como saldo. Confirmar el alcance real y el efecto contable.
3. **Estados editables.** Hasta `PENDIENTE_DE_PAGO`; un envío pagado no se modifica.
4. **Cotización simulada.** Fórmula inventada (`mocks/quote.mocks.ts`), no tarifario real.
5. **Favorito no eliminable.** Regla de producto agregada para poder demostrar un bloqueo
   por **negocio** y no por permiso. Confirmar si va.
6. **Regla de medidas del paso Paquete (§6.2).** El requerimiento dice *"dos de los lados
   no pueden superar 90 cm × 90 cm"*, una frase ambigua (¿es una condición sobre dos lados
   específicos? ¿sobre cualquier par?). La maqueta la implementó como: **a lo sumo un lado**
   de los tres (largo/ancho/alto) puede superar los 90 cm; si dos o más lo superan, no
   cumple. El requerimiento tampoco da el texto exacto del error (sólo dice "mostrar error;
   bloquear avance"), así que el mensaje mostrado (*"Al menos dos lados del paquete superan
   los 90 cm. Revisá las medidas para continuar."*) es redactado por la maqueta, no
   transcripto del documento — a diferencia de los errores de §6.3 y §6.4, que sí citan el
   texto recomendado literal. Confirmar ambas cosas con el área funcional.
7. **Orden de campos del Destinatario (§8.2 vs. Figma).** El requerimiento lista el orden
   textual como Nombre → Razón social → **Correo electrónico** → **Código telefónico** →
   Teléfono. El diseño (Figma 5589:10467) muestra Nombre/Razón social → **Código de país /
   Teléfono** → **Correo electrónico** → Identificación tributaria — el correo y el bloque
   de teléfono están invertidos respecto del texto. La maqueta siguió el diseño (fuente de
   verdad visual, por instrucción explícita), no el orden textual del §8.2. Confirmar cuál
   de los dos es el vigente.

---

## 4. Paso de Declaración: Categorías de envío internacional (§5.5)

El primer paso del flujo internacional requiere declarar la **finalidad** del envío, que determina
las reglas aduanales y fiscales aplicables.

### 4.1 Finalidad y categorías

**Envíos con fines comerciales:**
- `MERCADERIA` — Envío de mercadería (comercial)

**Envíos sin fines comerciales (no comerciales):**
| Categoría | Descripción | Identificador |
|---|---|---|
| Regalo | Obsequios personales, bienes de valor personal. | `REGALO` |
| Documento | Correspondencia oficial, libros, documentos sin valor comercial. | `DOCUMENTO` |
| Muestra comercial | Muestras gratuitas de productos, sin venta ni valor comercial declarado. | `MUESTRA` |
| Ayuda familiar | Remesas de asistencia económica hacia familiares en el exterior. | `AYUDA_FAMILIAR` |

### 4.2 Impacto por categoría

- **Comercial (`MERCADERIA`):** Requiere Factura E, declaración ante ARCA, representación ante Aduana (si aplica).
- **No comercial:** No requiere Factura E ni ARCA; el tratamiento aduanal es simplificado.
- **Cambios de categoría:** Invalidan la cotización, igual que modificar artículos o destino.

### 4.3 Implementación

Categorías en `InternationalShipmentPage.tsx`:
```ts
const NON_COMMERCIAL_CATEGORIES: readonly SelectOption[] = [
  { value: 'REGALO', label: 'Regalo' },
  { value: 'DOCUMENTO', label: 'Documento' },
  { value: 'MUESTRA', label: 'Muestra comercial' },
  { value: 'AYUDA_FAMILIAR', label: 'Ayuda familiar' },
]
```

La selección es **obligatoria** para habilitar "Agregar artículo" en el paso de Declaración.
