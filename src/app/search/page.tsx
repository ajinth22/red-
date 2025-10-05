"use client"

import { useState, useEffect, useRef } from 'react';
import { useMusicPlayer, Song } from '@/contexts/MusicPlayerContext';
import { Search, Play, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import AppLayout from '@/components/AppLayout';

export default function SearchPage() {
  const { playSong, setQueue } = useMusicPlayer();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search');
      }

      const data = await response.json();
      setResults(data.songs || []);
    } catch (err) {
      setError('Failed to search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (query.trim()) {
      debounceTimeout.current = setTimeout(() => {
        handleSearch(query);
      }, 500);
    } else {
      setResults([]);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query]);

  const handlePlaySong = (song: Song) => {
    playSong(song);
    setQueue(results);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setError('');
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">Search</h1>
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for songs, artists..."
              value={query}
              onChange={handleInputChange}
              className="pl-11 md:pl-12 pr-11 md:pr-12 h-12 bg-secondary border-none text-white placeholder:text-gray-400"
            />
            {query && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#dc2626] animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {results.map((song) => (
              <div
                key={song.id}
                className="bg-card hover:bg-secondary p-4 rounded-lg transition-all cursor-pointer group"
                onClick={() => handlePlaySong(song)}
              >
                <div className="relative mb-4">
                  <Image
                    src={song.thumbnail}
                    alt={song.title}
                    width={200}
                    height={200}
                    className="w-full aspect-square object-cover rounded-md"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaySong(song);
                    }}
                    className="absolute bottom-2 right-2 w-12 h-12 bg-[#dc2626] rounded-full flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-all shadow-lg hover:scale-105"
                  >
                    <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                  </button>
                </div>
                <h3 className="font-semibold text-white truncate mb-1">{song.title}</h3>
                <p className="text-sm text-gray-400 truncate">{song.artist}</p>
              </div>
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-secondary rounded-full flex items-center justify-center mb-6">
              <Search className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 text-center">No results found</h3>
            <p className="text-gray-400 text-center">Try searching with different keywords</p>
          </div>
        )}

        {!loading && !query && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-secondary rounded-full flex items-center justify-center mb-6">
              <Search className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 text-center">Search for Music</h3>
            <p className="text-gray-400 text-center">Find your favorite songs and artists</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}