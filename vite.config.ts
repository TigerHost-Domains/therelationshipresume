import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

// const config = defineConfig({
//   plugins: [
//     viteTsConfigPaths({
//       projects: ['./tsconfig.json'],
//     }),
//     tailwindcss(),
//     netlify(),
//     tanstackStart(),
//     viteReact(),
//   ],
// })

// export default config

const isNetlify = process.env.DEPLOY_TARGET === 'netlify' || process.env.NETLIFY === 'true'
export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    // Only include the Netlify plugin if building for Netlify
    ...(isNetlify ? [netlify()] : []),
    tanstackStart(),
    viteReact(),
  ],
  // If building for Render (or anywhere else), tell Nitro to use node-server
  ...(!isNetlify && {
    server: {
      preset: 'node-server',
    },
  }),
})
