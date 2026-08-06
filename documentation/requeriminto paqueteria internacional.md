# MiCorreo — Paquetería Internacional
## Documento maestro de contexto funcional para ChatGPT Work

**Versión:** 1.0  
**Fecha de consolidación:** 4 de agosto de 2026  
**Producto:** MiCorreo / Correo Argentino  
**Alcance:** generación y gestión de envíos internacionales salientes desde MiCorreo.

---

## 1. Propósito

Este documento reúne el contexto funcional del proyecto **Paquetería Internacional en MiCorreo** para utilizarlo como fuente de referencia dentro de otro proyecto de ChatGPT Work.

Debe servir para:

- interpretar pantallas de Figma;
- revisar flujos, historias de usuario y criterios de aceptación;
- redactar textos UX;
- detectar contradicciones;
- preparar prompts para Codex;
- separar reglas confirmadas de definiciones pendientes.

No es una especificación técnica cerrada. Cuando una regla no esté confirmada, ChatGPT debe indicarlo y no inventar una solución.

---

## 2. Jerarquía de fuentes

Usar este orden de prioridad:

1. **Cambios PPT-Figma**: ajustes más recientes solicitados por el cliente.
2. **Instructivo Nuevo envío internacional v1.1 — 04-08-26**.
3. **Figma Internacional**: correcciones específicas anteriores.
4. **GC01 — Paquetería Internacional en MiCorreo V2**: requerimiento funcional base.

Cuando un documento más reciente modifica explícitamente una regla anterior, prevalece el cambio más reciente.

Cuando dos documentos se contradicen y no existe una definición posterior que cierre el tema, dejarlo como:

> Pendiente de confirmación funcional.

No incluir requisitos de resolución de pantalla dentro del análisis funcional.

---

## 3. Alcance del producto

MiCorreo incorporará la generación de **envíos internacionales salientes desde Argentina**.

Se contemplan:

- envíos individuales;
- carga masiva;
- envíos con fines comerciales;
- envíos sin fines comerciales;
- declaración jurada de contenido;
- validaciones por país de destino;
- medidas y peso del paquete;
- sucursal de imposición;
- destinatario y domicilio internacional;
- selección y cotización del servicio postal;
- representación ante Aduana;
- gestión de pendientes;
- checkout y pago;
- generación de rótulos y formularios.

En la primera etapa no se contempla pickup.

---

## 4. Flujo general vigente

El orden obligatorio es:

1. **Declaración**
2. **Paquete**
3. **Origen**
4. **Destino**
5. **Envíos pendientes**
6. **Checkout / cotización y pago**
7. **Envíos pagados y documentación**

| Paso | Objetivo |
|---|---|
| Declaración | País de destino, finalidad y contenido declarado. |
| Paquete | Medidas finales y peso total embalado. |
| Origen | Remitente y sucursal de imposición. |
| Destino | Destinatario, domicilio, servicio, cotización y representación si corresponde. |
| Pendientes | Gestión previa al pago. |
| Checkout | Recalcular, revisar y pagar. |
| Pagados | Seguimiento y documentación. |

---

# 5. Paso 1 — Declaración

## 5.1 Objetivo

En Declaración se define:

- país de destino;
- finalidad comercial o no comercial;
- categoría;
- artículos o documentos;
- cantidades;
- valores;
- pesos;
- Factura E cuando corresponda;
- compatibilidad del contenido con el país.

El país se pide anticipadamente para validar el contenido. En Destino se reutiliza como dato no editable.

---

## 5.2 País de destino

El sistema debe validar:

- si el país está habilitado;
- si el contenido es admisible;
- si existen restricciones conocidas.

Si el país no está habilitado, no se puede continuar.

Texto base:

> El país seleccionado no está habilitado para envíos internacionales.

Cuando ciertos artículos no sean aptos, deben identificarse específicamente.

Textos definidos:

> Los artículos seleccionados no son aptos para el país de destino.

> El contenido declarado no está permitido para envíos con destino a [país]. Para continuar, deberás eliminarlo o modificar la declaración del contenido.

