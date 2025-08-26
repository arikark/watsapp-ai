import { cloudflare } from '@cloudflare/vite-plugin';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: 'ssr' },
      experimental: {
        remoteBindings: true,
      },
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
  // resolve: {
  //   alias: {
  //     'node:sqlite': path.resolve(__dirname, 'src/polyfills/node_sqlite.ts'),
  //   },
  // },
  // define: {
  //   // Provide a fallback for node:sqlite in Cloudflare Workers environment
  //   'process.env.NODE_ENV': JSON.stringify(
  //     process.env.NODE_ENV || 'development'
  //   ),
  // },
});
