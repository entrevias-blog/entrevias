import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';

await mkdir('dist/server', { recursive: true });
await cp('dist/_worker.js', 'dist/server/_worker.js', { recursive: true });
const assetPaths = [
  ...(await readdir('dist/_astro')).map((name) => `_astro/${name}`),
  ...(await readdir('dist/images/web')).map((name) => `images/web/${name}`),
];
const contentTypes = { css: 'text/css; charset=utf-8', JPG: 'image/jpeg' };
const assets = Object.fromEntries(await Promise.all(assetPaths.map(async (path) => [
  `/${path}`,
  { type: contentTypes[path.split('.').pop()] ?? 'application/octet-stream', data: (await readFile(`dist/${path}`)).toString('base64') },
])));
await writeFile('dist/server/assets.mjs', `export const assets = ${JSON.stringify(assets)};\n`);
await writeFile(
  'dist/server/index.js',
  `import app from "./_worker.js/index.js";
import { assets } from "./assets.mjs";

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    const asset = assets[pathname];
    if (asset) {
      const binary = atob(asset.data);
      const body = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return new Response(body, { headers: { "content-type": asset.type, "cache-control": "public, max-age=31536000, immutable" } });
    }
    return app.fetch(request, env, ctx);
  },
};
`,
);
