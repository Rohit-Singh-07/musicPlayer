import getBuffer from "./config/dataUri.js";
import TryCatch from "./TryCatch.js";
import type { NextFunction, Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { sql } from "./config/db.js";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

export const addAlbum = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(401).json({ message: "You are not an Admin" });
    return;
  }

  const { title, description } = req.body;
  const file = req.file;

  if (!file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  const fileBuffer = getBuffer(file);

  if (!fileBuffer || !fileBuffer.content) {
    res.status(500).json({ message: "Failed to upload" });
    return;
  }

  const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
    folder: "albums",
  });

  const result = await sql`
    INSERT INTO albums (title, description, thumbnail) 
    VALUES (${title}, ${description}, ${cloud.secure_url}) 
    RETURNING *`;

  res.json({
    message: "Album Created",
    album: result[0],
  });
});

export const addSong = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(401).json({ message: "You are not an Admin" });
    return;
  }

  const { title, description, album } = req.body;

  const isAlbum = await sql`SELECT albums WHERE id = ${album}`;

  if ((isAlbum.length = 0)) {
    res.status(404).json({ message: "Album not found" });
    return;
  }

  const file = req.file;

  const fileBuffer = getBuffer(file);

  if (!fileBuffer || !fileBuffer.content) {
    res.status(500).json({ message: "Failed to upload" });
    return;
  }

  const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
    folder: "songs",
    resource_type: "video",
  });

  const result =
    await sql`INSERT INTO songs (title, description, audio_id) VALUES (${title}, ${description}, ${cloud.secure_url}, ${album})`;

  res.json({
    message: "Song Added",
  });
});

export const addThumbnail = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(401).json({
      message: "You are not admin",
    });

    return;
  }

  const song = await sql`SELECT * FROM songs WHERE id = ${req.params.id}`;

  if (song.length == 0) {
    res.status(404).json({
      message: "Song not found",
    });

    return;
  }

  const file = req.file;

  const fileBuffer = getBuffer(file);

  if (!fileBuffer || !fileBuffer.content) {
    res.status(500).json({ message: "Failed to upload" });
    return;
  }

  const cloud = await cloudinary.uploader.upload(fileBuffer.content);

  const result =
    await sql`UPDATE songs SET thumbnail = ${cloud.secure.sql} WHERE id = ${req.params.id} RETURNING *`;

  res.json({
    message: "Thumbnail Updated",
    song: result[0],
  });
});

export const deleteAlbum = TryCatch(async (req: AuthenticatedRequest, res) => {
  const isAlbum = await sql`SELECT albums WHERE id = ${req.params.id}`;

  if ((isAlbum.length = 0)) {
    res.status(404).json({ message: "Album not found" });
    return;
  }
  await sql`DELETE FROM songs WHERE album_id = ${req.params.id}`;

  await sql`DELETE FROM albums WHERE album_id = ${req.params.id}`;

  res.json({
    message: "Album Deleted",
  });
});

export const deleteSong = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    res.status(401).json({
      message: "You are not Admin",
    });
    return;
  }

  const isSong = await sql`SELECT songs WHERE id = ${req.params.id}`;

  if ((isSong.length = 0)) {
    res.status(404).json({ message: "Song not found" });
    return;
  }

  const { id } = req.params;

  await sql`DELETE FROM songs WHERE id = ${id}`;

  res.json({
    message: "Song Deleted",
  });
});
