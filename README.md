# Entre Vías

Personal publication for stories, places, photography and projects.

## Preview locally

From this folder, run:

```bash
npm run dev
```

Then open the local URL shown in the terminal (normally `http://localhost:4321`). The page refreshes automatically whenever you save an edit.

## Where to edit

- `src/pages/index.astro` — homepage copy and section order
- `src/pages/[section].astro` — the five section landing pages
- `src/styles/global.css` — colours, fonts, spacing and responsive design
- `src/components/Nav.astro` — main navigation

The coloured blocks are intentional photo placeholders. Replace them with your photographs once you have them ready.

## Publishing with the editor

Posts now live in `src/content/posts/`. They have a title, short summary, section, publication date, cover image, gallery and body. A post stays private until **Keep as draft** is turned off.

The private writing screen is built with TinaCMS. Once TinaCloud is connected to this GitHub repository, visit `/admin` on the deployed site, sign in, and create or edit a post. Saving creates a GitHub commit and Vercel publishes the update.

### One-time production setup

1. Create a TinaCloud project and connect `entrevias-blog/entrevias`.
2. Copy the project's client ID and read-only token into Vercel as `NEXT_PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN` (for Production, Preview, and Development).
3. Change the Vercel build command to `npm run build:cms` and deploy.

Until those credentials are added, the public site continues to build with `npm run build`; the CMS cannot publish to GitHub yet.
