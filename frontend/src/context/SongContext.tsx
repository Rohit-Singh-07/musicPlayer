import axios from "axios";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const server = "http://localhost:8000/api/v1";

export interface Song {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  audio: string;
  album: string;
}

export interface Album {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
}

interface SongContextType {
  songs: Song[];
  song: Song | null;
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;
  loading: boolean;
  selectedSong: string | null;
  setSelectedSong: (id: string) => void;
  albums: Album[];
  fetchSingleSong: () => Promise<void>;
  nextSong: () => void;
  prevSong: () => void;
  albumSong: Song[];
  albumData: Album | null;
  fetchAlbumsongs: (id: string) => Promise<void>;
  fetchSongs: () => Promise<void>;
  fetchAlbums: () => Promise<void>;
}

const SongContext = createContext<SongContextType | undefined>(undefined);

interface SongProviderProps {
  children: ReactNode;
}

export const SongProvider: React.FC<SongProviderProps> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [song, setSong] = useState<Song | null>(null);
  const [index, setIndex] = useState<number>(0);
  const [albumSong, setAlbumSong] = useState<Song[]>([]);
  const [albumData, setAlbumData] = useState<Album | null>(null);

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<Song[]>(`${server}/songs`);
      setSongs(data);
      if (data.length > 0) {
        setSelectedSong(data[0].id.toString());
        setIndex(0);
      }
      setIsPlaying(false);
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSingleSong = useCallback(async () => {
    if (!selectedSong) return;
    try {
      const { data } = await axios.get<Song>(`${server}/songs/${selectedSong}`);
      setSong(data);
    } catch (error) {
      console.error("Failed to fetch song:", error);
    }
  }, [selectedSong]);

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<Album[]>(`${server}/albums`);
      setAlbums(data);
    } catch (error) {
      console.error("Failed to fetch albums:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAlbumsongs = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data } = await axios.get<Song[]>(`${server}/albums/${id}/songs`);
      setAlbumSong(data);
      const album = albums.find((a) => a.id === id) || null;
      setAlbumData(album);
    } catch (error) {
      console.error("Failed to fetch album songs:", error);
    } finally {
      setLoading(false);
    }
  }, [albums]);

  const nextSong = useCallback(() => {
    if (songs.length === 0) return;
    const nextIndex = (index + 1) % songs.length;
    setIndex(nextIndex);
    setSelectedSong(songs[nextIndex]?.id.toString());
  }, [index, songs]);

  const prevSong = useCallback(() => {
    if (songs.length === 0) return;
    const prevIndex = index > 0 ? index - 1 : songs.length - 1;
    setIndex(prevIndex);
    setSelectedSong(songs[prevIndex]?.id.toString());
  }, [index, songs]);

  useEffect(() => {
    fetchSongs();
    fetchAlbums();
  }, [fetchSongs, fetchAlbums]);

  return (
    <SongContext.Provider
      value={{
        songs,
        selectedSong,
        setSelectedSong,
        isPlaying,
        setIsPlaying,
        loading,
        albums,
        fetchSingleSong,
        song,
        nextSong,
        prevSong,
        fetchAlbumsongs,
        albumData,
        albumSong,
        fetchSongs,
        fetchAlbums,
      }}
    >
      {children}
    </SongContext.Provider>
  );
};

export const useSongData = (): SongContextType => {
  const context = useContext(SongContext);
  if (!context) {
    throw new Error("useSongData must be used within a SongProvider");
  }
  return context;
};
