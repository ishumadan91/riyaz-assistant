import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    // Embed build: one self-contained file a host page loads with a plain
    // classic <script src>.
    //
    // IIFE rather than ESM, and that is load-bearing: a `<script type=module>`
    // fetch is always CORS-mode, so serving this from a CDN on another origin
    // needs an Access-Control-Allow-Origin header the bucket does not send. A
    // classic script has no such requirement. Lit is deliberately NOT externalised —
    // the host (a Django app with no bundler) cannot resolve a bare import.
    // Tokens are not bundled either: the host's own :root supplies them.
    return {
      build: {
        lib: {
          entry: 'src/embed.ts',
          formats: ['iife' as const],
          name: 'Riyaz',
          fileName: () => 'riyaz.js',
        },
        outDir: 'dist-lib',
        emptyOutDir: true,
      },
    };
  }

  return {
    // Served from a project-pages subpath (…/riyaz-assistant/), so built asset
    // URLs must carry that prefix. A root-relative base would 404 in production.
    base: '/riyaz-assistant/',
    root: 'src',
    publicDir: '../public',
    build: {
      outDir: '../dist',
      emptyOutDir: true,
    },
    server: {
      open: true,
    },
  };
});
