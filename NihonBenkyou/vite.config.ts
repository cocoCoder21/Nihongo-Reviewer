import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Derive the router basename at build time using the same source of truth as
// the Vite `base` option. VERCEL_ENV is set by Vercel on all builds, so it
// works without any manual env-var configuration in the dashboard.
const isVercelProd = process.env.VERCEL_ENV === 'production';
const appBasePath = isVercelProd
  ? (process.env.VITE_APP_BASE_PATH ?? '/nihonbenkyou/')
  : '/';
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
  // Base path for the app. In production it is served under /nihonbenkyou/
  // (proxied from angeliephl.dev). VERCEL_ENV guards against preview deploys
  // inheriting the production base path and breaking asset resolution.
  // Must end with a trailing slash.
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
