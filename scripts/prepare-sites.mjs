import { cp, mkdir, writeFile } from 'node:fs/promises';

await mkdir('dist/server', { recursive: true });
await cp('dist/_worker.js', 'dist/server/_worker.js', { recursive: true });
await writeFile(
  'dist/server/index.js',
  'export { default } from "./_worker.js/index.js";\n',
);
