import { createPinia } from 'pinia'

// Instancia única: main.ts la instala en la app y el código fuera de componentes
// (guard del router, interceptores de axios) la pasa a useXStore(pinia).
export const pinia = createPinia()