La interfaz debe permitir editar o eliminar los artículos afectados.

---

## 5.3 Finalidad

Debe existir un switch o selector:

- **Con fines comerciales**
- **Sin fines comerciales**

La finalidad modifica requisitos de cuenta, ARCA, categoría, Factura E, representación y documentación.

---

## 5.4 Cuenta y ARCA para fines comerciales

### Consumidor final sin CUIT

**Título**

> Cuenta con CUIT requerida

**Descripción**

> Para realizar envíos con fines comerciales, deberás crear una cuenta con CUIT. La cuenta deberá estar asociada a un CUIT habilitado para envíos al exterior en ARCA.

### Cuenta con CUIT no habilitado

**Título**

> Inscripción en ARCA requerida

**Descripción**

> Para realizar envíos con fines comerciales, el CUIT asociado a la cuenta debe estar habilitado para envíos al exterior en ARCA. Para continuar con el envío, deberás realizar la gestión correspondiente.

No permitir continuar con el flujo comercial mientras no se cumplan las condiciones.

---

## 5.5 Categoría

### Comercial

Campo no editable:

> Envío de mercadería

### No comercial

Opciones:

- Regalo
- Documento
- Muestra comercial

“Documento” debe mostrarse en singular.

---

## 5.6 Artículos

### Criterio de aceptación — habilitación de "Agregar artículo"

- El botón "Agregar artículo" permanece deshabilitado hasta que se completen **país de destino** y **categoría de envío**.
- Al completarse ambos campos, el botón se habilita: cambia su estado visual (texto/ícono a color activo, cursor pointer) y aplica un hover leve.
- Al clickear el botón habilitado se abre el modal de alta de artículo (fuera de alcance de este paso; se implementa en el paso siguiente).

Cada artículo debe incluir:

- descripción;
- código armonizado;
- cantidad;
- valor unitario en USD;
- peso unitario en kg.

### Regla vigente del código armonizado

El cambio más reciente lo establece como **obligatorio tanto para fines comerciales como sin fines comerciales**.

Esto reemplaza la definición anterior que lo consideraba opcional en no comerciales.

### Cálculos

- Valor total del artículo = cantidad × valor unitario.
- Peso total del artículo = cantidad × peso unitario.
- Valor total declarado = suma de todos los artículos.
- Peso total declarado del contenido = suma de todos los artículos.

---

## 5.7 Artículos agregados

Cada artículo debe mostrarse en un desplegable o acordeón.

Al expandirlo deben verse:

- descripción;
- código armonizado;
- cantidad;
- valor unitario;
- valor total;
- peso unitario;
- peso total.

Debe permitir editar, eliminar y mostrar restricciones por destino.

---

## 5.8 Resumen

El panel Resumen acumula:

- cantidad de artículos o unidades;
- valor total declarado;
- peso total declarado del contenido.

Diferenciar siempre:

- **Peso total declarado del contenido**
- **Peso total del paquete**

No son el mismo dato.

---

## 5.9 Factura E

Aplica sólo a fines comerciales.

Reglas:

- obligatoria;
- corresponde al envío completo;
- no es una factura por artículo;
- debe validarse con ARCA;
- la validación debe resolverse antes de continuar.

---

## 5.10 Declaración jurada

La información cargada constituye una declaración jurada de contenido y valor.

Debe informarse que:

- los datos deben ser fidedignos;
- Correo no es responsable por una declaración o categorización incorrecta del usuario;
- la información se utilizará para procesos aduaneros y de exportación.

No está cerrado si esto se implementa como checkbox, leyenda o confirmación final.

---

# 6. Paso 2 — Paquete

## 6.1 Campos

- medida frecuente, si existe;
- largo;
- alto;
- ancho;
- peso total del paquete.

El servicio postal no se selecciona aquí.

---

## 6.2 Medidas

Se expresan en centímetros y corresponden al paquete embalado.

La documentación base indica que dos de los lados no pueden superar 90 cm × 90 cm.

Si no cumple:

