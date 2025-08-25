export function registerSvgIcons() {
  const svgModules = import.meta.glob('./svg/*.svg', { eager: true })
  // Esto importa todos los SVGs para que estén disponibles en runtime
}