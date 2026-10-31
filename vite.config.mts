import path from 'path'
import fs from 'fs'
import { defineConfig, loadEnv  } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
import Unocss from 'unocss/vite'
import {
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

const pathSrc = path.resolve(__dirname, 'src')

// unplugin-vue-components y unplugin-auto-import agregan estos imports de Element Plus al transformar
// cada archivo, así que el escaneo inicial de Vite no los ve: sin esta lista, la primera visita a una
// vista con un componente nuevo hace que Vite los optimice y recargue la página entera.
// Components usa los estilos 'index' (sass) y AutoImport los 'css'.
const elementPlusComponents = path.resolve(__dirname, 'node_modules/element-plus/es/components')
const elementPlusStyles = fs.existsSync(elementPlusComponents)
  ? fs.readdirSync(elementPlusComponents).flatMap(name =>
      ['index', 'css']
        .filter(style => fs.existsSync(path.join(elementPlusComponents, name, `style/${style}.mjs`)))
        .map(style => `element-plus/es/components/${name}/style/${style}`)
    )
  : []

// vite-plugin-vuetify (autoImport) agrega imports 'vuetify/components/VBtn'... al transformar: mismo problema.
// Se toman los que Vuetify exporta en su índice (hay carpetas internas, como VOverflowBtn, que no compilan)
const vuetifyComponentsIndex = path.resolve(__dirname, 'node_modules/vuetify/lib/components/index.js')
const vuetifyComponents = fs.existsSync(vuetifyComponentsIndex)
  ? [...fs.readFileSync(vuetifyComponentsIndex, 'utf8').matchAll(/^export \* from "\.\/(V\w+)\/index\.js"/gm)]
      .map(([, name]) => `vuetify/components/${name}`)
  : []

// https://vitejs.dev/config/
export default ({ mode }) => { 
  const env = loadEnv(mode, process.cwd(), '');
  return defineConfig({
    resolve: {
      alias: {
        '@/': `${pathSrc}/`,
        '~/': `${pathSrc}/`,
      },
    },
    optimizeDeps: {
      // escanear todas las vistas y componentes, también los que se registran solos o cargan de forma diferida
      entries: ['index.html', 'src/**/*.vue'],
      include: ['element-plus/es', ...elementPlusStyles, 'vuetify', 'vuetify/directives', ...vuetifyComponents],
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
        
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "~/styles/element/index.scss" as *;`,
        },
      },
    },
    plugins: [
      vue(),
      // importa solo los componentes y directivas de Vuetify que usa cada archivo
      vuetify({ autoImport: true }),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        // allow auto load markdown components under `./src/components/`
        dirs: ['src/components'],
        extensions: ['vue', 'md'],
        // allow auto import and register components used in markdown
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass',
          }),
        ],
        deep: true,
        dts: 'src/components.d.ts',
      }),

      // https://github.com/antfu/unocss
      // see unocss.config.ts for config
      Unocss({
        presets: [
          presetUno(),
          presetAttributify(),
          presetIcons({
            scale: 1.2,
            warn: true,
          }),
        ],
        transformers: [
          transformerDirectives(),
          transformerVariantGroup(),
        ]
      }),
    ],
  })
}