- mostrar error;
- bloquear avance hasta corregir.

---

## 6.3 Peso total

Incluye:

> contenido + embalaje

Debe ser igual o mayor al peso total declarado del contenido.

Texto recomendado:

> Incluí el peso del contenido y del embalaje. Debe ser igual o mayor al peso total del contenido declarado.

Error:

> El peso total del paquete no puede ser menor al peso del contenido declarado.

---

## 6.4 Peso máximo

El alcance y los rangos actuales contemplan hasta 20 kg, sujeto al servicio, país y dimensiones.

Texto:

> El peso del paquete supera el máximo permitido para envíos internacionales. Ingresá un peso de hasta 20 kg para continuar.

Debe confirmarse si 20 kg es un máximo universal o configurable por servicio.

---

## 6.5 Peso volumétrico

Para EMS Paquetería/Mercadería se documentó:

> Largo × Ancho × Alto / 6000

Es un cálculo del sistema, no un input.

---

# 7. Paso 3 — Origen

## 7.1 Objetivo

Define:

- remitente;
- domicilio de origen cuando corresponda;
- sucursal de imposición.

En grillas y resúmenes, el origen operativo es la **sucursal de imposición**.

---

## 7.2 Regla vigente por peso

La definición más reciente aplica a envíos comerciales y no comerciales:

### Hasta 2 kg

Mostrar sucursales propias de Correo habilitadas.

### Más de 2 kg

Mostrar únicamente sucursales con asiento aduanero.

### Exclusión

No mostrar Puntos Correo.

Esta regla reemplaza la definición anterior que obligaba a los comerciales a utilizar siempre una sucursal con asiento aduanero.

---

## 7.3 Listado dinámico

El listado depende de:

- finalidad;
- país;
- contenido;
- peso.

Puede depender además de otras reglas operativas, pero no existe una matriz completa confirmada.

Texto para más de 2 kg:

> Tu envío supera los 2 kg. Solo verás disponibles sucursales con asiento aduanero.

Si no hay sucursales:

> No hay sucursales disponibles para las características de este envío. Revisá los datos ingresados para continuar.

---

# 8. Paso 4 — Destino

## 8.1 Objetivo

Incluye:

1. datos del destinatario;
2. domicilio;
3. servicio y cotización;
4. representación ante Aduana para comerciales.

El país se muestra precargado y no editable.

---

## 8.2 Orden de campos

1. Nombre y apellido
2. Razón social / Empresa
3. Correo electrónico
4. Código telefónico de país
5. Teléfono
6. País
7. Provincia / Estado
8. Ciudad
9. Código postal
10. Dirección
11. Identificación tributaria
12. Servicio postal
13. Representación, si corresponde

---

## 8.3 Destinatario

### Nombre y apellido

Obligatorio y separado de Empresa.

### Razón social / Empresa

Opcional.

### Correo electrónico

Obligatorio.

### Código telefónico de país

Obligatorio y separado del teléfono.

Ejemplos: +54, +1, +55.

### Teléfono

Obligatorio. No aplicar formatos exclusivos de Argentina.

---

## 8.4 Ubicación

### País

Obligatorio, seleccionado en Declaración y no editable en Destino.

### Provincia / Estado

Obligatorio según la definición actual.

### Ciudad

Obligatoria.

### Código postal

Obligatorio. Si el país no lo utiliza, GC01 documenta `00000`; confirmar vigencia.

---

## 8.5 Dirección

- Dirección 1 visible inicialmente.
- Máximo 50 caracteres por línea.
- Permitir agregar Dirección 2 y Dirección 3.
- Deshabilitar “Agregar otra línea” al llegar a tres.
- Permitir eliminar líneas adicionales.
- Las líneas adicionales continúan la misma dirección.

---

## 8.6 Identificación tributaria

Campo opcional en general.

Es la identificación fiscal del destinatario en el país de destino, por ejemplo CPF en Brasil.

Reglas:

- texto alfanumérico flexible;
- no validar como CUIT/CUIL argentino;
- formato y obligatoriedad pueden depender del país;
- la matriz por país no está definida.


