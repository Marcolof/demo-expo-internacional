# Handoff — Sesión Paquetería Internacional (2026-08-05)

> Este documento es un traspaso entre cuentas de Claude Code sobre el mismo
> proyecto local. Resume qué se hizo, dónde, por qué, y qué queda pendiente,
> para que la próxima sesión pueda retomar sin releer todo el historial.
> La fuente de verdad del diseño sigue siendo **Figma** ("Mi Correo 2.0",
> fileKey `wN6vAlF1TgGc2AJdJJvsAU`); este doc es sólo bitácora de trabajo.
>
> **Actualizado** al cierre de la sesión del 2026-08-05 (segunda mitad del
> día): se agregó el paso "Paquete" del wizard internacional, validaciones de
> avance, un componente `NumberInput` y varios ajustes visuales. La sección
> "Qué se construyó hoy" quedó dividida en **Bloque 1** (mañana: Declaración,
> modal de artículo, stepper base) y **Bloque 2** (tarde: paso Paquete,
> validaciones, componentes nuevos). Si volvés a este doc, empezá por el
> Bloque 2 y "Pendiente / próximos pasos", que están al día.

## Contexto del proyecto

Maqueta visual navegable de MiCorreo (Correo Argentino), en React + TypeScript
+ Vite, corriendo en `http://localhost:4200`. Sin backend real. El objetivo de
esta sesión fue construir la **pantalla de envío internacional**, divergiendo
del HTML de referencia estático (`/envioCla`) hacia componentes propios del
proyecto, con Figma como fuente de verdad visual.

Server de dev: `npm run dev` en la raíz del proyecto (puerto 4200). Si no
levanta al abrir la carpeta, correrlo manualmente. Antes de cerrar cualquier
tarea, correr `npm run build` (hace `tsc -b && vite build`; el proyecto no
tiene un script `typecheck` separado) — así se detectan errores de TypeScript
estricto sin depender del navegador.

---

## Bloque 2 (tarde) — Paso Paquete, validaciones y componentes nuevos

### 1. Componente `NumberInput`
[`src/shared/ui/NumberInput/`](../src/shared/ui/NumberInput/) — nuevo
primitivo de formulario: input numérico con chevrones ▲/▼ para sumar/restar
(además de poder escribir el valor directo). Envuelve `Field` igual que
`Input`/`Select` (mismo label flotante, mismos tokens). Respeta `min`/`max`/
`step` y deshabilita el chevrón correspondiente en los límites.

- Integrado en el campo **Cantidad** de
  [`AddArticleModal`](../src/modules/shipments/components/AddArticleModal.tsx)
  (antes era un `Input type="number"` sin chevrones).
- Exportado desde [`src/shared/ui/index.ts`](../src/shared/ui/index.ts) junto
  con el resto de los primitivos (ese archivo barrel no existía antes de hoy).

### 2. Cuarta categoría de envío: "Ayuda familiar"
En [`InternationalShipmentPage.tsx`](../src/modules/shipments/pages/InternationalShipmentPage.tsx),
`NON_COMMERCIAL_CATEGORIES` pasó de 3 a 4 opciones: Regalo, Documento, Muestra
comercial, **Ayuda familiar** (`value: 'AYUDA_FAMILIAR'`). Documentado en
[`ANALISIS-FUNCIONAL.md`](./ANALISIS-FUNCIONAL.md) §4 y
[`ARQUITECTURA.md`](./ARQUITECTURA.md) §10 — sólo cambio de front, sin tocar
reglas de negocio ni el requerimiento original.

### 3. Validación para avanzar de Declaración → Paquete
Antes, "Siguiente" no validaba nada (era un `noop`). Ahora `handleNext` en
`InternationalShipmentPage.tsx` exige, en este orden:
1. Checkbox de declaración jurada tildado → si no, banner:
   *"Tenés que confirmar la declaración jurada para continuar."*
2. País ≠ `-1`, categoría ≠ `-1` y al menos un artículo agregado → si no,
   banner: *"Completá el país, la categoría y agregá al menos un artículo
   para continuar."*

