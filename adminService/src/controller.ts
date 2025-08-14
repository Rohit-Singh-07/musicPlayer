import getBuffer from "./config/dataUri.js";
import TryCatch from "./TryCatch.js";
import type { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { sql } from "./config/db.js";
import { redisClient } from "./index.js";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

// -------------------- Add Album --------------------
export const addAlbum = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== "admin") {
    return res.status(401).json({ message: "You are not an Admin" });
  }

  const { title, description } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file uploaded" });

  const fileBuffer = getBuffer(file);
  if (!fileBuffer?.content) return res.status(500).json({ message: "Failed to process file" });

  const cloud = await cloudinary.uploader.upload(fileBuffer.content, { folder: "albums" });

  const [album] = await sql`
    INSERT INTO albums (title, description, thumbnail) 
    VALUES (${title}, ${description}, ${cloud.secure_url}) 
    RETURNING *
  `;

  if (redisClient.isReady) await redisClient.del("albums");

  res.json({ message: "Album Created", album });
});

// -------------------- Add Song --------------------
export const addSong = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    return res.status(401).json({ message: "You are not an Admin" });
  }

  const { title, description, album_id } = req.body;

  if (album_id) {
    const isAlbum = await sql`SELECT * FROM albums WHERE id = ${album_id}`;
    if (isAlbum.length === 0) {
      return res.status(404).json({ message: "Album not found" });
    }
  }

  const file = req.file;
  const fileBuffer = getBuffer(file);

  if (!fileBuffer?.content) {
    return res.status(500).json({ message: "Failed to upload" });
  }

  const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
    folder: "songs",
    resource_type: "video",
  });

  await sql`
    INSERT INTO songs (title, description, audio, album_id) 
    VALUES (${title}, ${description}, ${cloud.secure_url}, ${album_id || null})
  `;

  if (redisClient.isReady) {
    await redisClient.del("songs");
    console.log("Cache invalidation for songs");
  }

  res.json({ message: "Song Added" });
});


// -------------------- Add Thumbnail --------------------
export const addThumbnail = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== "admin") {
    return res.status(401).json({ message: "You are not an Admin" });
  }

  const song = await sql`SELECT * FROM songs WHERE id = ${req.params.id}`;
  if (song.length === 0) return res.status(404).json({ message: "Song not found" });

  const file = req.file;
  if (!file) return res.status(400).json({ message: "No file uploaded" });

  const fileBuffer = getBuffer(file);
  if (!fileBuffer?.content) return res.status(500).json({ message: "Failed to process file" });

  const cloud = await cloudinary.uploader.upload(fileBuffer.content);

  const [updatedSong] = await sql`
    UPDATE songs SET thumbnail = ${cloud.secure_url} WHERE id = ${req.params.id} RETURNING *
  `;

  if (redisClient.isReady) await redisClient.del("albums");

  res.json({ message: "Thumbnail Updated", song: updatedSong });
});

// -------------------- Delete Album --------------------
export const deleteAlbum = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const isAlbum = await sql`SELECT * FROM albums WHERE id = ${req.params.id}`;
  if (isAlbum.length === 0) return res.status(404).json({ message: "Album not found" });

  await sql`DELETE FROM songs WHERE album_id = ${req.params.id}`;
  await sql`DELETE FROM albums WHERE id = ${req.params.id}`;

  if (redisClient.isReady) {
    await redisClient.del("albums");
    await redisClient.del("songs");
  }

  res.json({ message: "Album Deleted" });
});

// -------------------- Delete Song --------------------
export const deleteSong = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== "admin") {
    return res.status(401).json({ message: "You are not an Admin" });
  }

  const isSong = await sql`SELECT * FROM songs WHERE id = ${req.params.id}`;
  if (isSong.length === 0) return res.status(404).json({ message: "Song not found" });

  await sql`DELETE FROM songs WHERE id = ${req.params.id}`;

  if (redisClient.isReady) {
    await redisClient.del("albums");
    await redisClient.del("songs");
  }

  res.json({ message: "Song Deleted" });
});