# 9. Servicios postales y cotización

## 9.1 Ubicación

El servicio postal se selecciona al final de Destino.

No debe ubicarse en Paquete ni en Origen.

---

## 9.2 Servicios documentados

### EMS Paquetería

> Entrega estimada entre 2 y 8 días hábiles, según el destino.

### Encomienda Internacional

> Entrega estimada entre 7 y 20 días hábiles, según el destino.

### Pequeño Paquete

> Entrega estimada entre 7 y 20 días hábiles, según el destino.

### EMS Documentación

> Entrega estimada entre 2 y 7 días hábiles, según el destino.

Los servicios deben mostrarse ordenados de mayor a menor precio.

---

## 9.3 Disponibilidad

Debe calcularse según:

- país;
- peso real;
- medidas;
- peso volumétrico cuando corresponda;
- contenido;
- reglas del servicio;
- disponibilidad operativa.

Ejemplo confirmado:

- Pequeño Paquete no está disponible por encima de 2 kg.

Los servicios no viables pueden mostrarse deshabilitados con el motivo.

---

## 9.4 Estados Unidos y Unión Europea

Los documentos consolidados no confirman expresamente que **Encomienda Internacional** quede excluida para Estados Unidos o la Unión Europea.

Si esa regla fue comunicada por otra vía, debe agregarse como definición específica y validarse.

No inferirla a partir de las menciones sobre tributos o plataformas externas.

---

## 9.5 Cotización

La cotización postal depende de destino, peso y medidas.

Debe mantenerse separada de:

- tributos;
- impuestos de importación;
- cargos de terceros;
- gestiones externas.

Texto:

> La disponibilidad y el precio se calculan según el destino, el peso y las medidas del paquete.

Aclaración:

> Este importe no incluye tributos o gestiones externas que puedan corresponder según el país de destino.

---

# 10. Representación ante Aduana

## 10.1 Alcance

Aplica sólo a envíos con fines comerciales.

Se muestra al final de Destino.

---

## 10.2 Estado inicial

Debe venir activada por defecto.

Texto:

> Acepto que, en caso de ser necesario, Correo Argentino me represente ante Aduana para la gestión de este envío.

---

## 10.3 Modal al desactivar

### Título

> Representación ante Aduana desactivada

También existe la variante:

> ¿Querés desactivar la representación ante Aduana?

Debe elegirse una sola versión final.

### Descripción

> Si desactivás esta opción, no podremos representarte ante Aduana en caso de que el envío requiera revisión. En esa situación, serás citado/a para presentarte personalmente en la planta CPI Retiro, CABA, a fin de continuar con la gestión del paquete.

### Acciones

Secundaria:

> Desactivar representación

Principal:

> Mantener representación

La acción recomendada es mantenerla.

---

## 10.4 Trazabilidad

La decisión debe:

- registrarse;
- consultarse en etapas posteriores;
- reflejarse en la documentación;
- indicar aceptación o rechazo.

---

## 10.5 Designar representante

El instructivo v1.1 agrega una pantalla para ingresar CUIT/CUIL de un representante cuando se desactiva la representación de Correo.

Esto contradice el modal que afirma que el usuario deberá presentarse personalmente.

Hasta confirmación, no asumir:

- que la designación es obligatoria;
- que cualquier tercero puede representar;
- que reemplaza la presentación personal;
- que existe validación de CUIT/CUIL;
- que forma parte definitiva del MVP.

---

# 11. Envíos pendientes

## 11.1 Guardado

Al guardar, el envío aparece en:

> Mis envíos → Pendientes

---

## 11.2 Acciones

- Ver detalle
- Modificar
- Duplicar
- Cotizar
- Eliminar
- Avanzar a checkout

Modificar reabre el flujo.

---

## 11.3 Invalidación de cotización

Invalidar la cotización si cambian:

- país;
- finalidad;
- artículos;
- cantidades;
- valores;
- pesos;
- medidas;
- sucursal;
- servicio;
- cualquier dato que afecte restricciones o precio.

