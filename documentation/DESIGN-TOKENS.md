# Design tokens

Correspondencia entre el CSS del portal original y los tokens de
[`src/styles/tokens.css`](../src/styles/tokens.css).

**Fuentes:** `html reference/MiCorreo_files/estilos.css`, `estilos-inputs.css` y las clases
`*-correo-*` agregadas al build customizado de `bootstrap.css`.

---

## Cómo usarlos

Tres capas. **Los componentes consumen `semantic` o `component`, nunca `primitive`.**

```txt
primitive         semantic            component
--correo-yellow → --surface-brand   → --button-primary-bg
--grey-700      → --text-muted
--grey-050      → --surface-page
```

Ningún `.module.css` debe tener un hex, un `font-size` en px o un radio literal. Si falta
un token, se agrega acá — no se hardcodea.

---

## Colores de marca

El original los declaraba en `:root` de `estilos.css`:

| Original | Token primitive | Token semantic | Valor |
|---|---|---|---|
| `--color-correo-primary` | `--correo-yellow` | `--color-brand`, `--surface-brand` | `#ffce00` |
| `--color-correo-secondary` | `--correo-blue` | `--color-accent`, `--text-link` | `#152663` |
| `--color-correo-tertiary` | `--correo-grey-700` | `--text-muted` | `#49454f` |
| `--color-correo-white` | `--correo-off-white` | `--surface-page` | `#fafafa` |
| `--color-correo-black` | `--correo-near-black` | `--text-primary` | `#191919` |

## Superficies

| Clase original | Valor | Token |
|---|---|---|
| `.bg-correo-1` | `#FFCE00` | `--surface-brand` |
| `.bg-correo-2` | `#F4EFEF` | `--grey-150` |
| `.bg-correo-3` | `#ffff` | `--surface-raised` |
| `.bg-correo-4` | `#eeeeee` | `--surface-rail` |
| `.bg-correo-light-grey` | `#f2f2f2` | `--surface-sunken` |
| `.bg-correo-very-light-grey` | `#fafafa` | `--surface-page` |
| riel del sidebar (inline) | `#eeeeee` | `--surface-rail` |

**`--surface-raised` es la superficie "elevada" única** (tarjetas, panel de Resumen,
cards de servicio postal, y también el fondo de los campos de formulario). El token
`component` `--field-bg` (usado por `Input`/`Select` vía `Field.module.css`) ya no
apunta a `--white` por separado: apunta a `--surface-raised`, para no duplicar el mismo
blanco con dos nombres distintos.

```txt
--white → --surface-raised → --field-bg   (Input, Select — fondo del control)
                            → InternationalSummary.card, PostalServiceCard.card
```

## Texto

| Origen | Valor | Token |
|---|---|---|
| `.text-correo-1` | `#152663` | `--text-link` |
| `.text-muted` | `#49454f` | `--text-muted` |
| `small` | `#212529` | `--text-secondary` |
| `.styleFooter` | `#79747E` | `--text-subtle` |
| deshabilitado | `#8a8a8a` | `--text-disabled` |
| label flotante | `#49454F` | `--field-label-color` |
| label enfocado | `#2196F3` | `--field-label-color-active` |

## Íconos

| Origen | Valor | Token |
|---|---|---|
| X de cerrar (`Modal`), y demás íconos utilitarios en su estado habilitado | `#49454f` (= `--text-muted`) | `--icon-enabled` |

No existía un token de color para íconos hasta ahora: cada SVG traía su propio color fijo
(por ejemplo, `close.svg` tenía `fill="black"` sin pasar por ningún token). `--icon-enabled`
es el color por defecto de un ícono interactivo (cerrar, eliminar, chevrons) — **no** de los
íconos de marca, que siguen con su propio color semántico:

| Ícono | Token de color | No usa `--icon-enabled` porque… |
|---|---|---|
| `boxes.svg`, `file-text.svg` (artículo/documento) | `--correo-yellow` | son íconos de marca, no utilitarios |
| `circle-plus.svg`, `circle-minus.svg` (líneas de dirección) | `--correo-blue` (hardcodeado en el asset) | pendiente de pasar a token — ver nota abajo |

