"use client";

import { useEffect, useState } from 'react';
import { useMusicPlayer, Song } from '@/contexts/MusicPlayerContext';
import { Play, Heart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import AppLayout from '@/components/AppLayout';

export default function FavoritesPage() {
  const { playSong, setQueue } = useMusicPlayer();
  const [favorites, setFavorites] = useState<Song[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(favs);
  };

  const handlePlaySong = (song: Song) => {
    playSong(song);
    setQueue(favorites);
  };

  const removeFavorite = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.filter(s => s.id !== songId);
    localStorage.setItem('favorites', JSON.stringify(updated));
    setFavorites(updated);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 md:mb-8">
          <div className="w-32 h-32 md:w-56 md:h-56 bg-gradient-to-br from-[#dc2626] to-[#991b1b] rounded-lg flex items-center justify-center flex-shrink-0">
            <Heart className="w-16 h-16 md:w-24 md:h-24 text-white" fill="white" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-400 uppercase mb-1 md:mb-2">Playlist</p>
            <h1 className="text-3xl md:text-6xl font-bold text-white mb-2 md:mb-4">Liked Songs</h1>
            <p className="text-gray-400 text-sm md:text-base">{favorites.length} songs</p>
          </div>
        </div>

        {favorites.length > 0 ? (
          <div className="space-y-2">
            {favorites.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-2 md:gap-4 p-2 md:p-3 rounded-lg hover:bg-secondary transition-all group cursor-pointer"
                onClick={() => handlePlaySong(song)}
              >
                <span className="text-gray-400 w-6 md:w-8 text-center text-sm md:text-base">{index + 1}</span>
                
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

                <button
                  onClick={(e) => removeFavorite(song.id, e)}
                  className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                >
                  <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 md:py-20">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-secondary rounded-full flex items-center justify-center mb-4 md:mb-6">
              <Heart className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 text-center">No Liked Songs</h3>
            <p className="text-gray-400 text-sm md:text-base text-center">Songs you like will appear here</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
