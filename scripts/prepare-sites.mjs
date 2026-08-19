import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('dist/server', { recursive: true });
await writeFile(
  'dist/server/index.js',
  'export { default } from "../_worker.js/index.js";\n',
);
