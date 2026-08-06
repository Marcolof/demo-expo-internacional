# MiCorreo — Maqueta visual

Réplica visual del portal **MiCorreo** de Correo Argentino, basada en el HTML de
referencia (`html reference/`). Una sola pantalla: **Nuevo envío | Paquetería**
(`/envioCla`).

> Maqueta estática: el sidebar, el menú superior y los botones **no navegan ni
> ejecutan acciones**. No hay backend ni autenticación real.

---

## Cómo levantarla

```bash
npm install
```

```bash
npm run dev
```

Abre en `http://localhost:4200`. La primera pantalla es `/` — la réplica de
**Nuevo envío | Paquetería**, equivalente a `/envioCla` del portal real.

Otros comandos:

```bash
npm run typecheck
```

```bash
npm run build
```

---

## Stack

| Herramienta | Por qué |
|---|---|
| React 19 + TypeScript estricto | Sin `any`; props, mocks y estados tipados. |
| Vite | Arranque y HMR rápidos. |
| React Router | Rutas con los mismos slugs en español que el portal real. |
| CSS Modules + design tokens | Estilos con alcance local; ningún valor visual hardcodeado. |

Sin Bootstrap, sin jQuery, sin librerías de UI. El HTML de referencia usaba las cuatro
cosas; acá todo eso se reemplazó por tokens y componentes propios.

---

## Estructura

```txt
src/
  app/          Raíz, router, providers y chrome de la app
  core/         Sesión, roles, permisos, feature flags, navegación
  modules/      Un dominio funcional por carpeta
  shared/       UI reutilizable, layout, hooks y utilidades
  demo/         Herramientas de demostración (no forman parte del producto)
  styles/       tokens.css y globals.css
  assets/       Fuentes Gilroy, iconos e imágenes
```

### Regla de ubicación de archivos

| Carpeta | Qué va acá |
|---|---|
| `shared/ui` | Componentes genéricos **sin conocimiento del negocio**. |
| `shared/layout` | Layout general: header, sidebar, contenedores, pie. |
| `modules/[dominio]/pages` | Pantallas asociadas a rutas. |
| `modules/[dominio]/components` | Componentes específicos del dominio. |
| `modules/[dominio]/forms` | Formularios, validaciones y valores iniciales. |
| `modules/[dominio]/modals` | Modales del caso de uso. |
| `modules/[dominio]/rules` | Reglas de negocio y decisiones de acceso. |
| `modules/[dominio]/scenarios` | Escenarios navegables para demo. |
| `modules/[dominio]/mocks` | Datos simulados. |
| `core` | Sesión, roles, permisos, flags, navegación, configuración transversal. |
| `demo` | Sólo para navegar y probar escenarios. |

**La prueba para decidir:** si el componente sabe qué es un envío, va en su módulo. Si
sirve igual para cualquier producto, va en `shared/ui`.

### Módulos actuales

- `account` — Perfil, Domicilios, Usuarios
- `shipments` — Alta de envío (la réplica), listado, detalle
- `balance` — Saldo, recarga simulada, comprobantes
- `digital-communications` — Con acceso y sin acceso

---

## Permisos: roles **y** permisos independientes

El acceso **no** se modela sólo con roles. Cada rol trae un preset de permisos, pero la
barra de demo puede encender o apagar permisos sueltos para armar casos que no
corresponden a ningún rol puro.

```ts
type Role = 'ACCOUNT_OWNER' | 'OPERATOR_WITH_PAYMENT' | 'OPERATOR_WITHOUT_PAYMENT' | 'READ_ONLY'
```

15 permisos en `core/auth/permissions.ts` (`SHIPMENT_PAY`, `ADDRESS_DELETE`, `USERS_MANAGE`…).

### Las pantallas no llevan condiciones compuestas

Esto **no** se hace:

```tsx
{user.role === 'ACCOUNT_OWNER' &&
 shipment.status !== 'IMPOSED' &&
 shipment.status !== 'DELIVERED' && <Button>Cancelar</Button>}
```

Esto sí:

```tsx
const cancel = canCancelShipment(user, shipment)

<Button disabled={!cancel.allowed} title={cancel.allowed ? undefined : cancel.reason}>
  Cancelar
</Button>
```

Las reglas viven en `modules/[dominio]/rules/*` y devuelven `ActionResult`:

```ts
type ActionResult = { allowed: true } | { allowed: false; reason: string }
```

Devolver el **motivo** y no sólo un booleano es deliberado: en una demo hay que poder
mostrar *por qué* algo está bloqueado. Una acción denegada se muestra deshabilitada con
el motivo, no se esconde.

Para envíos hay además `shipmentActions(user, shipment)`, que devuelve la lista completa
de acciones con su resultado. La grilla y el detalle recorren la misma lista, así nunca
se desincronizan.

---

## Escenarios

Un escenario es un estado navegable de la maqueta. Se elige por URL o desde la barra de
demo:

```txt
/mis-envios?scenario=pending-editable
/mis-envios?scenario=paid-preimposition
/mis-envios?scenario=imposed-readonly
/mis-envios?scenario=no-permission
/mis-envios?scenario=empty-shipments
/mi-cuenta/domicilios?scenario=favorite-address
/mi-cuenta/domicilios?scenario=cannot-delete-favorite-address
/mi-cuenta/domicilios?scenario=empty-state
/mi-saldo?scenario=operator-without-payment
/mis-comunicaciones-digitales?scenario=no-access
```

Cada escenario aporta **datos** y, opcionalmente, **ajustes de sesión** (usuario, rol,
permisos, flags, estado de carga). Si el id de la URL no pertenece al módulo que se está
viendo, se cae al escenario por defecto sin romper nada.

