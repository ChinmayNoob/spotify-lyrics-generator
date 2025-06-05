import React from 'react';
import { SpotifyAlbum, SpotifyPlaylist, SpotifyTrack } from '@/lib/spotify';
import TrackCard from './TrackCard';
import AlbumCard from './AlbumCard';
import PlaylistCard from './PlaylistCard';

interface FetchedSpotifyData {
    type: 'track' | 'album' | 'playlist';
    data: SpotifyTrack | SpotifyAlbum | SpotifyPlaylist;
}

interface SpotifyDataRendererProps {
    spotifyData: FetchedSpotifyData;
    downloadingTrack: string | null;
    downloadingZip: boolean;
    zipProgress: number;
    onSingleDownload: (track: SpotifyTrack) => void;
    onZipDownload: () => void;
}

export default function SpotifyDataRenderer({
    spotifyData,
    downloadingTrack,
    downloadingZip,
    zipProgress,
    onSingleDownload,
    onZipDownload
}: SpotifyDataRendererProps) {
    const { type, data } = spotifyData;

    if (type === 'track' && data) {
        const track = data as SpotifyTrack;
        return (
            <TrackCard
                track={track}
                downloadingTrack={downloadingTrack}
                onDownload={onSingleDownload}
            />
        );
    } else if (type === 'album' && data) {
        const album = data as SpotifyAlbum;
        return (
            <AlbumCard
                album={album}
                downloadingTrack={downloadingTrack}
                downloadingZip={downloadingZip}
                zipProgress={zipProgress}
                onSingleDownload={onSingleDownload}
                onZipDownload={onZipDownload}
            />
        );
    } else if (type === 'playlist' && data) {
        const playlist = data as SpotifyPlaylist;
        return (
            <PlaylistCard
                playlist={playlist}
                downloadingTrack={downloadingTrack}
                downloadingZip={downloadingZip}
                zipProgress={zipProgress}
                onSingleDownload={onSingleDownload}
                onZipDownload={onZipDownload}
            />
        );
    }

    return null;
} 