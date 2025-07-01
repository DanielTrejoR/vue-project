# 🛠️ Dev Notes — Proyecto Admin UI

Este documento recoge decisiones de arquitectura, ideas en desarrollo, pendientes a futuro y exploraciones técnicas aplicadas durante la construcción del sistema.

---

## 🎯 Objetivos actuales

- [x] Transición circular entre temas con View Transitions API.
- [x] Encapsulación del cambio de tema en `useRadialThemeToggle.ts`.
- [x] Transición suave de colores usando variables CSS + Element Plus.
- [x] Reemplazo de `useDark()` por lógica totalmente personalizada.

---

## 🚀 Exploraciones completadas

### 🔘 Efecto Radial para modo claro/oscuro

- Utiliza `document.startViewTransition()`.
- Anima `::view-transition-new(root)` o `old(root)` según el caso.
- Clip-path circular desde punto de clic.
- Sin overlay manual.
- Compatibilidad con Chrome 111+, Edge 111+, Opera 97+.

---

## 📝 Pendientes para refactorización futura

### 🌗 Tema oscuro global

- [ ] Encapsular en un plugin tipo `radial-theme.ts`.
- [ ] Exponer `isDark` y `toggleTheme` vía `app.config.globalProperties`.
- [ ] Acceder globalmente desde templates: `@click="$toggleTheme($event)"`.

### 🔍 Composable de acceso global

- [ ] Crear `useGlobalTheme()` que use `getCurrentInstance().proxy` para acceder a `$isDark` y `$toggleTheme` sin repetir lógica.
- [ ] Alternativa: versión `provide/inject` con fallback si el plugin no está instalado.

### 🌀 Animación de íconos

- [ ] Agregar transición entre íconos de sol/luna.
- [ ] Opción 1: `<transition>` con `fade + rotate`.
- [ ] Opción 2 (avanzada): morphing SVG animado.

---

## 📁 Organización del layout

- [x] Limpiar lógica excesiva de `Index.vue`.
- [ ] Extraer lógica del sidebar en un componente dedicado (`Sidebar.vue`).
- [ ] Evitar colisiones de nombres entre estado (`sidebar`) y componente.

---

## 💡 Ideas futuras

- [ ] `useLayoutState()` para encapsular lógica reactiva del layout.
- [ ] Transición entre rutas con `View Transitions API`.
- [ ] Ajuste fino de easing/timing al cambiar tema.
- [ ] Soporte gradual para navegadores no compatibles con fallback manual.

---

_Última actualización: 01/07/2025
