import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2, Download, Music } from 'lucide-react';
import { SpotifyTrack } from '@/lib/spotify';

interface TrackCardProps {
    track: SpotifyTrack;
    downloadingTrack: string | null;
    onDownload: (track: SpotifyTrack) => void;
}

export default function TrackCard({
    track,
    downloadingTrack,
    onDownload
}: TrackCardProps) {
    return (
        <Card className='mt-8 w-full shadow-xl border-0 bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm overflow-hidden'>
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-b">
                <CardTitle className='flex items-center text-2xl font-bold'>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mr-3">
                        <Music className='h-4 w-4 text-white' />
                    </div>
                    {track.name}
                </CardTitle>
                <CardDescription className="text-lg font-medium">{track.artist_string}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {track.album.images?.[0]?.url && (
                        <div className="relative">
                            <img
                                src={track.album.images[0].url}
                                alt={track.name}
                                width={180}
                                height={180}
                                className="rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                        </div>
                    )}
                    <div className="space-y-3 flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-sm text-muted-foreground">Album</p>
                                <p className="font-semibold">{track.album.name}</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-sm text-muted-foreground">Duration</p>
                                <p className="font-semibold">{track.formatted_duration}</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-sm text-muted-foreground">Release Date</p>
                                <p className="font-semibold">{track.album.release_date}</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-sm text-muted-foreground">Popularity</p>
                                <p className="font-semibold">{track.popularity}%</p>
                            </div>
                        </div>
                        {track.explicit && (
                            <div className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                                Explicit Content
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/20 p-6">
                <button
                    onClick={() => onDownload(track)}
                    disabled={downloadingTrack === track.id}
                    className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-xl text-base font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:scale-105 h-12 px-6 shadow-lg hover:shadow-xl"
                >
                    {downloadingTrack === track.id ? (
                        <><Loader2 className='mr-3 h-5 w-5 animate-spin' /> Downloading...</>
                    ) : (
                        <><Download className='mr-3 h-5 w-5' /> Download Lyrics</>
                    )}
                </button>
            </CardFooter>
        </Card>
    );
} 