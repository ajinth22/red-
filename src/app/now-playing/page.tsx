"use client"

import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { Play, Pause, SkipBack, SkipForward, Heart, Clock, Music } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useSession } from '@/lib/auth-client';

export default function NowPlayingPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const {
    currentSong,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    progress,
    duration,
  } = useMusicPlayer();

  // --- ALL HOOKS AT TOP ---
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isPending && !session?.user) {
      router.push('/sign-in?redirect=' + encodeURIComponent('/now-playing'));
    }
  }, [session, isPending, router]);

  useEffect(() => {
    // Update favorite state when current song changes
    if (currentSong) {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.some((s: any) => s.id === currentSong.id));
    } else {
      setIsFavorite(false);
    }
  }, [currentSong]);

  // --- CONDITIONAL RENDERING AFTER HOOKS ---
  if (isPending) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (!currentSong) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center mb-6">
            <Music className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No Song Playing</h2>
          <p className="text-gray-400 text-center">
            Search for music and start playing to see it here
          </p>
        </div>
      </AppLayout>
    );
  }

  // --- HELPER FUNCTIONS ---
  const toggleFavorite = () => {
    if (!currentSong) return;
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (isFavorite) {
      const updated = favorites.filter((s: any) => s.id !== currentSong.id);
      localStorage.setItem('favorites', JSON.stringify(updated));
      setIsFavorite(false);
    } else {
      localStorage.setItem('favorites', JSON.stringify([...favorites, currentSong]));
      setIsFavorite(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (progress / duration) * 100 : 0;

  // --- MAIN RENDER ---
  return (
    <AppLayout>
      <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-full">
        <div className="w-full max-w-2xl">
          {/* Album Art */}
          <div className="relative w-full aspect-square mb-6 md:mb-8">
            <Image
              src={currentSong.thumbnail}
              alt={currentSong.title}
              fill
              className="object-cover rounded-lg shadow-2xl"
              priority
            />
          </div>

          {/* Song Info */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-3">
              {currentSong.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-4">
              {currentSong.artist}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{currentSong.duration}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[#dc2626] transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <button
              onClick={playPrevious}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipBack className="w-8 h-8" />
            </button>

            <button
              onClick={togglePlay}
              className="w-16 h-16 flex items-center justify-center bg-white rounded-full hover:scale-105 transition-transform shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-black" />
              ) : (
                <Play className="w-8 h-8 text-black ml-1" fill="black" />
              )}
            </button>

            <button
              onClick={playNext}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward className="w-8 h-8" />
            </button>
          </div>

          {/* Favorite Button */}
          <div className="flex justify-center">
            <button
              onClick={toggleFavorite}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? 'fill-[#dc2626] text-[#dc2626]' : 'text-white'
                }`}
              />
              <span className="text-white font-medium">
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