El banner reutiliza el componente `Alert` (`tone="danger"`), el mismo que ya
usaba `AddArticleModal` para campos incompletos — no se creó un componente
nuevo. El estado es `declarationError: string | null` (antes era un booleano
que sólo cubría el caso del checkbox).

**Espaciado del banner**: no se resolvió con un wrapper puntual alrededor del
checkbox, sino con una regla general en
[`InternationalShipmentPage.module.css`](../src/modules/shipments/pages/InternationalShipmentPage.module.css):
`.form > .section:last-child { margin-bottom: var(--space-6) }`. Así el
espacio contra la barra Cancelar/Atrás/Siguiente (que no tiene padding
vertical propio) es constante sin importar qué paso esté visible ni si el
banner de error está mostrándose o no.

### 4. Paso 2 del wizard: "Paquete"
Mismo archivo `InternationalShipmentPage.tsx`, ahora maneja
`step: 'DECLARACION' | 'PAQUETE'` con `useState`. La sección Declaración y la
sección Paquete son mutuamente excluyentes (`step === 'DECLARACION' && …` /
`step === 'PAQUETE' && …`), no rutas separadas — todo vive en la misma page.

Campos del paso Paquete (reutilizando `Input`/`Select` existentes y, para el
layout, las clases `.measuresRow`/`.saveMeasure` que ya existían en
[`ShipmentForm.module.css`](../src/modules/shipments/forms/ShipmentForm.module.css)
para el flujo nacional — se importan desde ahí, no se duplicó CSS):

- **Medidas frecuentes** (`Select`, opciones de
  [`FREQUENT_MEASURE_OPTIONS`](../src/modules/shipments/mocks/shipments.mocks.ts)):
  al elegir una, autocompleta Largo/Ancho/Alto con los valores de
  `FREQUENT_MEASURES` (mismo mock que usa el flujo nacional).
- **Largo / Ancho / Alto** (`Input` en fila de 3 columnas).
- **"Guardar medida"**: link debajo de la fila de medidas, alineado a la
  derecha (`formLayout.saveMeasure` + clase local `.saveMeasureRight` con
  `align-self: flex-end`). **Importante**: al principio se puso al lado del
  título "Medidas del paquete (cm)" (mismo lugar que en el flujo nacional) y
  el usuario pidió corregirlo — en la referencia de Figma del flujo
  internacional va debajo de los inputs, no al lado del título. No repetir
  ese error si se vuelve a tocar esta sección. El botón es un `noop` por
  ahora (no hay persistencia de medidas frecuentes nuevas).
- **Peso total de artículos/documentos declarados**: fila informativa
  (de sólo lectura) que muestra `formatWeightKg(totalWeightKg)`, el mismo
  total ya calculado a partir de los artículos declarados en el paso 1. No es
  un input.
- **Peso del paquete (kg)** (`Input`): peso propio del paquete, distinto del
  peso declarado del contenido (puede diferir por el embalaje).

Nav inferior en este paso: **Cancelar** (siempre, sale al inicio) + **Atrás**
(nuevo, vuelve a Declaración sin perder ningún dato — todo el estado sigue
vivo en el mismo componente) + **Siguiente** (por ahora inerte, `() =>
undefined`, porque el paso Origen todavía no existe).

El botón **Atrás** usa `variant="secondary" size="step"` — ese tamaño
(`--button-width-step`, 124px) ya estaba pensado para esto: el comentario
original en `Button.module.css` decía *"Ancho fijo de los botones Atrás /
Siguiente del wizard"* aunque hasta hoy nunca se había usado un botón Atrás.
Se agregó `gap: var(--space-3)` a `.navActionsEnd` en
[`NewShipmentPage.module.css`](../src/modules/shipments/pages/NewShipmentPage.module.css)
para separar Atrás de Siguiente (no afecta a las pantallas que sólo ponen un
botón ahí).

### 5. Stepper internacional: paso completado en azul + anillo del paso activo
[`InternationalStepper.tsx`](../src/modules/shipments/components/InternationalStepper.tsx)
antes sólo distinguía "paso actual" (amarillo) vs "el resto" (gris). Ahora:

- Calcula `currentIndex = INTERNATIONAL_STEPS.indexOf(current)` y marca como
  **visitado** (`isVisited`) todo paso con índice menor al actual.
