import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { federation } from '@module-federation/vite'

// Module Federation host. No statically-known remotes - which module(s)
// to load comes from modules.yaml at runtime (via GET /api/modules), see
// src/lib/remoteComponents.tsx. `shared` still has to be declared here so
// this side of the shared scope matches a remote's (react/react-dom must
// dedupe into one instance, or components crash with "invalid hook call").
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'platformCore',
      filename: 'remoteEntry.js',
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
      },
    }),
  ],
  server: { origin: 'http://localhost:41830' },
  build: { target: 'chrome89' },
})
