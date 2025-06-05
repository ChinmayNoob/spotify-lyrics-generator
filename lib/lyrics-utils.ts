import { saveAs } from 'file-saver';
import JSZip from 'jszip';

// Default settings
export const DEFAULT_SETTINGS = {
    lyricsType: 'lrc' as 'lrc' | 'srt',
    fileNameFormat: ['{track_number}', '. ', '{track_name}']
};

// Settings management
export function getSettings() {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;

    const saved = localStorage.getItem('lyricsSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
}

export function saveSettings(settings: typeof DEFAULT_SETTINGS) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lyricsSettings', JSON.stringify(settings));
}

// Sanitize filename for safe downloading
export function sanitizeFilename(filename: string): string {
    return filename.replace(/[\/\\:*?"<>|]/g, '_');
}

// Replace template variables in filename format
export function formatFilename(template: string[], trackDetails: any): string {
    const templateString = template.join('');
    let result = templateString;

    const replacements: Record<string, string> = {
        '{track_name}': trackDetails.track_name || trackDetails.name || '',
        '{track_number}': trackDetails.track_number?.toString() || '',
        '{track_artist}': trackDetails.track_artist || trackDetails.artist_string || trackDetails.artists || '',
        '{track_album}': trackDetails.track_album || trackDetails.album?.name || trackDetails.albumName || '',
        '{track_id}': trackDetails.track_id || trackDetails.id || '',
        '{track_explicit}': trackDetails.explicit ? '[E]' : '',
        '{track_release_date}': trackDetails.track_release_date || trackDetails.album?.release_date || trackDetails.releaseDate || '',
        '{track_popularity}': trackDetails.popularity?.toString() || '',
        '{track_duration}': trackDetails.formatted_duration || trackDetails.duration || ''
    };

    Object.entries(replacements).forEach(([key, value]) => {
        result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    return result;
}

// Fetch lyrics from our API
export async function fetchLyrics(trackId: string, format: 'lrc' | 'srt' = 'lrc') {
    const response = await fetch(`/api/lyrics?trackId=${trackId}&format=${format}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('No lyrics found for this track.');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch lyrics.');
    }

    return response.json();
}

// Process lyrics data and add metadata
export function processLyricsData(lyricsData: any, trackDetails: any, format: 'lrc' | 'srt'): string[] {
    const lyrics: string[] = [];

    if (!lyricsData.lines || lyricsData.lines.length === 0) {
        throw new Error('No lyrics content available.');
    }

    // Add metadata for LRC format
    if (format === 'lrc') {
        lyrics.push(`[ar:${trackDetails.track_artist || trackDetails.artist_string || trackDetails.artists || ''}]\n`);
        lyrics.push(`[al:${trackDetails.track_album || trackDetails.album?.name || trackDetails.albumName || ''}]\n`);
        lyrics.push(`[ti:${trackDetails.track_name || trackDetails.name || ''}]\n`);
        lyrics.push(`[length:${trackDetails.formatted_duration || trackDetails.duration || ''}]\n\n`);
    }

    // Process lyrics lines based on sync type and format
    if (lyricsData.syncType === "UNSYNCED") {
        // Unsynced lyrics - just plain text
        lyricsData.lines.forEach((line: any) => {
            lyrics.push(`${line.words}\n`);
        });
    } else {
        // Synced lyrics
        if (format === 'srt') {
            lyricsData.lines.forEach((line: any) => {
                lyrics.push(`${line.index}\n${line.startTime} --> ${line.endTime}\n${line.words}\n\n`);
            });
        } else {
            // LRC format
            lyricsData.lines.forEach((line: any) => {
                lyrics.push(`[${line.timeTag}] ${line.words}\n`);
            });
        }
    }

    return lyrics;
}

// Download single lyrics file
export function downloadLyricsFile(lyrics: string[], filename: string, format: 'lrc' | 'srt') {
    const blob = new Blob(lyrics, { type: "text/plain;charset=utf-8" });
    const sanitizedName = sanitizeFilename(filename);
    saveAs(blob, `${sanitizedName}.${format}`);
}

// Download lyrics for a single track
export async function downloadSingleTrackLyrics(trackDetails: any) {
    const settings = getSettings();

    try {
        const lyricsData = await fetchLyrics(trackDetails.id, settings.lyricsType);
        const processedLyrics = processLyricsData(lyricsData, trackDetails, settings.lyricsType);
        const filename = formatFilename(settings.fileNameFormat, trackDetails);

        downloadLyricsFile(processedLyrics, filename, settings.lyricsType);
        return { success: true, sync: lyricsData.syncType !== "UNSYNCED" };
    } catch (error: any) {
        // Don't log to console, let the UI handle the error display
        throw new Error(error.message || 'Failed to download lyrics');
    }
}

// Download lyrics for multiple tracks as ZIP
export async function downloadMultipleTracksLyrics(tracks: any[], albumName: string, onProgress?: (progress: number) => void) {
    const settings = getSettings();
    const zip = new JSZip();
    let successful = 0;
    let total = tracks.length;
    let noLyricsCount = 0;

    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];

        try {
            const lyricsData = await fetchLyrics(track.id, settings.lyricsType);
            const processedLyrics = processLyricsData(lyricsData, track, settings.lyricsType);
            const filename = formatFilename(settings.fileNameFormat, track);

            zip.file(`${sanitizeFilename(filename)}.${settings.lyricsType}`, processedLyrics.join(''));
            successful++;
        } catch (error: any) {
            // Count tracks with no lyrics instead of logging warnings
            if (error.message && error.message.includes('No lyrics found')) {
                noLyricsCount++;
            }
            // Don't log to console, let the UI handle error reporting
        }

        if (onProgress) {
            onProgress(((i + 1) / total) * 100);
        }
    }

    if (successful === 0) {
        if (noLyricsCount === total) {
            throw new Error('No lyrics found for any tracks in this collection.');
        } else {
            throw new Error('Failed to download lyrics for any tracks.');
        }
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${sanitizeFilename(albumName)}.zip`);

    return { successful, total, noLyricsCount };
} 