Actúa como un arquitecto de diseño UI/UX senior especializado en sistemas de diseño 
para aplicaciones web empresariales.

Necesito que generes un sistema de diseño completo para [SOLUPLAST] con las 
siguientes características:

**Stack técnico:**
- Bootstrap 5 como base (sin reemplazarlo, extendiéndolo)
- CSS custom properties (variables nativas) para theming
- Clases CSS semánticas propias con prefijo `[PREFIX]-` (ej: `app-`, `dash-`, `ui-`)
- Compatible con Vue 3 + Composition API (los componentes deben poder encapsularse 
  fácilmente como SFCs .vue)

**Escope del sistema:**
1. TOKENS DE DISEÑO: colores primarios/secundarios/neutros/semánticos (success, 
   warning, danger, info), tipografía (escala, pesos, alturas de línea), espaciado 
   (escala 4px base), border-radius, sombras, z-index, transiciones/animaciones
2. LAYOUT PANEL ADMIN: sidebar colapsable, topbar, área de contenido, breadcrumbs, 
   sistema de grillas para dashboards
3. LAYOUT LANDING PAGE: navbar sticky, hero section, secciones de contenido, footer
4. COMPONENTES BASE: botones (variantes + estados), inputs/forms, cards, badges, 
   alerts, modals, tablas, navegación, paginación, loaders/skeletons
5. UTILIDADES: clases helper de espaciado, colores de texto/fondo, visibilidad, 
   flexbox shortcuts

**Estilo visual objetivo:** [minimalista corporativo]

**Paleta de marca:**
- Color primario: [#002954]
- Color secundario: [#00719E]  
- Modo: [claro / oscuro / ambos con toggle]

**Entregables esperados:**
- Archivo `design-system.css` con todas las variables y clases
- Archivo `theme-[nombre].css` con la personalización sobre Bootstrap
- Demos HTML de cada sección (admin layout + landing layout)
- Guía de uso rápido comentada en el código

Genera código production-ready, bien comentado por secciones, sin librerías 
adicionales más allá de Bootstrap 5. Cada clase debe tener un propósito claro y 
seguir convención BEM donde aplique.