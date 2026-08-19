import { cp, mkdir, writeFile } from 'node:fs/promises';

await mkdir('dist/server', { recursive: true });
await cp('dist/_worker.js', 'dist/server/_worker.js', { recursive: true });
await cp('dist/_astro', 'dist/server/_astro', { recursive: true });
await cp('dist/images/web', 'dist/server/images/web', { recursive: true });
await writeFile(
  'dist/server/index.js',
  `import app from "./_worker.js/index.js";

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith("/_astro/") || pathname.startsWith("/images/")) {
      return env.ASSETS.fetch(request);
    }
    return app.fetch(request, env, ctx);
  },
};
`,
);
