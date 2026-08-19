import crypto from 'node:crypto';

const callbackUrl = process.env.SPOTIFY_REDIRECT_URI || 'https://entrevias.blog/api/spotify/callback';

function page(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${title}</title><style>body{max-width:42rem;margin:10vh auto;padding:0 1.5rem;background:#f6f1e8;color:#2a211e;font:18px/1.5 system-ui}code{display:block;overflow-wrap:anywhere;padding:1rem;background:#e6ded1}a{color:inherit}</style></head><body><h1>${title}</h1>${body}</body></html>`;
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  const { code, state, error } = request.query;
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

  if (error) return response.status(400).send(page('Spotify connection cancelled', '<p>No changes were made. You can close this tab.</p>'));
  if (!code || !state || !SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) return response.status(400).send(page('Spotify connection could not start', '<p>Please try again from the connection link.</p>'));

  const [timestamp, signature] = state.split('.');
  const expected = crypto.createHmac('sha256', SPOTIFY_CLIENT_SECRET).update(timestamp || '').digest('hex');
  const isRecent = Number.isFinite(Number(timestamp)) && Date.now() - Number(timestamp) < 10 * 60 * 1000;
  if (!signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) || !isRecent) {
    return response.status(400).send(page('Spotify connection expired', '<p>Please return to the connection link and try again.</p>'));
  }

  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: callbackUrl }),
  });
  const token = await tokenResponse.json();
  if (!tokenResponse.ok || !token.refresh_token) return response.status(400).send(page('Spotify connection failed', '<p>Please try again.</p>'));

  return response.status(200).send(page('One last private step', `<p>Copy the code below, add it in Vercel as <strong>SPOTIFY_REFRESH_TOKEN</strong>, then close this tab. Do not share it.</p><code>${token.refresh_token}</code>`));
}
