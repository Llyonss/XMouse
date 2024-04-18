import { defineConfig } from 'vite'
import Solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [
    Solid(),
  ],
  build: {
    target: 'esnext',
    outDir: 'out/client',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
})
