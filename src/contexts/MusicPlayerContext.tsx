"use client"

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

export interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
}

interface MusicPlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentIndex: number;
  volume: number;
  progress: number;
  duration: number;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  addToQueue: (song: Song) => void;
  setQueue: (songs: Song[]) => void;
  playerRef: React.MutableRefObject<any>;
  setIsPlaying: (isPlaying: boolean) => void;
  setDuration: (duration: number) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolumeState] = useState(100);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<any>(null);

  const playSong = useCallback((song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    
    // Add to recently played
    const recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
    const updated = [song, ...recentlyPlayed.filter((s: Song) => s.id !== song.id)].slice(0, 20);
    localStorage.setItem('recentlyPlayed', JSON.stringify(updated));
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const playNext = useCallback(() => {
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentSong(queue[currentIndex + 1]);
      setIsPlaying(true);
    }
  }, [queue, currentIndex]);

  const playPrevious = useCallback(() => {
    if (queue.length > 0 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setCurrentSong(queue[currentIndex - 1]);
      setIsPlaying(true);
    }
  }, [queue, currentIndex]);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (playerRef.current) {
      playerRef.current.setVolume(vol);
    }
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setQueue(prev => [...prev, song]);
  }, []);

  return (
    <MusicPlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        queue,
        currentIndex,
        volume,
        progress,
        duration,
        playSong,
        togglePlay,
        playNext,
        playPrevious,
        setVolume,
        setProgress,
        addToQueue,
        setQueue,
        playerRef,
        setIsPlaying,
        setDuration,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
}