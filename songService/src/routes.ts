import express from "express";
import {
  getAlbums,
  getAllSongs,
  getAllSongsOfAlbum,
  getSingleSong,
} from "./controller.js";

const router = express.Router();

router.get("/albums", getAlbums);

router.get("/songs", getAllSongs);

router.get("/albums/:id/songs", getAllSongsOfAlbum);

router.get("/songs/:id", getSingleSong);

export default router;
