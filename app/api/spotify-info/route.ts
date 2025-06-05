import { NextResponse } from "next/server";
import {
    parseSpotifyUrl,
    getTrack,
    getAlbum,
    getPlaylist,
    SpotifyTrack,
    SpotifyAlbum,
    SpotifyPlaylist,
} from "@/lib/spotify";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url || typeof url !== "string") {
            return NextResponse.json({ error: "Invalid URL provided" }, { status: 400 });
        }

        const parsedUrl = await parseSpotifyUrl(url);

        if (!parsedUrl) {
            return NextResponse.json({ error: "Could not parse Spotify URL or unsupported link provider." }, { status: 400 });
        }

        let data: SpotifyTrack | SpotifyAlbum | SpotifyPlaylist | null = null;
        let dataType: 'track' | 'album' | 'playlist' | null = null;

        switch (parsedUrl.type) {
            case "track":
                data = await getTrack(parsedUrl.id);
                dataType = "track";
                break;
            case "album":
                data = await getAlbum(parsedUrl.id);
                dataType = "album";
                break;
            case "playlist":
                data = await getPlaylist(parsedUrl.id);
                dataType = "playlist";
                break;
            default:
                return NextResponse.json({ error: "Unsupported Spotify entity type" }, { status: 400 });
        }

        if (!data) {
            return NextResponse.json({ error: "Failed to fetch data from Spotify" }, { status: 500 });
        }

        return NextResponse.json({ type: dataType, data });

    } catch (error) {
        console.error("[API_SPOTIFY_INFO_ERROR]", error);
        // Check if the error is a known type or has a message property
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        // Avoid exposing sensitive error details from Spotify API directly to client in some cases
        if (errorMessage.includes("Spotify client ID or secret not configured")) {
            return NextResponse.json({ error: "Server configuration error. Please contact support." }, { status: 500 });
        }
        if (errorMessage.includes("Spotify API Error") || errorMessage.includes("Failed to get Spotify access token")) {
            return NextResponse.json({ error: "Could not connect to Spotify. Please try again later." }, { status: 502 });
        }
        return NextResponse.json({ error: "An unexpected error occurred.", details: errorMessage }, { status: 500 });
    }
}