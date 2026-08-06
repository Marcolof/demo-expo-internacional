# Arquitectura

Decisiones tomadas al construir la maqueta y **por qué**. Si algo de acá se cambia,
conviene entender primero qué problema resolvía.

---

## 1. Organización por dominio, no por tipo de archivo

Una carpeta `components/` global con 60 componentes mezclados no dice nada sobre el
producto. Acá cada dominio es una carpeta cerrada:

```txt
modules/shipments/
  pages/ components/ forms/ modals/ rules/ scenarios/ mocks/ types/ index.ts
```

**La prueba para decidir dónde va un archivo:** ¿el componente sabe qué es un envío? Va en
su módulo. ¿Sirve igual para cualquier producto? Va en `shared/ui`.

Cada módulo expone su superficie pública en `index.ts`. Lo que no está exportado ahí es
privado, aunque técnicamente se pueda importar.

### Dirección de las dependencias

```txt
app  →  modules  →  shared  →  core
demo →  modules
```

`core` no conoce `modules`. `shared` no conoce `modules`. Un módulo no importa de otro
módulo salvo por su `index.ts`. Esto se rompería fácil con un import de conveniencia: no
hacerlo.

> **Excepción documentada:** `demo/scenarioCatalog.ts` importa los cuatro módulos para
> juntar sus escenarios, y `app/providers.tsx` lo consume. Se puso en `demo/` y no en
> `core/` justamente para no invertir la dependencia — `core` seguiría sin conocer los
> módulos.

---

## 2. Permisos separados de los roles

El rol es una etiqueta con un preset. El acceso real se decide por **permisos**.

Con sólo 4 roles no se pueden demostrar los casos que aparecen en la práctica: un operador
que puede pagar pero no cancelar, un titular al que se le apagó un permiso puntual. La
barra de demo puede forzar cualquier permiso, y esas combinaciones se ven resaltadas para
que quede claro que están forzadas.

```ts
effectivePermissions(user) = ROLE_PERMISSIONS[user.role] + user.permissionOverrides
```

---

## 3. Las reglas devuelven el motivo, no un booleano

```ts
type ActionResult = { allowed: true } | { allowed: false; reason: string }
```

Un booleano alcanza para decidir si pintar un botón. **No alcanza** para una demo, donde la
pregunta que siempre aparece es *«¿y por qué no puedo?»*.

Con el motivo adentro del resultado, la UI puede mostrar la acción **deshabilitada con su
explicación** en lugar de esconderla. Esconder una acción hace que el usuario crea que la
función no existe; mostrarla bloqueada con el motivo le dice qué le falta.

De ahí sale una regla de UI: **una acción denegada se deshabilita, no se oculta.** La
excepción es la navegación, donde un ítem sin permiso puede molestar más de lo que ayuda —
por eso cada ítem declara `onMissingAccess: 'hide' | 'disable'`.

### Por qué las pantallas no tienen condiciones compuestas

Esto se repite y se desincroniza entre la grilla y el detalle:

```tsx
{user.role === 'ACCOUNT_OWNER' && shipment.status !== 'IMPOSED' && …}
```

En cambio `shipmentActions(user, shipment)` devuelve **la lista completa** de acciones con
su resultado. La grilla y el detalle recorren la misma lista: no pueden discrepar.

---

## 4. Escenarios como dato, no como código

Un escenario es un objeto con `id`, `label`, `description`, `data` y opcionalmente
`session` (usuario, rol, permisos, flags, estado de carga).

- El `id` es el valor de `?scenario=`, así el estado se comparte por link.
- Los define **cada módulo**; `core` sólo define el contrato.
- `resolveScenario` cae al escenario por defecto si el id no pertenece al módulo, así
  navegar entre secciones con el parámetro puesto nunca rompe.

**Precedencia:** barra de demo > escenario > valores por defecto. Se puede entrar por una
URL de escenario y después ajustar un permiso sin que el escenario lo revierta.

Agregar un escenario no requiere tocar `core`, ni la barra de demo, ni el router.