- **Paso visitado**: disco azul lleno, `var(--stepper-color-visited)` (=
  `--correo-blue`, el mismo azul de marca usado en el resto del sitio — token
  que ya existía en `tokens.css` sin uso hasta ahora). El conector que sale de
  un paso visitado también se pinta de ese azul (`.connectorVisited`).
- **Paso actual**: ya no es un disco amarillo simple. Se corrigió para que
  coincida con la referencia real — `.tabenvios li.active i` en
  `html reference/MiCorreo_files/estilos.css` (el stepper de 3 pasos del
  flujo nacional): una caja de 30×30 con **borde amarillo** (no relleno) y,
  centrado adentro, un disco amarillo lleno de 24px (mismo diámetro que los
  puntos pendientes/visitados). Ese mismo patrón ya estaba resuelto como
  componente reutilizable en
  [`shared/ui/Stepper/Stepper.module.css`](../src/shared/ui/Stepper/Stepper.module.css)
  (clase `.dotActive`) para el stepper nacional de 3 pasos — el internacional
  tenía su propia versión simplificada (sin el anillo) que había que alinear.
  - **Bug de centrado y su fix**: centrar el disco interior con
    `top:50%; left:50%; transform:translate(-50%,-50%)` se ve descentrado a
    tamaño real, porque ese porcentaje se resuelve contra el *padding-box*
    del contenedor (excluye el borde), y con el borde renderizado a subpíxel
    por el zoom del navegador el disco queda corrido hacia una esquina. Se
    reemplazó por `inset` en píxeles fijos (derivados con `calc()` de los
    mismos tokens), que fuerza los 4 lados a la misma distancia exacta sin
    depender de ningún cálculo relativo al borde. Si se vuelve a tocar este
    componente, **no volver a centrar con `top/left: 50%` + `transform`** en
    un elemento con `border` — usar `inset`.
  - Tokens usados (ya existían en `tokens.css`, no se crearon nuevos):
    `--stepper-dot-size-active` (30px), `--stepper-intl-dot-size` (24px),
    `--stepper-color-active`, `--stepper-dot-bg`.
  - `.step` pasó a `display:flex; align-items:center; justify-content:center`
    y `.dot` ganó `flex-shrink:0` — sin esto, el disco activo (30px) se
    achicaba al ancho fijo de `.step` (24px) por defecto de flexbox.

**El panel de Resumen (`InternationalSummary`) no se tocó** — sólo cambió qué
`currentStep` recibe (`'Declaración'` o `'Paquete'` según el estado `step` de
la página), que es lo que hace que el stepper adentro pinte bien. Las filas
del acordeón siguen siendo estáticas ("-"); eso queda pendiente.

---

## Bloque 1 (mañana) — Declaración, modal de artículo, stepper base

### 1. Ruteo y switch Nacional/Internacional
- Ruta nueva `/internacional` en [`src/app/router.tsx`](../src/app/router.tsx).
- [`ScopeSwitch`](../src/modules/shipments/components/ScopeSwitch.tsx): switch
  Nacional/Internacional en el header, ahora **controlado** (`value`/`onChange`)
  y atado a la ruta — navega entre `/` y `/internacional`.

### 2. Stepper internacional (versión inicial)
[`InternationalStepper`](../src/modules/shipments/components/InternationalStepper.tsx) —
4 pasos con label (Declaración/Paquete/Origen/Destino). Ver Bloque 2 §5 por
los cambios de hoy (paso visitado en azul, anillo del paso activo).

### 3. Panel de Resumen internacional
[`InternationalSummary`](../src/modules/shipments/components/InternationalSummary.tsx) —
stepper + secciones colapsables (acordeón) + botón Pagar (deshabilitado,
sin flujo de pago todavía).

### 4. Pantalla Declaración (paso 1 del flujo internacional)
[`InternationalShipmentPage`](../src/modules/shipments/pages/InternationalShipmentPage.tsx)
(Figma node `7323:94738`). Incluye:
- Selector de país de destino (`Select`).
- Switch "Envío con fines comerciales" (cambia las opciones de categoría).
- Selector de categoría de envío (4 opciones no comerciales desde hoy, ver
  Bloque 2 §2).
