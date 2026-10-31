import { h } from 'vue'
import type { IconProps, IconSet } from 'vuetify'
import { aliases, mdi as mdiSvg } from 'vuetify/iconsets/mdi-svg'
import {
  mdiAccountLockOutline,
  mdiAccountOutline,
  mdiAccountPlus,
  mdiArrowLeft,
  mdiArrowRight,
  mdiCheck,
  mdiClose,
  mdiCommentOutline,
  mdiDelete,
  mdiEye,
  mdiEyeOff,
  mdiEyeOutline,
  mdiFacebook,
  mdiFolderOutline,
  mdiHomeOutline,
  mdiLinkVariant,
  mdiLogin,
  mdiLogout,
  mdiMagnify,
  mdiMusicNote,
  mdiNewspaperVariantOutline,
  mdiPaletteOutline,
  mdiPencil,
  mdiPencilOutline,
  mdiPinterest,
  mdiPlus,
  mdiSend,
  mdiStar,
  mdiTextBoxSearchOutline,
  mdiViewDashboardOutline,
  mdiWeatherNight,
  mdiWeatherSunny,
} from '@mdi/js'

// Solo los íconos que usa la parte pública, como SVG: la fuente @mdi/font pesaba ~1 MB (7000 íconos).
// En las plantillas se siguen escribiendo como "mdi mdi-nombre"; para uno nuevo, agrégalo aquí.
export const icons: Record<string, string> = {
  'account-lock-outline': mdiAccountLockOutline,
  'account-outline': mdiAccountOutline,
  'account-plus': mdiAccountPlus,
  'arrow-left': mdiArrowLeft,
  'arrow-right': mdiArrowRight,
  check: mdiCheck,
  close: mdiClose,
  'comment-outline': mdiCommentOutline,
  delete: mdiDelete,
  eye: mdiEye,
  'eye-off': mdiEyeOff,
  'eye-outline': mdiEyeOutline,
  facebook: mdiFacebook,
  'folder-outline': mdiFolderOutline,
  'home-outline': mdiHomeOutline,
  'link-variant': mdiLinkVariant,
  login: mdiLogin,
  logout: mdiLogout,
  magnify: mdiMagnify,
  'music-note': mdiMusicNote,
  'newspaper-variant-outline': mdiNewspaperVariantOutline,
  'palette-outline': mdiPaletteOutline,
  pencil: mdiPencil,
  'pencil-outline': mdiPencilOutline,
  pinterest: mdiPinterest,
  plus: mdiPlus,
  send: mdiSend,
  star: mdiStar,
  'text-box-search-outline': mdiTextBoxSearchOutline,
  'view-dashboard-outline': mdiViewDashboardOutline,
  'weather-night': mdiWeatherNight,
  'weather-sunny': mdiWeatherSunny,
}

/** "mdi mdi-arrow-left" o "mdi-arrow-left" → "arrow-left" */
export const iconName = (value: string) => value.replace(/^mdi\s+/, '').replace(/^mdi-/, '')

/** El path SVG de un nombre "mdi-*", o el valor tal cual si ya es un path */
export const resolveIcon = (value: IconProps['icon']) => {
  if (typeof value !== 'string' || !value.startsWith('mdi')) return value
  const path = icons[iconName(value)]
  if (!path && import.meta.env.DEV) console.warn(`[icons] "${value}" no está registrado en src/plugins/icons.ts`)
  return path ?? value
}

export const mdi: IconSet = {
  component: (props: IconProps) => h(mdiSvg.component, { ...props, icon: resolveIcon(props.icon) }),
}

export { aliases }