---

## 5. Tokens en tres capas

```txt
primitive  →  semantic  →  component
--correo-yellow  →  --surface-brand  →  --button-primary-bg
```

**Los componentes consumen `semantic` o `component`, nunca `primitive`.** Sin esa
disciplina, cambiar el amarillo de marca obliga a buscar y reemplazar en 60 archivos.

Ningún `.module.css` tiene un hex, un `font-size` en px ni un radio literal. Si falta un
token se agrega a `tokens.css`.

### Sobre la fuente

El CSS original declaraba una familia CSS **por peso** (`"Gilroy-Medium"` usado como
`font-family`) y **no traía ningún `@font-face`**: dependía de que Gilroy estuviera
instalada en la máquina del usuario. Acá se declara una sola familia `Gilroy` con pesos
numéricos 300–800 a partir de los `.ttf`, que es la forma tokenizable y la que funciona
en cualquier equipo.

---

## 6. Formularios controlados, sin librería

Un solo `useState` con todos los valores; los subcomponentes reciben `values`, `errors` y
`onChange`. Las validaciones son funciones puras que devuelven un mapa de errores.

No se trajo React Hook Form ni Zod: la maqueta no necesita su potencia y el requisito era
**sin dependencias innecesarias**. Los validadores compartidos viven en
`shared/lib/validators.ts` y los esquemas de cada dominio los componen.

`ShipmentForm` no tiene estado propio: sirve igual para «nuevo envío» y para «modificar
envío» sin cambiarle una línea.

---

## 7. El label flotante es CSS puro

El original resuelve el label flotante con `:not(:placeholder-shown)`, sin JavaScript. Se
mantuvo así: es menos código y no re-renderiza.

**Consecuencia a tener presente:** todo input necesita un `placeholder`, porque sin él el
label nunca subiría. `Input` lo completa con el label si no se pasa otro, y el placeholder
se pinta transparente para que la etiqueta no se lea dos veces.

`Select` es la excepción: un `<select>` siempre muestra una opción, así que su label está
siempre arriba (mismo criterio que el CSS original).

El label, el error y la pista viven en un único `Field`, compartido por `Input`, `Select` y
`Textarea` — sin ese componente, el comportamiento estaría copiado tres veces.

---

## 8. El chrome lo maneja `AppShell`

Los desplazamientos por el header fijo (60 px) y el riel lateral (61 px) se aplican en
`AppShell`, no en `PageContainer`. Así una pantalla puede cambiar su ancho
(`width="full"`) sin saber nada del chrome que la rodea.

La navegación es **dato** (`navigation.config.ts`), no JSX: el `Sidebar` sólo la recorre, y
cada ítem declara sus permisos y su feature flag. El riel de iconos y el cajón mobile
renderizan **el mismo árbol** — en el original eran dos bloques HTML duplicados con ids
repetidos.

---

## 9. Estado de carga simulado

`loadState` (`idle` / `loading` / `success` / `error`) vive en la sesión y se cambia desde
la barra de demo. Permite mostrar spinners y pantallas de error **sin backend y sin
timeouts falsos**, que es justamente lo que hay que poder demostrar.

---

## 10. Lo que deliberadamente NO se hizo

| Decisión | Motivo |
|---|---|
| No se trajo Bootstrap | Era la fuente del problema de calidad. Todo se rehizo con tokens. |
| No se replicaron las erratas del original | Están inventariadas en el análisis funcional, no propagadas al código. |
| No se inventaron APIs | Mocks locales y funciones simuladas, como pide el requerimiento. |
| No se implementó carga masiva | Fuera del alcance de esta etapa; la pestaña lo aclara. |
| No se resolvieron las definiciones pendientes | Cuando el requerimiento no define, la maqueta no decide. |
| No se agregó librería de formularios ni de estado | Sin dependencias innecesarias. |
| Sin tests automatizados | Es una maqueta de UX para demo, no código productivo. La verificación es visual y por escenarios. |
