# Guía de Diseño y Buenas Prácticas para Vistas Frontend

Esta guía establece los principios visuales y de usabilidad para el desarrollo de interfaces y vistas del frontend. Su objetivo es garantizar una experiencia de usuario (UX) premium, fluida, intuitiva y visualmente consistente a lo largo de todo el ecosistema.

---

## 1. Cabeceras de Página y Estructura Superior

El área superior de una vista (encabezado) es lo primero que el usuario observa. Debe ser limpia, directa y libre de ruido visual inútil.

### Buenas Prácticas
* **Eliminar Ruido de Insignias (Badges) Innecesarios**: Evitar colocar etiquetas, estados o *badges* adicionales por encima del título principal de la vista (ej: insignias estáticas de categoría del módulo). Esto satura la zona superior y distrae la lectura principal.
* **Cabeceras Compactas**: Usar márgenes inferiores moderados para el contenedor de la cabecera (preferiblemente `mb-3` o `mb-4` en lugar de `mb-5`). Esto optimiza la pantalla reduciendo el espacio en blanco vertical sobrante, empujando el contenido útil (como tablas y grids) hacia arriba.
* **Jerarquía Clara**:
  * Título principal (`.sol-page-title`) en tamaño prominente y peso grueso (`font-weight: 800`).
  * Subtítulo descriptivo (`.sol-page-subtitle`) en color neutro suave (`--sol-neutral-gray`) para explicar brevemente la función de la vista.

*Ejemplo de Estructura Compacta:*
```html
<div class="sol-page-header mb-3">
  <div>
    <h2 class="sol-page-title">Título de la Vista</h2>
    <p class="sol-page-subtitle">Descripción concisa y funcional de esta sección.</p>
  </div>
  <BaseButton variant="brand" class="rounded-pill px-4 py-2" @click="handleAction">
    <i class="fa-solid fa-plus me-2"></i> Nuevo Registro
  </BaseButton>
</div>
```

---

## 2. Iconografía Ligera y Semántica

Los iconos deben acompañar y guiar al usuario de forma intuitiva, sin sobrecargar los elementos interactivos.

### Buenas Prácticas
* **Acciones Principales Universales**: Para botones de creación o agregado (ej: *"Nuevo"*), utilizar iconos universales y ligeros como el símbolo de suma (`+` o `fa-plus`) en lugar de iconos complejos o muy pesados visualmente.
* **Consistencia de Estilos**:
  * Usar la misma colección de iconos en todo el proyecto (por ejemplo, FontAwesome `fa-solid` o Bootstrap Icons `bi`).
  * Mantener el espaciado correcto entre el icono y el texto (ej. clase `me-2`).

---

## 3. Tablas y Grids de Datos Eficientes

Las tablas y grids representan el núcleo de la gestión de información del sistema. Deben priorizar la legibilidad y la economía de espacio.

### Buenas Prácticas
* **Soporte de Modo Compacto**: Todos los grids de datos reutilizables (`BaseDataGrid`) deben admitir un prop `compact` para optimizar el espacio en pantallas pequeñas o en vistas administrativas densas.
  * **Modo Normal**: Ideal para catálogos comerciales o pantallas con pocos campos donde se prioriza la holgura visual.
  * **Modo Compacto**: Ideal para paneles de configuración, matrices de permisos y listas con alta densidad de información.
* **Reducción de Padding y Tamaños en Modo Compacto**:
  * Ajustar el padding vertical de las celdas a un máximo de `0.5rem`.
  * Reducir ligeramente el tamaño del texto (`font-size: 0.775rem` en celdas y `0.7rem` en cabeceras).
  * Reducir las dimensiones de avatares u otros elementos circulares de la fila (ej: de `34px` a `28px`).
* **Insignias de Estado Armoniosas (Badges)**:
  * Los estados de fila (ej: *Activo/Suspendido*) deben mostrarse en insignias redondeadas (`.badge rounded-pill`) con colores de fondo tenues (`-subtle`) y bordes a juego.
  * Su tamaño debe ser pequeño y compacto (`sol-smallest` y padding `py-1`) para mantener la simetría y alineación visual con otras columnas del grid.

*Uso de la Propiedad en Vistas con Alta Densidad:*
```html
<BaseDataGrid
  :items="items"
  :columns="columns"
  compact
  @edit="editItem"
/>
```

---

## 4. Textos de Cabecera Claros y Directos

Los títulos de las columnas de una tabla deben ser autoexplicativos, directos y adaptados al lenguaje diario de los usuarios de negocio.