Al cotizar o pagar debe realizarse una nueva consulta.

---

## 11.4 Datos de la grilla

Contemplar:

- tipo de envío;
- número de orden;
- finalidad;
- fecha;
- origen;
- destino;
- servicio;
- peso;
- estado;
- acciones.

Normalización:

- Origen internacional = sucursal de imposición.
- Destino internacional = país + provincia/estado.

---

# 12. Checkout — Cotización y pago

## 12.1 Contenido

El checkout resume uno o más envíos.

Por envío debe mostrar:

- servicio postal;
- origen;
- destino;
- peso;
- medidas;
- precio.

Puede existir un detalle expandible.

---

## 12.2 “Atributos” o “tributos”

El cambio más reciente utiliza:

> atributos, si los hubiera

Documentos anteriores y el contexto utilizan **tributos**.

Debe confirmarse si se refiere a:

- atributos;
- tributos;
- ambos conceptos.

No corregirlo silenciosamente.

---

## 12.3 Recotización

Al entrar al checkout o presionar Cotizar se realiza una nueva consulta.

Texto:

> Los importes pueden actualizarse al momento de pagar.

Si el precio cambia, informar el nuevo valor.

---

## 12.4 Costos externos

Diferenciar:

- precio postal;
- tributos aduaneros;
- impuestos de destino;
- plataformas externas;
- otras gestiones.

No está confirmado:

- si se usará Zonos;
- si los tributos se informan o cobran;
- si el pago ocurre dentro o fuera de MiCorreo;
- en qué momento se calculan.

---

## 12.5 Pago

Debe permitir:

- revisar;
- elegir medio de pago;
- pagar;
- ver pantalla de éxito.

Facturación, cancelaciones y devoluciones de saldo requieren definición administrativa final.

---

# 13. Pagados y documentación

Después del pago, el envío aparece en Pagados.

Acciones:

- cancelar según reglas;
- ver detalle;
- seguimiento;
- generar documentación;
- imprimir individual o masivamente.

---

## 13.1 Documentos

Según el servicio:

- rótulo;
- CN23;
- CP71;
- chequera EMS;
- declaración de contenido;
- otros documentos operativos.

Los formularios UPU no deben modificarse en estructura ni campos.

Incluir cuando corresponda:

- remitente;
- destinatario;
- seguimiento;
- declaración;
- “Con fines comerciales”;
- aceptación o rechazo de representación.

---

## 13.2 Vigencia

La documentación y el envío pagado tienen una vigencia documentada de 30 días.

La devolución de saldo al caducar depende del flujo de facturación.

---

# 14. Carga masiva

## 14.1 Alcance

Un archivo puede contener:

- comerciales;
- no comerciales;
- varios artículos por envío.

Las filas con el mismo número de orden pertenecen al mismo envío.

---

## 14.2 Archivos de ayuda

1. Plantilla vacía.
2. Archivo de ejemplo.
3. Guía de campos, países, categorías y sucursales.

---

## 14.3 Campos principales

- Número de orden
- Finalidad
- Tipo de producto/servicio
- País destino
- Categoría
- Factura E
- Largo
- Ancho
- Alto
- Peso total
- Contenido
- Cantidad
- Peso unitario
- Valor unitario USD
- Código armonizado
- Nombre y apellido
- Empresa
- Dirección 1
- Dirección 2
- Dirección 3
- Código telefónico
- Teléfono
- Código postal
- Provincia/Estado
- Ciudad
- Correo electrónico
- Identificación tributaria
- Representación

La actualización que vuelve obligatorio el código armonizado en ambos flujos debe reflejarse en la plantilla, salvo definición contraria.

La representación sólo aplica a comerciales según la regla vigente.

---

# 15. Dependencias entre pasos

## 15.1 Cambio de país

Revalidar:

- artículos;
- restricciones;
- paquete;
- sucursales;
- servicios;
- cotización;
- procesos externos;
- código telefónico;
- identificación tributaria.

## 15.2 Cambio de artículos

Actualizar:

