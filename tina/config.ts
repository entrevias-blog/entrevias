import { defineConfig } from 'tinacms';

const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || 'main';

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'images/posts',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      {
        name: 'post',
        label: 'Posts',
        path: 'src/content/posts',
        format: 'mdx',
        ui: {
          router: ({ document }) => `/${document._sys.filename}`,
        },
        fields: [
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          { type: 'string', name: 'excerpt', label: 'Short summary', ui: { component: 'textarea' }, required: true },
          {
            type: 'string',
            name: 'section',
            label: 'Section',
            required: true,
            options: [
              { value: 'historias', label: 'Historias' },
              { value: 'lugares', label: 'Lugares' },
              { value: 'en-proceso', label: 'En proceso' },
            ],
          },
          { type: 'datetime', name: 'date', label: 'Publication date', required: true },
          { type: 'image', name: 'cover', label: 'Cover image' },
          { type: 'image', name: 'gallery', label: 'Photo gallery', list: true },
          { type: 'boolean', name: 'draft', label: 'Keep as draft', ui: { defaultValue: true } },
          { type: 'boolean', name: 'featured', label: 'Feature on home page' },
          { type: 'rich-text', name: 'body', label: 'Story body', isBody: true },
        ],
      },
    ],
  },
});
