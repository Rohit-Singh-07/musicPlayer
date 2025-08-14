import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserData } from "../context/UserContext";
import { useSongData } from "../context/SongContext";
import axios from "axios";
import toast from "react-hot-toast";
import { MdDelete } from "react-icons/md";

const server = "http://localhost:7000";

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useUserData();
  const { albums, songs, fetchAlbums, fetchSongs } = useSongData();

  // Album form state
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");
  const [albumThumbnail, setAlbumThumbnail] = useState<File | null>(null);

  // Song form state
  const [songTitle, setSongTitle] = useState("");
  const [songDescription, setSongDescription] = useState("");
  const [songFile, setSongFile] = useState<File | null>(null);
  const [songAlbumId, setSongAlbumId] = useState("");

  // Thumbnail for song
  const [songThumbnail, setSongThumbnail] = useState<File | null>(null);

  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== "admin") navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    fetchAlbums();
    fetchSongs();
  }, [fetchAlbums, fetchSongs]);

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void
  ) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
  };

  const handleAlbumSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!albumThumbnail) return toast.error("Album thumbnail required");

    const formData = new FormData();
    formData.append("title", albumTitle);
    formData.append("description", albumDescription);
    formData.append("file", albumThumbnail);

    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${server}/api/v1/album/new`, formData, {
        headers: { token: localStorage.getItem("token") || "" },
      });

      toast.success(data.message);
      fetchAlbums();
      setAlbumTitle("");
      setAlbumDescription("");
      setAlbumThumbnail(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Album upload failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleSongSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!songFile) return toast.error("Song file required");

    const formData = new FormData();
    formData.append("title", songTitle);
    formData.append("description", songDescription);
    formData.append("file", songFile);
    if (songAlbumId) formData.append("album_id", songAlbumId);

    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${server}/api/v1/song/new`, formData, {
        headers: { token: localStorage.getItem("token") || "" },
      });

      toast.success(data.message);
      fetchSongs();
      setSongTitle("");
      setSongDescription("");
      setSongFile(null);
      setSongAlbumId("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Song upload failed");
    } finally {
      setBtnLoading(false);
    }
  };

  // Upload thumbnail for a song
  const handleAddThumbnail = async (id: string) => {
    if (!songThumbnail) return toast.error("Please select an image");

    const formData = new FormData();
    formData.append("file", songThumbnail);

    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${server}/api/v1/song/${id}`, formData, {
        headers: { token: localStorage.getItem("token") || "" },
      });

      toast.success(data.message);
      fetchSongs();
      setSongThumbnail(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Thumbnail upload failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (type: "album" | "song", id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    setBtnLoading(true);
    try {
      const endpoint = `${server}/api/v1/${type}/${id}`;
      const { data } = await axios.delete(endpoint, {
        headers: { token: localStorage.getItem("token") || "" },
      });

      toast.success(data.message);
      fetchSongs();
      if (type === "album") fetchAlbums();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Delete failed");
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#212121] text-white p-8">
      <Link
        to="/"
        className="bg-green-500 text-white font-bold py-2 px-4 rounded-full"
      >
        Go to home page
      </Link>

      {/* Album Upload Form */}
      <h2 className="text-2xl font-bold mb-6 mt-6">Add Album</h2>
      <form onSubmit={handleAlbumSubmit} className="form-container">
        <input
          type="text"
          placeholder="Title"
          value={albumTitle}
          onChange={(e) => setAlbumTitle(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="text"
          placeholder="Description"
          value={albumDescription}
          onChange={(e) => setAlbumDescription(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="file"
          onChange={(e) => handleFileChange(e, setAlbumThumbnail)}
          accept="image/*"
          required
          className="auth-input"
        />
        <button disabled={btnLoading} className="auth-btn w-24">
          {btnLoading ? "Please Wait..." : "Add"}
        </button>
      </form>

      {/* Song Upload Form */}
      <h2 className="text-2xl font-bold mb-6 mt-10">Add Song</h2>
      <form onSubmit={handleSongSubmit} className="form-container">
        <input
          type="text"
          placeholder="Title"
          value={songTitle}
          onChange={(e) => setSongTitle(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="text"
          placeholder="Description"
          value={songDescription}
          onChange={(e) => setSongDescription(e.target.value)}
          required
          className="auth-input"
        />
        <select
          value={songAlbumId}
          onChange={(e) => setSongAlbumId(e.target.value)}
          className="auth-input"
        >
          <option value="">-- Optional Album --</option>
          {albums.map((album) => (
            <option key={album.id} value={album.id}>
              {album.title}
            </option>
          ))}
        </select>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, setSongFile)}
          accept="audio/*"
          required
          className="auth-input"
        />
        <button disabled={btnLoading} className="auth-btn w-24">
          {btnLoading ? "Please Wait..." : "Add"}
        </button>
      </form>

      {/* Albums List */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Added Albums</h3>
        <div className="flex flex-wrap gap-4">
          {albums.map((a) => (
            <div key={a.id} className="card">
              <img src={a.thumbnail} className="w-52 h-52 object-cover" alt="" />
              <h4 className="font-bold mt-2">{a.title}</h4>
              <p className="text-sm text-gray-300">{a.description.slice(0, 50)}...</p>
              <button
                disabled={btnLoading}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded"
                onClick={() => handleDelete("album", a.id)}
              >
                <MdDelete />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Songs List */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Added Songs</h3>
        <div className="flex flex-wrap gap-4">
          {songs.map((s) => (
            <div key={s.id} className="card">
              {s.thumbnail ? (
                <img src={s.thumbnail} className="w-52 h-52 object-cover" alt="" />
              ) : (
                <div className="flex flex-col items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setSongThumbnail)}
                  />
                  <button
                    className="auth-btn mt-2 w-48"
                    disabled={btnLoading}
                    onClick={() => handleAddThumbnail(s.id)}
                  >
                    {btnLoading ? "Uploading..." : "Add Thumbnail"}
                  </button>
                </div>
              )}
              <h4 className="font-bold mt-2">{s.title}</h4>
              <p className="text-sm text-gray-300">{s.description.slice(0, 50)}...</p>
              <button
                disabled={btnLoading}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded"
                onClick={() => handleDelete("song", s.id)}
              >
                <MdDelete />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