Para pintar un ícono con `--icon-enabled` el SVG tiene que traerse **inline** (no `<img>`)
con `fill="currentColor"`, y el color se define en CSS (`color: var(--icon-enabled)`) sobre
el elemento `<svg>` o un ancestro — igual que se hizo con los íconos de marca. Un `<img
src="...svg">` no puede tomar un token de color: el navegador lo trata como una imagen
opaca, no como markup que herede `currentColor`.

## Estado

| Origen | Valor | Token |
|---|---|---|
| `.error-msg` fondo / `--bs-alert-bg` | `#FFD0D0` | `--feedback-danger-bg` |
| `.error-msg` texto | `#d32f2f` | `--feedback-danger-text` |
| `.error-msg` borde | `#f5c2c2` | `--feedback-danger-border` |
| `.help-block` | `#ed143d` | `--feedback-danger-strong` |
| borde de input enfocado | `#2196F3` | `--border-focus` |

---

## Tipografía

### Familia

El original usaba **una familia CSS por peso** y no traía `@font-face`. Acá se normaliza a
una sola familia con pesos numéricos:

| Familia original | Peso | Archivo |
|---|---|---|
| `Gilroy-Light` | `--font-weight-light` (300) | `Gilroy-Light.ttf` |
| `Gilroy-Regular` | `--font-weight-regular` (400) | `Gilroy-Regular.ttf` |
| `Gilroy-Medium` | `--font-weight-medium` (500) | `Gilroy-Medium.ttf` |
| `Gilroy-SemiBold` / `Gilroy-Semibold` | `--font-weight-semibold` (600) | `Gilroy-SemiBold.ttf` |
| `Gilroy-Bold` | `--font-weight-bold` (700) | `Gilroy-Bold.ttf` |
| — | `--font-weight-heavy` (800) | `Gilroy-Heavy.ttf` |

> El original escribía el nombre de tres formas distintas (`Gilroy-SemiBold`,
> `Gilroy-Semibold`, `Gilroy-semibold`). Con pesos numéricos el problema desaparece.

### Tamaños

| Origen | Valor | Token |
|---|---|---|
| label flotado | 11 px | `--font-size-3xs` |
| `.fs-correo-7` | 0.71 rem | `--font-size-2xs` |
| `.fs-correo-ne-gm`, `.styleFooter`, `.editable` | 12 px | `--font-size-xs` |
| inputs, `.dropdown-item`, valores del resumen | 14 px | `--font-size-sm` |
| `.fs-correo-ne` (labels de nuevo envío) | 0.85 rem | `--font-size-ne` |
| saludo del header | 15 px | `--font-size-md` |
| botones, cuerpo | 16 px | `--font-size-base` |
| título de modal genérico | 22 px | `--font-size-xl` |

---

## Medidas del chrome

| Origen | Valor | Token |
|---|---|---|
| `.alturaNavbar` | `min-height: 60px` | `--header-height` |
| `.ancho-item-menu` | `61px` | `--sidebar-rail-width` |
| `.offcanvas` | `max-width: 340px` | `--sidebar-drawer-width` |
| `.footer2` | `52px` / `80px` (<600px) | `--footer-height` / `--footer-height-mobile` |
| `.circulo` | `40px` | `--avatar-size` |
| `.menu-icon` | `24px` | `--menu-icon-size` |

## Botones

`.btn-correo-primary` / `-secondary` / `-tertiary` / `-link-primary` → variantes
`primary` / `secondary` / `tertiary` / `link` de `shared/ui/Button`.

| Origen | Valor | Token |
|---|---|---|
| alto (con los paddings del original) | 44 px | `--button-height` |
| padding horizontal | 1.2 rem | `--button-padding-x` |
| `--bs-border-radius-pill` | 25 px | `--button-radius` |
| `--bs-btn-border-width` | 2 px | `--button-border-width` |
| `.botonDimensiones` | 124 px | `--button-width-step` |
| `#verResumen` | 175 px | `--button-width-summary` |
| hover primario | `rgba(255,206,0,.6)` | `--button-primary-bg-hover` |
| deshabilitado | `#d9d9d9` / `#8a8a8a` | `--button-disabled-bg` / `-text` |

