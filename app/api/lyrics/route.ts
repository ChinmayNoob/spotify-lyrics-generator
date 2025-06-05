import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("trackId");
    const format = searchParams.get("format") || "lrc"; // Default to lrc

    if (!trackId) {
        return NextResponse.json({ error: "Track ID is required" }, { status: 400 });
    }

    if (format !== "lrc" && format !== "srt") {
        return NextResponse.json({ error: "Invalid format specified. Must be 'lrc' or 'srt'." }, { status: 400 });
    }

    try {
        const lyricsApiUrl = `https://spotify-lyrics-api-pi.vercel.app/?trackid=${trackId}&format=${format}`;
        const response = await fetch(lyricsApiUrl);

        if (!response.ok) {
            // If the external API itself returns an error (e.g., 404 for no lyrics)
            if (response.status === 404) {
                return NextResponse.json({ error: "No lyrics found for this track." }, { status: 404 });
            }
            // For other errors from the external API
            const errorData = await response.text(); // Or .json() if it returns structured errors
            console.error(`External lyrics API error: ${response.status}`, errorData);
            return NextResponse.json({ error: `Failed to fetch lyrics: ${response.status}` }, { status: response.status });
        }

        const data = await response.json();

        // The external API returns 200 even for no lyrics sometimes, with an error field or specific structure
        // Based on your JS: response.status != 200 implies error, or data.syncType == "UNSYNCED" for plain lyrics
        // And if data.lines is empty or not present for synced lyrics
        if (data.error === true || (data.syncType !== "UNSYNCED" && (!data.lines || data.lines.length === 0))) {
            // This condition might need refinement based on exact API behavior for "no lyrics found"
            // For now, assuming if lines are empty for synced, or specific error flag is true
            return NextResponse.json({ error: "No lyrics found for this track (or lyrics are empty)." }, { status: 404 });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error("[API_LYRICS_ERROR]", error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: "An unexpected error occurred while fetching lyrics.", details: errorMessage }, { status: 500 });
    }
} 