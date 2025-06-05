import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2, Download, Archive, ListMusic } from 'lucide-react';
import { SpotifyPlaylist, SpotifyTrack, SpotifyPlaylistTrackItem } from '@/lib/spotify';

interface PlaylistCardProps {
    playlist: SpotifyPlaylist;
    downloadingTrack: string | null;
    downloadingZip: boolean;
    zipProgress: number;
    onSingleDownload: (track: SpotifyTrack) => void;
    onZipDownload: () => void;
}

export default function PlaylistCard({
    playlist,
    downloadingTrack,
    downloadingZip,
    zipProgress,
    onSingleDownload,
    onZipDownload
}: PlaylistCardProps) {
    const validPlaylistItems: SpotifyPlaylistTrackItem[] = playlist.tracks.items.filter(
        (item): item is SpotifyPlaylistTrackItem => item !== null && item.track !== null && item.track !== undefined && typeof item.track.name === 'string'
    );

    return (
        <Card className='mt-6 w-full max-w-2xl'>
            <CardHeader>
                <CardTitle className='flex items-center'><ListMusic className='mr-2 h-6 w-6' /> {playlist.name}</CardTitle>
                <CardDescription>By {playlist.owner.display_name} - {playlist.tracks.total} tracks</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {playlist.images?.[0]?.url && (
                        <img src={playlist.images[0].url} alt={playlist.name} width={150} height={150} className="rounded-md" />
                    )}
                    <div>
                        {playlist.description && <p className='text-sm text-muted-foreground mb-2'>{playlist.description}</p>}
                        <p><strong>Followers:</strong> {playlist.followers.total.toLocaleString()}</p>
                        <p><strong>Collaborative:</strong> {playlist.collaborative ? 'Yes' : 'No'}</p>
                    </div>
                </div>
                <h4 className="mt-4 mb-2 text-lg font-semibold">Tracks:</h4>
                <ul className="list-disc pl-5 max-h-60 overflow-y-auto">
                    {validPlaylistItems.map((item: SpotifyPlaylistTrackItem, index: number) => {
                        const track = item.track as SpotifyTrack;
                        return (
                            <li key={track.id || index} className="mb-1 text-sm truncate flex justify-between items-center">
                                <span>{track.name} ({track.artist_string}) - {track.formatted_duration}</span>
                                <button
                                    onClick={() => onSingleDownload(track)}
                                    disabled={downloadingTrack === track.id}
                                    className="ml-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-6 px-2"
                                >
                                    {downloadingTrack === track.id ? (
                                        <Loader2 className='h-3 w-3 animate-spin' />
                                    ) : (
                                        <Download className='h-3 w-3' />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
                {downloadingZip && (
                    <div className="mt-4">
                        <div className="flex justify-between text-sm">
                            <span>Downloading lyrics...</span>
                            <span>{zipProgress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 mt-1">
                            <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${zipProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <button
                    onClick={onZipDownload}
                    disabled={downloadingZip}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    {downloadingZip ? (
                        <><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Creating ZIP...</>
                    ) : (
                        <><Archive className='mr-2 h-4 w-4' /> Download All Lyrics (ZIP)</>
                    )}
                </button>
            </CardFooter>
        </Card>
    );
} 