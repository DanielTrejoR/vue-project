# 🛠️ Dev Notes — Proyecto Admin UI

Este documento recoge decisiones de arquitectura, ideas en desarrollo, pendientes a futuro y exploraciones técnicas aplicadas durante la construcción del sistema.

---

## 🎯 Objetivos actuales

- [x] Transición circular entre temas con View Transitions API
- [x] Encapsulación del cambio de tema en `useRadialThemeToggle.ts`
- [x] Transición suave de colores usando variables CSS + Element Plus
- [x] Reemplazo de `useDark()` por lógica completamente personalizada

---

## 🚀 Exploraciones completadas

### 🔘 Efecto Radial para tema claro/oscuro

- View Transitions API con `startViewTransition()`
- Animación `clip-path` desde el punto de clic
- Detección automática de dirección (light → dark y viceversa)
- Compatible con Chrome/Edge/Opera modernos
- Sin overlays ni DOM adicionales

---

## 📝 Pendientes a futuro

### 🌗 Refactor a plugin global

- [ ] Crear `radial-theme.ts` que exponga `toggleTheme()` e `isDark`
- [ ] Usar `app.config.globalProperties` o `provide()` para acceso desde cualquier parte
- [ ] Permitir configuración (easing, duración, clip style, etc.)

### 🌀 Composable de acceso global

- [ ] Encapsular acceso vía `getCurrentInstance().proxy` como `useGlobalTheme()`
- [ ] Alternativa: fallback local si no se detecta plugin

### 🎨 Microanimaciones visuales

- [ ] Transición entre íconos de sol y luna con `<transition>`
- [ ] Opción avanzada: animación SVG morfa
- [ ] Personalizar escala y rotación para mayor carácter visual

---

## 🧼 Organización del layout

- [x] Limpiar lógica excesiva de `Index.vue`
- [x] Extraer `useRadialThemeToggle.ts` como composable reutilizable
- [ ] Integrar componente `Sidebar.vue` real con nombre distinto al estado `sidebar`
- [ ] Reintegrar `RightPanel`, `Navbar`, `TagsView` según diseño final

---

## 💡 Otras ideas futuras

- [ ] `useLayoutState()` para encapsular estructura reactiva y modular
- [ ] Transición entre vistas con View Transitions API
- [ ] Animaciones suaves para collapse de Sidebar
- [ ] Fallback visual en navegadores no compatibles
- [ ] Ajuste fino de performance + accesibilidad

---

_Última actualización: {{FECHA DE HOY}}_
