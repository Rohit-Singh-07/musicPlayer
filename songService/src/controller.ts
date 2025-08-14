import TryCatch from "./TryCatch.js";
import { sql } from "./config/db.js";
import { redisClient } from "./index.js";

export const getAlbums = TryCatch(async (req, res) => {
  let albums;

  const CACHE_EXPIRY = 1800;

  if (redisClient.isReady) {
    albums = await redisClient.get("albums");
  }

  if (albums) {
    console.log("Cache hit");
    res.json(JSON.parse(albums));

    return;
  } else {
    console.log("Cache miss");
    albums = await sql`SELECT * FROM albums`;

    if (redisClient.isReady) {
      await redisClient.set("albums", JSON.stringify(albums), {
        EX: CACHE_EXPIRY,
      });
    }

    res.json(albums);
  }
});

export const getAllSongs = TryCatch(async (req, res) => {
  let songs;

  const CACHE_EXPIRY = 1800;

  if (redisClient.isReady) {
    songs = await redisClient.get("songs");
  }

  if (songs) {
    console.log("Cache hit");
    res.json(JSON.parse(songs));

    return;
  } else {
    console.log("Cache miss");
    songs = await sql`SELECT * FROM songs`;

    if (redisClient.isReady) {
      await redisClient.set("songs", JSON.stringify(songs), {
        EX: CACHE_EXPIRY,
      });
    }

    res.json(songs);
  }
});

export const getAllSongsOfAlbum = TryCatch(async (req, res) => {
  const { id } = req.params;

  let album;
  let songs;

  album = await sql`SELECT * FROM albums WHERE id = ${id}`;

  if ((album.length = 0)) {
    res.status(404).json({
      message: "Album not found",
    });
  }

  songs = await sql`SELECT * FROM songs WHERE album_id = ${id}`;

  const response = { songs, album: album[0] };

  res.json(response);
});

export const getSingleSong = TryCatch(async (req, res) => {
  const song = await sql`SELECT * FROM songs WHERE id = ${req.params.id}`;

  res.json(song[0]);
});
