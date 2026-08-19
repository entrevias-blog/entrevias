const tokenEndpoint = 'https://accounts.spotify.com/api/token';
const currentlyPlayingEndpoint = 'https://api.spotify.com/v1/me/player/currently-playing';
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

    const spotifyResponse = await fetch(currentlyPlayingEndpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const current = spotifyResponse.status === 204 ? null : await spotifyResponse.json();
    const currentTrack = current?.is_playing && current?.item?.type === 'track' ? current.item : null;

    let track = currentTrack;
    if (!track) {
      const recentResponse = await fetch(recentlyPlayedEndpoint, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!recentResponse.ok) return response.status(204).end();
      track = (await recentResponse.json()).items?.[0]?.track;
    }
    if (!track) return response.status(204).end();

    const result = {
      name: track.name,
      artist: track.artists.map((artist) => artist.name).join(', '),
      url: track.external_urls.spotify,
    };

    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return response.status(200).json({ track: result });
  } catch {
    return response.status(204).end();
  }
}
