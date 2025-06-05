import { formatDurationMs } from './utils';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken: string | null = null;
let tokenExpiryTime: number | null = null;

interface SpotifyTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export async function getSpotifyAccessToken(): Promise<string> {
    if (accessToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
        return accessToken;
    }

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
        throw new Error('Spotify client ID or secret not configured in .env.local');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
        },
        body: 'grant_type=client_credentials',
        cache: 'no-store' // Ensure fresh token
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to get Spotify access token: ${response.status} ${errorBody}`);
    }

    const data = await response.json() as SpotifyTokenResponse;
    accessToken = data.access_token;
    tokenExpiryTime = Date.now() + (data.expires_in * 1000) - 5 * 60 * 1000; // Refresh 5 mins before expiry
    return accessToken;
}

const SPOTIFY_URL_REGEX = /^(?:spotify:(track|album|playlist):|https?:\/\/[a-z]+\.spotify\.com\/(track|playlist|album)\/)([a-zA-Z0-9]{22})/;
const SHORT_URL_REGEX_STRING = 'window.top.location = validateProtocol\\("([^"]+)"\\);';

export interface ParsedSpotifyUrl {
    type: 'track' | 'album' | 'playlist';
    id: string;
}

export async function parseSpotifyUrl(url: string): Promise<ParsedSpotifyUrl | null> {
    let currentUrl = url;
    try {
        // Handle potential redirects for short links
        const initialResponse = await fetch(currentUrl, { method: 'HEAD', redirect: 'follow' });
        currentUrl = initialResponse.url;
    } catch (e) {
        // if HEAD request fails, try GET for services that might not support HEAD well for redirection
        try {
            const initialResponse = await fetch(currentUrl, { redirect: 'follow' });
            currentUrl = initialResponse.url;
        } catch (fetchError) {
            console.error('Failed to resolve URL:', fetchError);
            // Proceed with the original URL if fetching fails
        }
    }

    if (currentUrl.includes('spotify.link') || currentUrl.includes('spotify.app.link')) {
        try {
            const pageResponse = await fetch(currentUrl);
            const pageText = await pageResponse.text();
            const shortUrlMatch = pageText.match(new RegExp(SHORT_URL_REGEX_STRING));
            if (shortUrlMatch && shortUrlMatch[1]) {
                currentUrl = shortUrlMatch[1];
            }
        } catch (e) {
            console.warn('Failed to resolve spotify short link, trying original URL', e);
        }
    }

    const match = currentUrl.match(SPOTIFY_URL_REGEX);
    if (match) {
        const type = (match[1] || match[2]) as 'track' | 'album' | 'playlist';
        const id = match[3];
        return { type, id };
    }

    // Fallback to Songwhip if direct regex fails
    // This part is adapted from your Python code.
    // Note: Songwhip usage should be compliant with their terms of service.
    console.log(`Attempting Songwhip fallback for URL: ${url}`);
    try {
        const songwhipResponse = await fetch('https://songwhip.com/api/songwhip/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url, country: 'US' }), // Assuming US, or make configurable
        });
        if (songwhipResponse.ok) {
            const songwhipData = await songwhipResponse.json();
            const spotifyLink = songwhipData?.data?.item?.links?.spotify?.[0]?.link;
            if (spotifyLink) {
                const songwhipMatch = spotifyLink.match(SPOTIFY_URL_REGEX);
                if (songwhipMatch) {
                    const type = (songwhipMatch[1] || songwhipMatch[2]) as 'track' | 'album' | 'playlist';
                    const id = songwhipMatch[3];
                    return { type, id };
                }
            }
        } else {
            console.warn('Songwhip API call failed:', songwhipResponse.status, await songwhipResponse.text());
        }
    } catch (e) {
        console.error('Error during Songwhip fallback:', e);
    }
    return null;
}

// --- Interfaces for Spotify API responses ---
export interface SpotifyImage {
    url: string;
    height?: number;
    width?: number;
}

export interface SpotifyArtist {
    name: string;
    id: string;
}

export interface SpotifyTrack {
    id: string;
    name: string;
    artists: SpotifyArtist[];
    album: {
        name: string;
        images: SpotifyImage[];
        release_date: string;
    };
    track_number: number;
    duration_ms: number;
    explicit: boolean;
    popularity: number;
    preview_url: string | null;
    formatted_duration?: string; // Added for convenience
    artist_string?: string; // Added for convenience
}

export interface SpotifyAlbum {
    id: string;
    name: string;
    artists: SpotifyArtist[];
    images: SpotifyImage[];
    release_date: string;
    total_tracks: number;
    label: string;
    tracks: {
        items: SpotifyTrack[]; // Simplified, might need full track objects if detailed info is needed for each
    };
    artist_string?: string; // Added for convenience
}

export interface SpotifyPlaylistTrackItem {
    added_at: string;
    added_by: { id: string; type: string; };
    is_local: boolean;
    track: SpotifyTrack | null; // Track can be null if unavailable
}

export interface SpotifyPlaylist {
    id: string;
    name: string;
    description: string;
    owner: {
        display_name: string;
        id: string;
    };
    images: SpotifyImage[];
    followers: {
        total: number;
    };
    tracks: {
        items: SpotifyPlaylistTrackItem[];
        total: number;
        next: string | null; // For pagination
    };
    collaborative: boolean;
}

// --- API Fetching Functions ---

async function fetchSpotifyApi<T>(endpoint: string): Promise<T> {
    const token = await getSpotifyAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Spotify API Error (${endpoint}): ${response.status}`, errorBody);
        throw new Error(`Spotify API Error: ${response.status} on ${endpoint}`);
    }
    return response.json() as Promise<T>;
}