Precedencia: lo que se toca a mano en la barra de demo gana sobre el escenario, y el
escenario gana sobre los valores por defecto.

---

## Barra de demo

Fija abajo, se despliega con **Mostrar controles**. Permite cambiar en vivo:

- usuario activo y rol
- permisos sueltos (resaltados cuando están forzados)
- feature flags
- escenario
- estado de carga (`loading` / `error` / `success`) para mostrar spinners y errores
- **Estado actual**: volcado JSON de permisos y flags efectivos, para mostrar con qué
  configuración exacta se está viendo la pantalla

Se apaga con el feature flag `DEMO_TOOLBAR`.

---

## Cómo agregar…

### …un módulo

1. Creá `src/modules/mi-dominio/` con `types/`, `mocks/`, `rules/`, `components/`,
   `pages/`, `scenarios/` e `index.ts`.
2. Exportá desde `index.ts` sólo lo público: pantallas, escenarios, tipos y reglas.
3. Sumá las rutas a `core/navigation/navigation.config.ts` (`ROUTES` + `NAVIGATION`).
4. Registralas en `app/router.tsx`.
5. Agregá el registro de escenarios a `demo/scenarioCatalog.ts`.

### …un modal

1. Creá el archivo en `modules/[dominio]/modals/`.
2. Envolvé `Modal` (contenido libre) o `ConfirmDialog` (dos opciones).
3. Consultá la regla **dentro** del modal: si el estado cambió desde que se pintó la
   grilla, el bloqueo se muestra ahí con su motivo.
4. Props mínimas: `isOpen`, `onClose`, `onConfirm`.
5. Confirmá con un toast (`useToast`).

> Nota: cuando la acción recomendada es **cancelar** y no confirmar, usá
> `emphasis="cancel"` en `ConfirmDialog`. Hace falta, por ejemplo, en Representación
> ante Aduana, donde lo recomendado es *mantener* la representación.

### …un permiso

1. Sumalo al union `Permission` en `core/auth/permissions.ts`.
2. Agregá su texto a `PERMISSION_LABELS` (el `Record` completo obliga a no olvidarlo).
3. Asignalo en `ROLE_PERMISSIONS` para cada rol.
4. Usalo desde una regla o desde `can('MI_PERMISO')`.

Aparece solo en la barra de demo: no hay que tocarla.

### …un escenario

1. Agregalo al registro en `modules/[dominio]/scenarios/*.scenarios.ts`, con `id`
   (kebab-case, es el valor de `?scenario=`), `label`, `description` y `data`.
2. Si tiene que cambiar la sesión, agregá `session: { … }`.
3. Nada más: el catálogo y la barra de demo lo levantan automáticamente.

### …un feature flag

Sumalo al union `FeatureFlag`, a `FEATURE_FLAG_LABELS` y a `DEFAULT_FEATURE_FLAGS`.
Leelo con `useFeatureFlag('MI_FLAG')`, o declaralo en un ítem de navegación con
`requiredFlag`.

---

## Estilos

Tres capas en `styles/tokens.css`: **primitive** (valores crudos) → **semantic** (rol de
uso) → **component** (medidas de un componente).

**Los componentes consumen `semantic` o `component`, nunca `primitive`.**

Ningún archivo `.module.css` debe tener un hex, un `font-size` en px o un radio
literal. Si falta un token, se agrega a `tokens.css` — no se hardcodea.

La fuente es **Gilroy** (la del portal real), declarada en `globals.css` como una única
familia con pesos numéricos 300–800 a partir de los `.ttf` de `Font gilroy/`. El CSS
original declaraba una familia distinta por peso (`"Gilroy-Medium"` como *family*) y no
traía ningún `@font-face`: dependía de que la fuente estuviera instalada en la máquina.

Detalle en [`documentation/DESIGN-TOKENS.md`](documentation/DESIGN-TOKENS.md).

---

## Convenciones de código

- TypeScript estricto. Sin `any`. `noUncheckedIndexedAccess` activo: el acceso por
  índice devuelve `T | undefined` y hay que chequearlo.
- `import type { … }` para imports de tipos (`verbatimModuleSyntax`).
- `export function Componente(props: ComponenteProps)`. Sin `React.FC`.
- Props en interfaces `<Componente>Props`, campos `readonly`.
- Alias `@/` → `src/`.
- Un `index.ts` por módulo con la superficie pública.
- Componentes chicos; la lógica de reglas separada del render.
- Comentarios en español rioplatense, sólo donde hay una decisión que explicar.
- Textos de UI en español rioplatense con voseo.

---

## Documentación

| Archivo | Contenido |
|---|---|
| [`documentation/requeriminto paqueteria internacional.md`](documentation/requeriminto%20paqueteria%20internacional.md) | Requerimiento funcional de Paquetería Internacional (fuente del cliente). |
| [`documentation/ANALISIS-FUNCIONAL.md`](documentation/ANALISIS-FUNCIONAL.md) | Análisis de la pantalla de referencia y su relación con el requerimiento. |
| [`documentation/ARQUITECTURA.md`](documentation/ARQUITECTURA.md) | Decisiones de arquitectura y por qué. |
| [`documentation/DESIGN-TOKENS.md`](documentation/DESIGN-TOKENS.md) | Inventario de tokens y correspondencia con el CSS original. |

---

## Qué NO hace esta maqueta

- No pega contra ninguna API. No inventa endpoints.
- No valida contra ARCA ni contra sistemas postales.
- No procesa pagos.
- No implementa carga masiva (la pestaña «Masivo» lo aclara).
- No resuelve las definiciones pendientes del requerimiento (designación de
  representante, matriz de servicios por país, atributos/tributos, Zonos, facturación).
  Cuando algo no está definido, la maqueta **no lo inventa**.
