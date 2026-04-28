const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

const authEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const apiBaseUrl = "https://api.spotify.com/v1";

const scopes = [
  "playlist-modify-public",
  "playlist-modify-private",
  "playlist-read-private",
];

const Spotify = {
  async login() {
    if (!clientId || !redirectUri) {
      throw new Error("Missing Spotify client ID or redirect URI in .env");
    }

    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    localStorage.setItem("spotify_code_verifier", codeVerifier);

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: scopes.join(" "),
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
    });

    window.location.href = `${authEndpoint}?${params.toString()}`;
  },

  async getAccessToken() {
    const existingToken = localStorage.getItem("spotify_access_token");
    const expiryTime = localStorage.getItem("spotify_token_expiry");

    if (existingToken && expiryTime && Date.now() < Number(expiryTime)) {
      return existingToken;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code) {
      return null;
    }

    const codeVerifier = localStorage.getItem("spotify_code_verifier");

    if (!codeVerifier) {
      localStorage.removeItem("spotify_access_token");
      localStorage.removeItem("spotify_token_expiry");
      throw new Error("Missing Spotify code verifier. Please log in again.");
    }

    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get Spotify access token: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();

    localStorage.setItem("spotify_access_token", data.access_token);
    localStorage.setItem(
      "spotify_token_expiry",
      String(Date.now() + data.expires_in * 1000)
    );

    // Remove ?code=... from the URL after login
    window.history.replaceState({}, document.title, window.location.pathname);

    return data.access_token;
  },

  async search(term) {
    const accessToken = await Spotify.getAccessToken();

    if (!accessToken) {
      await Spotify.login();
      return [];
    }

    const endpoint = `${apiBaseUrl}/search?type=track&q=${encodeURIComponent(
      term
    )}`;

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to search Spotify: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (!data.tracks || !data.tracks.items) {
      return [];
    }

    return data.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((artist) => artist.name).join(", "),
      album: track.album.name,
      uri: track.uri,
    }));
  },

  async savePlaylist(playlistName, trackUris) {
    const cleanPlaylistName = playlistName.trim();

    if (!cleanPlaylistName) {
      throw new Error("Playlist name cannot be empty.");
    }

    if (!trackUris || trackUris.length === 0) {
      throw new Error("Add at least one real Spotify track before saving.");
    }

    const invalidUris = trackUris.filter((uri) => {
      return !uri || !uri.startsWith("spotify:track:");
    });

    if (invalidUris.length > 0) {
      throw new Error(
        "Your playlist contains invalid/mock track URIs. Search real Spotify tracks, add them, then save."
      );
    }

    const accessToken = await Spotify.getAccessToken();

    if (!accessToken) {
      await Spotify.login();
      return;
    }

    const userResponse = await fetch(`${apiBaseUrl}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      throw new Error(
        `Failed to get Spotify user: ${userResponse.status} ${errorText}`
      );
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    console.log("Spotify user ID:", userId);
console.log("Playlist name:", cleanPlaylistName);
console.log("Track URIs:", trackUris);

    const playlistResponse = await fetch(`${apiBaseUrl}/me/playlists`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: cleanPlaylistName,
    public: true,
    description: "Created with Jammming",
  }),
});

    if (!playlistResponse.ok) {
      const errorText = await playlistResponse.text();
      throw new Error(
        `Failed to create Spotify playlist: ${playlistResponse.status} ${errorText}`
      );
    }

    const playlistData = await playlistResponse.json();
    const playlistId = playlistData.id;

    const addTracksResponse = await fetch(
  `${apiBaseUrl}/playlists/${playlistId}/items`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uris: trackUris,
    }),
  }
);

  if (!addTracksResponse.ok) {
  const errorText = await addTracksResponse.text();
  throw new Error(
    `Failed to add tracks to Spotify playlist: ${addTracksResponse.status} ${errorText}`
  );
}
  },
};

function generateRandomString(length) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let text = "";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);

  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export default Spotify;