export async function getTrack(trackId: string): Promise<SpotifyTrack> {
    const track = await fetchSpotifyApi<SpotifyTrack>(`tracks/${trackId}`);
    track.formatted_duration = formatDurationMs(track.duration_ms);
    track.artist_string = track.artists.map(a => a.name).join(', ');
    return track;
}

export async function getAlbum(albumId: string): Promise<SpotifyAlbum> {
    const album = await fetchSpotifyApi<SpotifyAlbum>(`albums/${albumId}?market=US`); // Add market for track availability
    album.artist_string = album.artists.map(a => a.name).join(', ');
    // Format duration for tracks in the album if needed
    album.tracks.items = album.tracks.items.map(track => ({
        ...track,
        formatted_duration: formatDurationMs(track.duration_ms),
        artist_string: track.artists.map(a => a.name).join(', ')
    }));
    return album;
}

export async function getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
    // Initial fetch for playlist details and first batch of tracks
    const playlist = await fetchSpotifyApi<SpotifyPlaylist>(`playlists/${playlistId}?market=US&fields=id,name,description,owner(display_name,id),images,followers,tracks(items(added_at,added_by,is_local,track(id,name,artists(name,id),album(name,images,release_date),track_number,duration_ms,explicit,popularity,preview_url)),total,next),collaborative`);

    playlist.tracks.items = playlist.tracks.items.filter(item => item.track !== null).map(item => ({
        ...item,
        track: {
            ...(item.track!),
            formatted_duration: formatDurationMs(item.track!.duration_ms),
            artist_string: item.track!.artists.map(a => a.name).join(', ')
        }
    }));

    // Handle pagination for remaining tracks
    let nextUrl = playlist.tracks.next;
    while (nextUrl) {
        const token = await getSpotifyAccessToken(); // Ensure token is fresh for subsequent requests
        const response = await fetch(nextUrl, { // Fetch directly using the full URL from 'next'
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Spotify API Error (paginating playlist tracks): ${response.status}`, errorBody);
            break; // Stop pagination on error
        }
        const nextPageData = await response.json() as { items: SpotifyPlaylistTrackItem[]; next: string | null; };

        const formattedItems = nextPageData.items.filter(item => item.track !== null).map(item => ({
            ...item,
            track: {
                ...(item.track!),
                formatted_duration: formatDurationMs(item.track!.duration_ms),
                artist_string: item.track!.artists.map(a => a.name).join(', ')
            }
        }));
        playlist.tracks.items.push(...formattedItems);
        nextUrl = nextPageData.next;
    }
    return playlist;
}

// Utility to get all track details for an album or playlist (simplified)
// In a real app, you might want more robust pagination handling for playlists with many tracks
export interface SimplifiedTrackDetails {
    id: string;
    name: string;
    artists: string; // comma-separated
    albumName: string;
    trackNumber: number;
    durationMs: number;
    explicit: boolean;
    releaseDate: string; // from album
}

export async function getAllTrackDetailsForAlbum(albumId: string): Promise<SimplifiedTrackDetails[]> {
    const album = await getAlbum(albumId); // This already fetches initial tracks
    let allTracks: SpotifyTrack[] = album.tracks.items.filter(t => t !== null && t.id !== null) as SpotifyTrack[];

    // Handle pagination if album.tracks.next exists (Spotify API for album tracks usually returns all, but good practice)
    let currentAlbumTracksEndpoint = `albums/${albumId}/tracks?limit=50`;
    if (album.tracks.items.length < album.total_tracks) { // Check if we need to paginate
        let offset = album.tracks.items.length;
        while (offset < album.total_tracks) {
            const page = await fetchSpotifyApi<{ items: SpotifyTrack[] }>(`${currentAlbumTracksEndpoint}&offset=${offset}`);
            allTracks.push(...page.items.filter(t => t !== null && t.id !== null));
            if (page.items.length < 50) break; // No more tracks
            offset += page.items.length;
        }
    }

    return allTracks.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(a => a.name).join(', '),
        albumName: album.name, // Album name from parent album object
        trackNumber: track.track_number,
        durationMs: track.duration_ms,
        explicit: track.explicit,
        releaseDate: album.release_date, // Release date from parent album object
    }));
}

export async function getAllTrackDetailsForPlaylist(playlistId: string): Promise<SimplifiedTrackDetails[]> {
    const playlist = await getPlaylist(playlistId); // getPlaylist already handles pagination
    return playlist.tracks.items
        .filter(item => item.track && item.track.id) // Ensure track and track.id are not null
        .map(item => {
            const track = item.track!;
            return {
                id: track.id,
                name: track.name,
                artists: track.artists.map(a => a.name).join(', '),
                albumName: track.album.name,
                trackNumber: track.track_number,
                durationMs: track.duration_ms,
                explicit: track.explicit,
                releaseDate: track.album.release_date,
            };
        });
}

// Corresponds to your Python get_all_trackids but fetches more details
// This is for the ZIP download logic where you need track_number, name, artist etc.
export interface TrackForLyrics {
    id: string;
    name: string;
    artist: string; // Comma separated
    album: string;
    track_number: number;
    duration: string; // Formatted duration
    // For filename formatting
    track_id: string;
    track_name: string;
    track_artist: string;
    track_album: string;
    track_explicit: string;
    track_release_date: string;
    track_popularity: number; // if available
}

// This function mirrors your python `get_all_trackids` output more closely for use in `maxDownload` like logic
// if you need the exact structure your old JS expected.
// However, `getAllTrackDetailsForAlbum/Playlist` provide more comprehensive data.
export async function getTrackIdsWithMinimalDetails(
    entityId: string,
    isAlbum: boolean
): Promise<Record<string, { name: string; track_number: number; artist: string; duration: string; album?: string }>> {
    const tracks: Record<string, { name: string; track_number: number; artist: string; duration: string; album?: string }> = {};
    let offset = 0;
    const limit = 50;

    if (isAlbum) {
        while (true) {
            const results = await fetchSpotifyApi<{ items: SpotifyTrack[]; next: string | null }>(
                `albums/${entityId}/tracks?limit=${limit}&offset=${offset}`
            );
            for (const track of results.items) {
                if (!track || !track.id) continue;
                tracks[track.id] = {
                    name: track.name,
                    track_number: track.track_number,
                    artist: track.artists.map(a => a.name).join(', '),
                    duration: formatDurationMs(track.duration_ms),
                };
            }
            offset += results.items.length;
            if (!results.next || results.items.length < limit) break;
        }
    } else { // Playlist
        while (true) {
            const results = await fetchSpotifyApi<{ items: SpotifyPlaylistTrackItem[]; next: string | null }>(
                `playlists/${entityId}/tracks?limit=${limit}&offset=${offset}&fields=items(track(id,name,artists(name),track_number,duration_ms,album(name))),next`
            );
            for (const item of results.items) {
                if (!item.track || !item.track.id) continue;
                const track = item.track;
                tracks[track.id] = {
                    name: track.name,
                    track_number: track.track_number,
                    artist: track.artists.map(a => a.name).join(', '),
                    duration: formatDurationMs(track.duration_ms),
                    album: track.album.name,
                };
            }
            offset += results.items.length;
            if (!results.next || results.items.length < limit) break;
        }
    }
    return tracks;
} 