- unidades;
- valor total;
- peso total declarado;
- compatibilidad;
- peso mínimo del paquete;
- sucursales;
- servicios;
- cotización.

## 15.3 Cambio de peso o medidas

Actualizar:

- validaciones físicas;
- regla de sucursales por 2 kg;
- peso volumétrico;
- servicios;
- precio.

## 15.4 Cambio de sucursal

Puede afectar:

- operación;
- servicio;
- cotización;
- rótulo.

## 15.5 Cambio de servicio

Actualizar:

- precio;
- plazo;
- documentación;
- peso volumétrico aplicable;
- checkout.


# 16. Modelo conceptual mínimo

```text
InternationalShipment
├── id
├── status
├── purpose: COMMERCIAL | NON_COMMERCIAL
├── destinationCountry
├── category
├── invoiceE
├── articles[]
├── declarationTotals
│   ├── units
│   ├── declaredValueUsd
│   └── declaredContentWeightKg
├── package
│   ├── lengthCm
│   ├── widthCm
│   ├── heightCm
│   ├── actualWeightKg
│   └── volumetricWeightKg
├── origin
│   ├── sender
│   └── impositionBranch
├── recipient
│   ├── fullName
│   ├── company
│   ├── email
│   ├── phoneCountryCode
│   ├── phone
│   ├── taxId
│   └── address
├── postalService
├── quote
├── customsRepresentation
└── documents[]
```

Artículo:

```text
DeclaredArticle
├── description
├── harmonizedCode
├── quantity
├── unitValueUsd
├── totalValueUsd
├── unitWeightKg
├── totalWeightKg
└── destinationValidationStatus
```

Representación:

```text
CustomsRepresentation
├── enabled
├── decisionTimestamp
├── acceptedByUser
├── representativeTaxId
└── status
```

`representativeTaxId` sólo debe utilizarse si se confirma “Designar representante”.

---

# 17. Estados conceptuales

Estados posibles:

- Borrador
- Pendiente
- Pendiente de cotización
- Cotizado
- Pendiente de pago
- Pagado
- Cancelado
- Caducado
- En imposición
- Admitido
- Observado o intervenido
- En tránsito
- Entregado
- Error

Los nombres finales deben alinearse con MiCorreo y los sistemas postales.

---

# 18. Mensajes UX principales

## Contenido no permitido

> El contenido declarado no está permitido para envíos con destino a [país]. Para continuar, deberás eliminarlo o modificar la declaración del contenido.

## Artículos señalados

> Los artículos seleccionados no son aptos para el país de destino.

## Peso insuficiente

> El peso total del paquete no puede ser menor al peso del contenido declarado.

## Más de 2 kg

> Tu envío supera los 2 kg. Solo verás disponibles sucursales con asiento aduanero.

## Máximo de peso

> El peso del paquete supera el máximo permitido para envíos internacionales. Ingresá un peso de hasta 20 kg para continuar.

## Sin sucursales

> No hay sucursales disponibles para las características de este envío. Revisá los datos ingresados para continuar.

## Servicio no disponible

> No disponible para el país, peso o medidas ingresadas.

## Recotización

> Los importes pueden actualizarse al momento de pagar.

## Costos externos

> Este importe no incluye tributos o gestiones externas que puedan corresponder según el país de destino.

---

# 19. Pendientes y contradicciones

## 19.1 Designar representante

El instructivo agrega CUIT/CUIL de un representante al desactivar la representación de Correo, pero el modal indica presentación personal.

Definir:

- quién puede representar;
- si es obligatorio;
- si reemplaza la presencia del usuario;
- validaciones;
- alcance MVP.

## 19.2 Atributos o tributos

Confirmar el término correcto en checkout.

## 19.3 Servicios por país

No existe matriz final.

No está confirmada documentalmente la exclusión de Encomienda Internacional para EEUU o UE.

## 19.4 Código armonizado

La regla reciente lo hace obligatorio para ambos tipos.

Confirmar impacto en:

- masivo;
- integraciones;
- documentos;
- fuente de consulta;
- validación.

