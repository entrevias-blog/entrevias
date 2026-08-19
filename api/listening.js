const tokenEndpoint = 'https://accounts.spotify.com/api/token';
const recentlyPlayedEndpoint = 'https://api.spotify.com/v1/me/player/recently-played?limit=3';

async function getAccessToken() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) return null;

  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });

  if (!response.ok) return null;
  return (await response.json()).access_token;
}

export default async function handler(_request, response) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return response.status(204).end();

    const spotifyResponse = await fetch(recentlyPlayedEndpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!spotifyResponse.ok) return response.status(204).end();

    const { items = [] } = await spotifyResponse.json();
    const tracks = items.map(({ track }) => ({
      name: track.name,
      artist: track.artists.map((artist) => artist.name).join(', '),
      url: track.external_urls.spotify,
    }));

    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return response.status(200).json({ tracks });
  } catch {
    return response.status(204).end();
  }
}