## Campos (`estilos-inputs.css`)

| Origen | Valor | Token |
|---|---|---|
| alto del control | 38 px | `--field-height` |
| padding | 10 px | `--field-padding` |
| borde | `1px solid #ccc` | `--field-border` |
| radio | 5 px | `--field-radius` |
| textarea | 88 px | `--field-textarea-height` |
| label en reposo | `top:50%`, 14 px | `--field-label-font-size` |
| label flotado | `top:10px`, 11 px, `translateY(-110%)` | `--field-label-font-size-floated` |
| fondo del notch | `white` | `--field-label-backdrop` |
| notch sobre la página gris | `linear-gradient(#fafafa 55%, white 45%)` | `--field-label-backdrop-on-page` |

> El degradado existe porque la página es `#fafafa` y el campo es blanco: la mitad de
> arriba del label tiene que matchear la página y la de abajo el campo.

## Stepper (`.tabenvios`)

| Origen | Valor | Token |
|---|---|---|
| punto | 20 px | `--stepper-dot-size` |
| punto activo | 30 px, borde amarillo | `--stepper-dot-size-active` |
| conector | 4 px | `--stepper-connector-height` |
| pendiente | `#8a8a8a` | `--stepper-color-pending` |
| visitado | azul de marca | `--stepper-color-visited` |
| activo | amarillo de marca | `--stepper-color-active` |

> El original posicionaba el conector con `::after` y porcentajes calculados a mano por
> paso (`right: calc(59% - 25px)`), lo que **sólo funcionaba con exactamente tres pasos**.
> El componente usa un flex item entre puntos: sirve para cualquier cantidad y se ve igual.

## Tabla (`.mcr-table`)

| Origen | Valor | Token |
|---|---|---|
| `border-spacing` | `0 5px` | `--table-row-gap` |
| radio de fila | 10 px | `--table-radius` |
| sombra de fila | `0 2px 2px 1px rgba(195,195,195,.25)` | `--table-row-shadow` |
| hover | `#eeeeee` | `--table-row-hover-bg` |

## Radios, sombras y capas

| Token | Valor | Uso |
|---|---|---|
| `--radius-xs` | 5 px | inputs, tab superior |
| `--radius-md` | 10 px | filas de tabla, tarjetas |
| `--radius-lg` | 15 px | mapa de sucursal |
| `--radius-xl` | 25 px | modales, botones pill |
| `--radius-2xl` | 30 px | `.box-acceso` |
| `--shadow-dropdown` | `0 .5rem 1rem rgba(0,0,0,.15)` | desplegables y modales |
| `--shadow-inset-active` | `inset 0 3px 5px rgba(0,0,0,.125)` | botón presionado |

Capas, de abajo hacia arriba: `--z-sidebar-rail` (10) · `--z-header` (20) ·
`--z-offcanvas` (30) · `--z-modal-backdrop` (40) · `--z-modal` (50) · `--z-toast` (60) ·
`--z-demo-toolbar` (70).

---

## Tokens agregados que el original no tenía

No existían y hacían falta para que el sistema cierre:

- **Espaciado.** El original usaba las utilidades de Bootstrap (`m-3`, `ps-1`, `py-3`).
  Se reemplazaron por una escala de 4 px (`--space-1` … `--space-12`) equivalente a los
  `rem` de Bootstrap.
- **Capas.** Los `z-index` estaban sueltos e inline (`z-index: 3`, `100`).
- **Éxito / advertencia / info.** Sólo estaba definido el error.
- **`--font-weight-*`.** No existían: el peso venía implícito en el nombre de la familia.
- **`--transition-fast` / `--transition-base`.** Estaban repetidos como literales.

## Clases del original que NO se portaron

Están en el HTML pero **no definidas en ningún CSS** — no aportan estilo:

`divisor` · `resumen` · `link-baja` (sólo definida en un `<style>` inline del footer) ·
`carga` · `centrarElementos`

Tampoco se portaron los estilos de Leaflet (mapas), del chatbot de terceros ni de
SweetAlert2: los mapas y el chat no forman parte del alcance de la maqueta, y los diálogos
se resuelven con `Modal` y `Toast` propios.