### Buenas Prácticas
* **Evitar Nombres Técnicos**: No usar nombres de bases de datos, abreviaciones técnicas o términos confusos (ej: cambiar nombres como "MAPA DE ACCESO" o "SLUG" por términos de negocio como "PERMISOS ASIGNADOS" o "IDENTIFICADOR").
* **Concisión sobre redundancia**: Si una columna representa el nombre del recurso, la cabecera debe ser simple. Ejemplo: en lugar de "ROL / IDENTIFICADOR", usar simplemente "ROL", ya que el identificador/slug puede mostrarse como subtítulo secundario de forma más elegante.
* **Mayúsculas Estructuradas**: Mantener la convención de títulos de columna en mayúsculas sostenidas (`text-transform: uppercase`) con un espaciado de letras ligero (`letter-spacing: 0.06em`) para mejorar la legibilidad del encabezado.

---

## 5. Separación de Entidades (Staff vs. Clientes)

Garantizar una separación estricta entre el personal operativo interno y los clientes comerciales externos es un principio clave de arquitectura y seguridad del sistema.

### Buenas Prácticas
* **Módulos Independientes**: El módulo de "Usuarios" (Seguridad) debe dedicarse única y exclusivamente a la gestión de accesos del **Personal de Staff / Operarios** del sistema.
* **Exclusión de Clientes**: Filtrar y omitir registros con perfiles de cliente (`customer`) del listado de personal para evitar confusión visual y operativa.
* **Simplificación de Formularios**: No mezclar flujos de facturación, campos de clasificación de cuenta (Individual/B2B) ni identificaciones fiscales en formularios destinados al registro de personal interno. Estos datos pertenecen al módulo exclusivo de Clientes.

---

## 6. Diseño y Control de Flujo en Modales (`BaseModal`)

Los modales son componentes de interacción de alta prioridad y deben diseñarse de forma balanceada, evitando cierres fortuitos y garantizando una excelente jerarquía visual.

### Buenas Prácticas
* **Estructura Visual Clara**:
  * **Cabecera Destacada**: Usar fondos en gradientes ligeros y de alto contraste en el encabezado, garantizando que el título de la acción sea legible inmediatamente y no se pierda.
  * **Separación de Zonas**: El footer de acciones de confirmación debe tener un fondo sutilmente diferente (ej: gris neutro claro) para dividir la zona del formulario de los botones de acción.
  * **Cierre Intuitivo**: Incorporar botones de cierre circulares con iconos semánticos de cruz que reaccionen con animaciones de giro y color al pasar el ratón.
* **Evitar Traspaso y Fuga de Clics (Bug de Cierre)**:
  * El fondo del modal (`backdrop`) nunca debe capturar clics accidentales realizados dentro de la caja de diálogo.
  * Forzar explícitamente la propiedad `pointer-events: auto !important` en los elementos `.modal-dialog` y `.modal-content-custom` para evitar que los clics atraviesen el modal.
  * Detener la propagación de eventos de clic hacia arriba en el árbol DOM mediante el uso del modificador `@click.stop` en el diálogo y en la tarjeta de contenido.

---

## 7. Depuración de Columnas Técnicas (IDs/UUIDs)

El espacio horizontal en las tablas es un recurso crítico que debe reservarse para datos con valor de negocio y fácil lectura.

### Buenas Prácticas
* **Omitir Claves Técnicas de Sistema**: Evitar incluir columnas que muestren identificadores de base de datos como UUIDs (ej: `3f8c85eb-e362-...`) o IDs auto-incrementales en las tablas expuestas al usuario final.
* **Motivo**: Las cadenas largas de caracteres técnicos no aportan valor comercial a la lectura diaria de un operador y saturan el grid de datos, disminuyendo drásticamente la UX.

---

## 8. Eliminación Lógica y Estados de Suspensión (`is_active` y `deleted_at`)

Para mantener la integridad histórica del sistema y evitar la pérdida accidental de datos vinculados, las acciones de eliminación deben ser lógicas (desactivación del registro) y no físicas, presentándose de forma transparente dentro del mismo listado general.

### Buenas Prácticas
* **Desactivación de Estado (`is_active = false`)**: Al suspender o eliminar lógicamente un elemento (como un operario de staff), su estado de operación activa `is_active` debe cambiar a `false` inmediatamente para restringir su acceso en el ecosistema.
* **Fecha de Última Eliminación/Suspensión (`deleted_at`)**: Guardar el timestamp de eliminación en el backend (`deleted_at`) y mostrarlo de forma elegante en el frontend debajo de la insignia de estado (ej: `"Restringido: 24 May"`), dando visibilidad al operador de cuándo ocurrió el cese del registro.
* **Lista Única Unificada**: No segregar los elementos suspendidos en pestañas o módulos separados que dificulten la administración. Mantener un único listado general que muestre tanto elementos activos como inactivos/suspendidos, utilizando badges de colores diferenciados para su distinción (verde para activos, rojo para suspendidos).
* **Acciones Contextuales de Restauración**: Para elementos suspendidos, ocultar los botones ordinarios de edición y suspensión, y en su lugar presentar una acción única y directa de **"Restablecer Acceso"** (o "Restaurar") que reactive el registro a su estado operativo original.
