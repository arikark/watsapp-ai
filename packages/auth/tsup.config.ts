import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    client: 'src/client.ts',
    server: 'src/server.ts',
  },
  format: ['cjs', 'esm'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.js' : '.mjs',
    };
  },
});
