import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://entrevias.blog',
  output: 'server',
  adapter: cloudflare(),
});
