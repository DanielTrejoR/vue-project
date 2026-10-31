import type { App, Component } from 'vue'
import {
  ChatDotRound,
  Close,
  CollectionTag,
  Comment,
  Delete,
  Document,
  Edit,
  EditPen,
  House,
  Link,
  Lock,
  Picture,
  Plus,
  Refresh,
  RefreshLeft,
  Upload,
  UploadFilled,
  User,
  View,
} from '@element-plus/icons-vue'

// Íconos que el panel usa por nombre: icon="Plus" en los botones y meta.icon en el menú.
// Importarlos uno a uno (y no con import *) deja fuera del bundle los ~300 que no se usan.
export const elementIcons: Record<string, Component> = {
  ChatDotRound,
  Close,
  CollectionTag,
  Comment,
  Delete,
  Document,
  Edit,
  EditPen,
  House,
  Link,
  Lock,
  Picture,
  Plus,
  Refresh,
  RefreshLeft,
  Upload,
  UploadFilled,
  User,
  View,
}

export const registerElementIcons = (app: App) => {
  for (const [name, component] of Object.entries(elementIcons)) {
    if (!app.component(name)) app.component(name, component)
  }
}
