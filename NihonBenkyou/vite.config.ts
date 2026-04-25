import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Derive the router basename at build time using the same source of truth as
// the Vite `base` option. Default to root hosting; override only when needed.
const appBasePath = process.env.VITE_APP_BASE_PATH ?? '/';
// Router basename must NOT have a trailing slash (React Router convention)
const routerBasename = appBasePath.replace(/\/$/, '') || '/';


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  // Base path for the app. Defaults to root (`/`) for direct hosting.
  // Set VITE_APP_BASE_PATH only when deploying under a sub-path.
  // Must end with a trailing slash when not root.
  base: appBasePath,
  define: {
    // Injected at build time so the router uses the same basename that Vite
    // uses for assets — no VITE_APP_BASE_PATH env var required in Vercel.
    __ROUTER_BASENAME__: JSON.stringify(routerBasename),
  },
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  server: {
    port: 5173,
    strictPort: true,
  },
})