- Botón "Agregar artículo": **deshabilitado hasta completar país + categoría**
  (criterio de aceptación documentado en
  [`documentation/requeriminto paqueteria internacional.md`](./requeriminto%20paqueteria%20internacional.md),
  sección §5.6).
- Lista de artículos agregados (acordeón) o `EmptyState` si no hay ninguno.
- Totales calculados en vivo (cantidad, valor USD, peso kg).
- Checkbox de declaración jurada (desde hoy, con validación real al avanzar —
  ver Bloque 2 §3).

### 5. Modal "Agregar artículo"
[`AddArticleModal`](../src/modules/shipments/components/AddArticleModal.tsx)
(Figma node `10116:13975`). Campos: descripción, código armonizado (con
disclosure "¿Dónde encuentro este código?"), cantidad (con chevrones desde
hoy, ver Bloque 2 §1), precio unitario USD, peso unitario kg. Todos
obligatorios.

- **Tamaño de modal nuevo**: `size="xl"` en el componente compartido
  [`Modal`](../src/shared/ui/Modal/Modal.tsx) — 600px de ancho, 750px de alto
  máximo, contenido interno con scroll (`overflow-y:auto`). Tokens:
  `--modal-width-xl`, `--modal-max-height-xl`.
- **Validación**: si falta algún campo o el formato es inválido al tocar
  "Agregar", el modal NO cierra. Se muestra un **banner** (`Alert
  tone="danger"`) arriba de los botones Cancelar/Agregar, y los campos
  inválidos quedan con el marco en rojo.
- **Importante**: por decisión explícita, los campos **NO llevan texto de
  error individual** — sólo el banner inferior explica el problema. Para esto
  se agregó un prop `invalid?: boolean` a los componentes compartidos `Input`
  y `Select` ([`Input.tsx`](../src/shared/ui/Input/Input.tsx),
  [`Select.tsx`](../src/shared/ui/Select/Select.tsx)): pinta el marco rojo
  sin pasarle texto a `Field` (que es lo único que dispara el mensaje de
  apoyo). Se usa `invalid={...}` en vez de `error={...}` en este modal.

### 6. Artículo agregado (acordeón)
[`ArticleAccordionItem`](../src/modules/shipments/components/ArticleAccordionItem.tsx)
(Figma node `7944:15068`). Header con ícono + descripción + cantidad +
chevron; expandido muestra detalle (código, valores, pesos) y acciones
Eliminar / Editar (Editar oculto: no hay flujo de edición implementado
todavía, `onEdit` es opcional y no se pasa desde la página).

- Ícono: [`boxes.svg`](../src/assets/icons/boxes.svg) traído **inline** (no
  `<img>`) para poder pintarlo con `currentColor` desde CSS
  (`color: var(--correo-yellow)`), en vez del hex fijo que traía el asset.

### 7. Tipos y helpers
- [`src/modules/shipments/types/article.types.ts`](../src/modules/shipments/types/article.types.ts):
  `DeclaredArticle`, `DeclaredArticleInput`, `articleTotalPriceUsd`,
  `articleTotalWeightKg`.
- [`src/shared/lib/formatCurrency.ts`](../src/shared/lib/formatCurrency.ts):
  se agregó `formatUsd(amount)` → `"USD 1.250,00"`.

---

## Bugs encontrados y corregidos (importante para no reintroducirlos)

1. **Switch "fines comerciales" ocupaba todo el ancho con hueco a la
   izquierda**: `.texts` en `Switch.module.css` no tenía `flex: 1 1 auto`.
   Corregido — es un fix **global** al componente `Switch`.

2. **Stepper internacional: los puntos no se veían** (aparecían como barras).
   Causa: `.dot` es un `<span>` (inline) y el navegador ignora
   `width`/`height` en elementos inline → colapsaba a 0×0. Fix: agregar
   `display: block`.