## 19.5 Restricciones de contenido

Definir:

- fuente o API;
- catálogo;
- validación por código, descripción o ambos;
- administración de reglas;
- respuesta técnica.

## 19.6 Peso máximo

Confirmar si 20 kg es:

- universal;
- por servicio;
- configurable por destino.

## 19.7 Plataformas externas y Zonos

GC01 contempla terceros para tributos.

No está confirmado:

- Zonos;
- tipo de integración;
- cálculo o cobro;
- redirección externa.

## 19.8 Declaración jurada

Confirmar si requiere:

- checkbox;
- leyenda;
- confirmación;
- trazabilidad especial.

## 19.9 Sucursales comerciales

El cambio reciente aplica la regla de 2 kg a ambos tipos y reemplaza “comercial siempre con asiento aduanero”.

Alinear backend, pantallas e instructivos.

## 19.10 Pago y facturación

Pendientes:

- facturación;
- cancelación;
- devolución de saldo;
- comprobantes;
- conciliación.

---

# 20. Reglas para ChatGPT dentro de Work

ChatGPT debe:

1. Responder en español rioplatense y con voseo.
2. Mantener términos oficiales.
3. Respetar Declaración → Paquete → Origen → Destino.
4. No volver al flujo anterior.
5. Ignorar la resolución de pantalla en el análisis funcional.
6. Diferenciar peso declarado del contenido y peso total del paquete.
7. Recordar que el país se elige en Declaración y se muestra no editable en Destino.
8. Ubicar servicio y cotización al final de Destino.
9. Mostrar representación sólo para comerciales.
10. Aplicar:
    - hasta 2 kg: sucursales propias;
    - más de 2 kg: asiento aduanero;
    - sin Puntos Correo.
11. Tratar el código armonizado como obligatorio en ambos flujos según el último cambio.
12. No inventar APIs ni reglas por país.
13. Señalar pendientes.
14. Priorizar cambios recientes sobre GC01 cuando sean explícitos.
15. No asumir que Zonos fue aprobado.
16. No asumir exclusión de Encomienda Internacional para EEUU/UE.
17. No asumir que Designar representante está cerrado.
18. Preservar textos del cliente si sólo se pide ortografía.
19. Al revisar Figma separar:
    - funcional;
    - contenido;
    - interacción;
    - negocio;
    - visual.
20. Cuando no haya respaldo suficiente, indicar:
    > Pendiente de confirmación funcional.

---

# 21. Guía de análisis de pantallas

Para cada pantalla, responder:

1. Paso del flujo.
2. Objetivo.
3. Campos visibles.
4. Campos faltantes.
5. Campos mal ubicados.
6. Reglas aplicables.
7. Validaciones.
8. Estados.
9. Mensajes.
10. Modales.
11. Dependencias.
12. Contradicciones.
13. Definiciones pendientes.

No rediseñar desde cero salvo pedido explícito.

---

# 22. Resumen ejecutivo

MiCorreo incorporará envíos internacionales comerciales y no comerciales.

Flujo:

> Declaración → Paquete → Origen → Destino → Pendientes → Checkout → Pagados

En Declaración se elige país, finalidad y contenido. En Paquete se cargan medidas y peso embalado. En Origen se selecciona sucursal según peso. En Destino se completa destinatario, domicilio, servicio y representación comercial.

Los comerciales requieren CUIT habilitado, categoría “Envío de mercadería” y Factura E. Los no comerciales usan Regalo, Documento o Muestra comercial.

Cada artículo tiene descripción, código armonizado, cantidad, valor y peso unitario. La regla más reciente establece código obligatorio para ambos flujos.

Hasta 2 kg se muestran sucursales propias. Por encima de 2 kg, sólo asiento aduanero. No se usan Puntos Correo.

El servicio se selecciona en Destino. La representación ante Aduana aparece sólo para comerciales y está activa por defecto.

Permanecen pendientes: designación de representante, servicios por país, atributos/tributos, plataformas externas, declaración jurada y facturación.
