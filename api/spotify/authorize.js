import crypto from 'node:crypto';

const callbackUrl = process.env.SPOTIFY_REDIRECT_URI || 'https://entrevias.blog/api/spotify/callback';

export default function handler(_request, response) {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    return response.status(500).send('Spotify is not configured yet.');
  }

  const timestamp = String(Date.now());
  const signature = crypto.createHmac('sha256', SPOTIFY_CLIENT_SECRET).update(timestamp).digest('hex');
  const state = `${timestamp}.${signature}`;
  const url = new URL('https://accounts.spotify.com/authorize');
  url.search = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: callbackUrl,
    scope: 'user-read-currently-playing user-read-recently-played',
    state,
  }).toString();

  return response.redirect(302, url.toString());
}