3. **Label flotante de `Input`/`Select` se salía del recuadro cuando había
   hint o error**: en [`Field.tsx`](../src/shared/ui/Field/Field.tsx), el
   `<label>` era `position:absolute; top:50%` relativo a `.group`, pero
   `.group` incluía el hint/error debajo. Al aparecer ese texto, `.group`
   crecía y el label (centrado al 50%) se corría fuera del control. **Fix
   global** (afecta Input y Select por igual): se envolvió control+label en
   un nuevo `.controlWrap` con `position:relative`, dejando hint/error como
   hermanos fuera de ese wrapper.

4. **Tabs "Individual/Masivo" podían quedar más angostos que su propio
   texto** en columnas angostas (el 33.3% del breakpoint lg podía ser menor
   que "Individual"). Fix en `NewShipmentPage.module.css`: `.loadTabs` ahora
   tiene `min-width: max-content` — nunca se achica por debajo del contenido.

5. **Banner de error pegado a la barra Cancelar/Siguiente** (sin aire
   debajo). Ver Bloque 2 §3 — se resolvió con `.form > .section:last-child
   { margin-bottom: var(--space-6) }` en vez de un wrapper puntual, para que
   sirva igual en cualquier paso del wizard.

6. **Disco activo del stepper internacional descentrado**. Ver Bloque 2 §5 —
   causa y fix (`inset` en vez de `transform`/porcentaje) documentados ahí.
   No repetir el patrón `top/left:50% + transform` sobre un elemento con
   `border`.

7. **"Guardar medida" mal ubicado** en el paso Paquete (al lado del título en
   vez de debajo de los inputs de medidas). Ver Bloque 2 §4.

8. **Dev server se cae ocasionalmente**: si `http://localhost:4200` no
   responde, correr `npm run dev` desde la raíz del proyecto.

---

## Pendiente / próximos pasos

- **Paso Origen** y **Paso Destino** del wizard internacional (hoy sólo
  existen Declaración y Paquete). El botón "Siguiente" del paso Paquete es
  un `noop` a propósito, a la espera de que exista Origen.
- Los otros **4 estados/interacciones** de la pantalla internacional en
  Figma (nodes `5793-34677`, `5506-22378`, `5524-31998`, `7323-95095`) —
  mencionados por el usuario en la sesión de la mañana, no abordados todavía.
- Validaciones funcionales completas según
  [`documentation/requeriminto paqueteria internacional.md`](./requeriminto%20paqueteria%20internacional.md)
  (más allá de los criterios de "Agregar artículo" y "avanzar de paso" ya
  implementados y documentados).
- Flujo de **edición** de un artículo ya agregado (el botón "Editar" existe
  en el componente pero no está conectado — `onEdit` no se pasa desde
  `InternationalShipmentPage`).
- Botón "Guardar medida" del paso Paquete es un `noop` — no hay persistencia
  de medidas frecuentes nuevas todavía.
- Panel de Resumen (`InternationalSummary`): las filas del acordeón de
  Declaración y Paquete siguen mostrando "-" siempre; no reflejan los datos
  reales ingresados (país, categoría, cantidad de artículos, medidas, peso).
  Quedó fuera de alcance a pedido explícito del usuario ("el panel resumen
  por ahora no lo tocamos"), pero es candidato natural para la próxima
  sesión.
- Botón "Pagar" del panel de resumen sigue deshabilitado (sin flujo de pago
  para envíos internacionales).
- Pestaña "Masivo" del tipo de carga: sigue sin implementar (sólo
  "Individual" tiene contenido).

## Cómo retomar

1. Abrir la carpeta del proyecto, verificar que el dev server esté arriba
   (`npm run dev`, puerto 4200).
2. Navegar a `http://localhost:4200/internacional` para ver el estado actual.
   El paso Declaración requiere país + categoría + al menos un artículo +
   checkbox tildado para poder pasar a Paquete con "Siguiente".
3. Leer este documento completo (los dos bloques) + `documentation/requeriminto
   paqueteria internacional.md` (documento funcional, con criterios de
   aceptación) + `documentation/ANALISIS-FUNCIONAL.md` §4 (categorías) +
   `ARQUITECTURA.md` §10.
4. Correr `npm run build` antes de dar por cerrada cualquier tarea nueva
   (corre `tsc -b` en modo estricto + `vite build`; no hay script
   `typecheck` separado).
