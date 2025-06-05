import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2, Download, Archive, Disc } from 'lucide-react';
import { SpotifyAlbum, SpotifyTrack } from '@/lib/spotify';

interface AlbumCardProps {
    album: SpotifyAlbum;
    downloadingTrack: string | null;
    downloadingZip: boolean;
    zipProgress: number;
    onSingleDownload: (track: SpotifyTrack) => void;
    onZipDownload: () => void;
}

export default function AlbumCard({
    album,
    downloadingTrack,
    downloadingZip,
    zipProgress,
    onSingleDownload,
    onZipDownload
}: AlbumCardProps) {
    const validTracks: SpotifyTrack[] = album.tracks.items.filter(
        (track): track is SpotifyTrack => track !== null && track !== undefined && typeof track.name === 'string'
    );

    return (
        <Card className='mt-6 w-full max-w-2xl'>
            <CardHeader>
                <CardTitle className='flex items-center'><Disc className='mr-2 h-6 w-6' /> {album.name}</CardTitle>
                <CardDescription>{album.artist_string}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {album.images?.[0]?.url && (
                        <img src={album.images[0].url} alt={album.name} width={150} height={150} className="rounded-md" />
                    )}
                    <div>
                        <p><strong>Total Tracks:</strong> {album.total_tracks}</p>
                        <p><strong>Release Date:</strong> {album.release_date}</p>
                        <p><strong>Label:</strong> {album.label}</p>
                    </div>
                </div>
                <h4 className="mt-4 mb-2 text-lg font-semibold">Tracks:</h4>
                <ul className="list-disc pl-5 max-h-60 overflow-y-auto">
                    {validTracks.map((track: SpotifyTrack, index: number) => (
                        <li key={track.id || index} className="mb-1 text-sm truncate flex justify-between items-center">
                            <span>{track.track_number}. {track.name} ({track.artist_string}) - {track.formatted_duration}</span>
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
                    ))}
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