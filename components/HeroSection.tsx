import React, { FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2, Settings, Music, ListMusic, Disc, Sparkles, Zap, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { FaSpotify, FaGithub } from 'react-icons/fa6';

interface HeroSectionProps {
    url: string;
    setUrl: (url: string) => void;
    loading: boolean;
    showSettings: boolean;
    setShowSettings: (show: boolean) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function HeroSection({
    url,
    setUrl,
    loading,
    showSettings,
    setShowSettings,
    onSubmit
}: HeroSectionProps) {
    return (
        <section className="relative overflow-hidden">
            <div className="container mx-auto px-4 pt-8 pb-12">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="relative mb-6"
                    >
                        <motion.div
                            className="absolute top-0 right-0 flex gap-2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8, duration: 0.4 }}
                        >
                            <a
                                href="https://github.com/chinmaynoob"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border bg-background hover:bg-accent hover:text-accent-foreground hover:scale-110 h-10 w-10 shadow-lg hover:shadow-xl"
                            >
                                <FaGithub className="h-5 w-5" />
                                <span className="sr-only">GitHub Profile</span>
                            </a>
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border bg-background hover:bg-accent hover:text-accent-foreground hover:scale-110 h-10 w-10 shadow-lg hover:shadow-xl"
                            >
                                <Settings className="h-5 w-5" />
                                <span className="sr-only">Settings</span>
                            </button>
                        </motion.div>

                        <motion.div
                            className="flex justify-center items-center gap-3 mb-4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <motion.div
                                className="relative"
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                                <div className="h-12 w-12 rounded-full bg-foreground flex items-center justify-center shadow-lg">
                                    <FaSpotify className="h-8 w-8 text-background" />
                                </div>
                                <motion.div
                                    className="absolute -top-1 -right-1 h-5 w-5 bg-foreground rounded-full flex items-center justify-center"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Sparkles className="h-2.5 w-2.5 text-background" />
                                </motion.div>
                            </motion.div>

                            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                                Spotify Lyrics Generator
                            </h1>
                        </motion.div>

                        <motion.p
                            className="text-lg text-muted-foreground max-w-2xl mx-auto"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            Download lyrics for tracks, albums, and playlists in LRC & SRT formats
                        </motion.p>
                    </motion.div>

                    {/* Main Input Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="max-w-xl mx-auto"
                    >
                        <motion.div
                            className="relative"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <Card className="shadow-lg border bg-card">
                                <div className="relative">
                                    <CardHeader className="text-center pb-4 pt-6">
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.8 }}
                                        >
                                            <CardTitle className="text-xl font-bold mb-2 text-foreground">
                                                Paste Your Spotify Link
                                            </CardTitle>
                                        </motion.div>
                                    </CardHeader>

                                    <form onSubmit={onSubmit}>
                                        <CardContent className="px-6 pb-2">
                                            <motion.div
                                                className="space-y-3"
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 1, duration: 0.4 }}
                                            >
                                                <div className="relative">
                                                    <motion.div
                                                        whileFocus={{ scale: 1.01 }}
                                                        className="relative"
                                                    >
                                                        <Input
                                                            id="spotifyUrl"
                                                            type="url"
                                                            placeholder="https://open.spotify.com/track/..."
                                                            value={url}
                                                            onChange={(e) => setUrl(e.target.value)}
                                                            disabled={loading}
                                                            required
                                                            className="h-12 text-base pl-12 pr-4 transition-all duration-300 focus:ring-2 focus:ring-ring/20 border-2 border-border hover:border-ring/50 focus:border-ring bg-background rounded-lg"
                                                        />
                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                                            <div className="h-6 w-6 rounded-md bg-foreground flex items-center justify-center">
                                                                <Music className="h-3.5 w-3.5 text-background" />
                                                            </div>
                                                        </div>
                                                        {url && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                                            >
                                                                <div className="h-5 w-5 rounded-full bg-foreground flex items-center justify-center">
                                                                    <Zap className="h-2.5 w-2.5 text-background" />
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        </CardContent>

                                        <CardFooter className="px-6 pb-6">
                                            <motion.div
                                                className="w-full"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Button
                                                    type="submit"
                                                    className="w-full h-12 text-base font-semibold bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg"
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            <span>Fetching...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="mr-2 h-4 w-4" />
                                                            <span>Get Lyrics</span>
                                                            <motion.div
                                                                className="ml-1"
                                                                animate={{ x: [0, 3, 0] }}
                                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                            >
                                                                →
                                                            </motion.div>
                                                        </>
                                                    )}
                                                </Button>
                                            </motion.div>
                                        </CardFooter>
                                    </form>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Feature Pills */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2, duration: 0.5 }}
                            className="flex flex-wrap justify-center gap-2 mt-6"
                        >
                            {[
                                { icon: Music, text: "Tracks", color: "from-green-500 to-green-600" },
                                { icon: Disc, text: "Albums", color: "from-blue-500 to-blue-600" },
                                { icon: ListMusic, text: "Playlists", color: "from-purple-500 to-purple-600" },
                                { icon: Star, text: "LRC & SRT", color: "from-orange-500 to-orange-600" }
                            ].map((feature, index) => (
                                <motion.div
                                    key={feature.text}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 1.3 + index * 0.05 }}
                                    whileHover={{ scale: 1.05, y: -1 }}
                                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-white text-xs font-medium bg-gradient-to-r ${feature.color} shadow-md hover:shadow-lg transition-all duration-200`}
                                >
                                    <feature.icon className="h-3 w-3 mr-1.5" />
                                    {feature.text}
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
} 