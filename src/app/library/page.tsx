"use client"

import { useEffect, useState } from 'react';
import { useMusicPlayer, Song } from '@/contexts/MusicPlayerContext';
import { Play, Clock } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/components/AppLayout';

export default function LibraryPage() {
  const { playSong, setQueue } = useMusicPlayer();
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);

  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
    setRecentlyPlayed(recent);
  }, []);

  const handlePlaySong = (song: Song) => {
    playSong(song);
    setQueue(recentlyPlayed);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-6 md:mb-8">Your Library</h1>

        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="bg-secondary mb-6 w-full sm:w-auto">
            <TabsTrigger value="recent" className="flex-1 sm:flex-none">Recently Played</TabsTrigger>
            <TabsTrigger value="playlists" className="flex-1 sm:flex-none">Playlists</TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            {recentlyPlayed.length > 0 ? (
              <div className="space-y-2">
                {recentlyPlayed.map((song, index) => (
                  <div
                    key={`${song.id}-${index}`}
                    className="flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-lg hover:bg-secondary transition-all group cursor-pointer"
                    onClick={() => handlePlaySong(song)}
                  >
                    <div className="relative flex-shrink-0">
                      <Image
                        src={song.thumbnail}
                        alt={song.title}
                        width={48}
                        height={48}
                        className="rounded md:w-14 md:h-14"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 md:w-6 md:h-6 text-white" fill="white" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate text-sm md:text-base">{song.title}</p>
                      <p className="text-gray-400 text-xs md:text-sm truncate">{song.artist}</p>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{song.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 md:py-20">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-secondary rounded-full flex items-center justify-center mb-4 md:mb-6">
                  <Clock className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 text-center">No Recently Played</h3>
                <p className="text-gray-400 text-sm md:text-base text-center">Songs you play will appear here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="playlists">
            <div className="flex flex-col items-center justify-center py-12 md:py-20">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-secondary rounded-full flex items-center justify-center mb-4 md:mb-6">
                <Play className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 text-center">No Playlists Yet</h3>
              <p className="text-gray-400 text-sm md:text-base text-center">Create your first playlist to get started</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}