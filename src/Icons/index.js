import SvgIcon from '@/components/SvgIcon.vue'

export default {
  install(app) {
    app.component('svg-icon', SvgIcon)

    const svgFiles = import.meta.glob('./svg/*.svg', { eager: true })
    // Los SVG ya están importados, no necesitas recorrerlos si no se usan explícitamente
  }
}