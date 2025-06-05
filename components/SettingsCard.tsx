import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Settings } from 'lucide-react';

interface SettingsState {
    lyricsType: 'lrc' | 'srt';
    fileNameFormat: string[];
}

interface SettingsCardProps {
    settings: SettingsState;
    setSettings: (settings: SettingsState) => void;
    onSave: () => void;
    onCancel: () => void;
}

export default function SettingsCard({
    settings,
    setSettings,
    onSave,
    onCancel
}: SettingsCardProps) {
    return (
        <Card className='mt-8 w-full shadow-lg border bg-card'>
            <CardHeader className="border-b">
                <CardTitle className="flex items-center text-xl font-bold">
                    <Settings className="mr-3 h-5 w-5" />
                    Settings
                </CardTitle>
                <CardDescription className="text-base">Configure lyrics format and filename structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
                <div className="space-y-3">
                    <Label htmlFor="lyricsType" className="text-sm font-medium">Lyrics Format</Label>
                    <select
                        id="lyricsType"
                        value={settings.lyricsType}
                        onChange={(e) => setSettings({ ...settings, lyricsType: e.target.value as 'lrc' | 'srt' })}
                        className="w-full h-10 px-3 py-2 border-2 border-border rounded-lg bg-background transition-all duration-200 focus:ring-2 focus:ring-ring/20 hover:border-ring/50"
                    >
                        <option value="lrc">LRC (with timestamps)</option>
                        <option value="srt">SRT (subtitle format)</option>
                    </select>
                </div>
                <div className="space-y-3">
                    <Label htmlFor="filename" className="text-sm font-medium">Filename Format</Label>
                    <Input
                        id="filename"
                        value={settings.fileNameFormat.join('')}
                        onChange={(e) => setSettings({ ...settings, fileNameFormat: [e.target.value] })}
                        placeholder="{track_number}. {track_name}"
                        className="h-10 text-base transition-all duration-200 focus:ring-2 focus:ring-ring/20 border-2 hover:border-ring/50"
                    />
                    <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">
                            <strong>Available variables:</strong> {'{track_name}'}, {'{track_number}'}, {'{track_artist}'}, {'{track_album}'}, {'{track_id}'}
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex gap-3">
                <button
                    onClick={onSave}
                    className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-foreground text-background hover:bg-foreground/90 hover:scale-105 h-10 px-4 shadow-lg hover:shadow-xl"
                >
                    Save Settings
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-border bg-background hover:bg-accent hover:text-accent-foreground hover:scale-105 h-10 px-4"
                >
                    Cancel
                </button>
            </CardFooter>
        </Card>
    );
} 