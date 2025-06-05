"use client";

import React, { useState, FormEvent } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { SpotifyAlbum, SpotifyPlaylist, SpotifyTrack } from '@/lib/spotify';
import { downloadSingleTrackLyrics, downloadMultipleTracksLyrics, getSettings, saveSettings } from '@/lib/lyrics-utils';
import { motion } from 'motion/react';
import HeroSection from '@/components/HeroSection';
import SettingsCard from '@/components/SettingsCard';
import SpotifyDataRenderer from '@/components/SpotifyDataRenderer';

interface FetchedSpotifyData {
  type: 'track' | 'album' | 'playlist';
  data: SpotifyTrack | SpotifyAlbum | SpotifyPlaylist;
}

export default function HomePage() {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [spotifyData, setSpotifyData] = useState<FetchedSpotifyData | null>(null);
  const [downloadingTrack, setDownloadingTrack] = useState<string | null>(null);
  const [downloadingZip, setDownloadingZip] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settings, setSettings] = useState(getSettings);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!url.trim()) {
      toast.error("Please enter a Spotify URL.");
      return;
    }
    setLoading(true);
    setError(null);
    setSpotifyData(null);
    try {
      const response = await fetch('/api/spotify-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch Spotify data.');
      }

      setSpotifyData(result as FetchedSpotifyData);
      toast.success("Spotify data fetched successfully!")
    } catch (err: any) {
      console.error("Submission error:", err);
      const errorMessage = err.message || "An unknown error occurred.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleDownload = async (track: SpotifyTrack) => {
    setDownloadingTrack(track.id);
    try {
      const result = await downloadSingleTrackLyrics(track);
      if (result.sync) {
        toast.success(`Downloaded lyrics for "${track.name}"`);
      } else {
        toast.warning(`Downloaded unsynced lyrics for "${track.name}"`);
      }
    } catch (error: any) {
      if (error.message && error.message.includes('No lyrics found')) {
        toast.error(`No lyrics found for "${track.name}"`);
      } else {
        toast.error(error.message || 'Failed to download lyrics');
      }
    } finally {
      setDownloadingTrack(null);
    }
  };

  const handleZipDownload = async () => {
    if (!spotifyData) return;

    setDownloadingZip(true);
    setZipProgress(0);

    try {
      let tracks: any[] = [];
      let albumName = '';

      if (spotifyData.type === 'album') {
        const album = spotifyData.data as SpotifyAlbum;
        tracks = album.tracks.items.filter(t => t && t.id);
        albumName = album.name;
      } else if (spotifyData.type === 'playlist') {
        const playlist = spotifyData.data as SpotifyPlaylist;
        tracks = playlist.tracks.items
          .filter(item => item.track && item.track.id)
          .map(item => item.track);
        albumName = playlist.name;
      }

      if (tracks.length === 0) {
        toast.error('No tracks found to download');
        return;
      }

      const result = await downloadMultipleTracksLyrics(
        tracks,
        albumName,
        (progress) => setZipProgress(progress)
      );

      if (result.successful === result.total) {
        toast.success(`Downloaded lyrics for all ${result.total} tracks`);
      } else if (result.successful > 0) {
        toast.warning(`Downloaded ${result.successful} out of ${result.total} tracks (${result.total - result.successful} had no lyrics)`);
      }
    } catch (error: any) {
      if (error.message && error.message.includes('No lyrics found for any tracks')) {
        toast.error('No lyrics found for any tracks in this collection');
      } else {
        toast.error(error.message || 'Failed to download lyrics ZIP');
      }
    } finally {
      setDownloadingZip(false);
      setZipProgress(0);
    }
  };

  const handleSettingsUpdate = () => {
    saveSettings(settings);
    setShowSettings(false);
    toast.success('Settings saved successfully!');
  };

  return (
    <main className="min-h-screen bg-background">
      <HeroSection
        url={url}
        setUrl={setUrl}
        loading={loading}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        onSubmit={handleSubmit}
      />

      {/* Results Section */}
      {(error || spotifyData || showSettings) && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 pb-16"
        >
          <div className="max-w-3xl mx-auto">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-destructive/10 border-destructive shadow-lg border">
                  <CardHeader>
                    <CardTitle className="text-destructive">Error</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-destructive-foreground">{error}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SettingsCard
                  settings={settings}
                  setSettings={setSettings}
                  onSave={handleSettingsUpdate}
                  onCancel={() => setShowSettings(false)}
                />
              </motion.div>
            )}

            {spotifyData && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <SpotifyDataRenderer
                  spotifyData={spotifyData}
                  downloadingTrack={downloadingTrack}
                  downloadingZip={downloadingZip}
                  zipProgress={zipProgress}
                  onSingleDownload={handleSingleDownload}
                  onZipDownload={handleZipDownload}
                />
              </motion.div>
            )}
          </div>
        </motion.section>
      )}
    </main>
  );
}