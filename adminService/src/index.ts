import express from "express";
import { sql } from "./config/db.js";
import dotenv from "dotenv"
import adminRoutes from "./route.js"
import cloudinary from 'cloudinary'
import redis from 'redis'
import cors from 'cors'

dotenv.config();

export const redisClient = redis.createClient({
  password: process.env.REDIS_PASS,
  socket: {
    host: "redis-15723.c80.us-east-1-2.ec2.redns.redis-cloud.com",
    port: 15723,
  },
});

redisClient
  .connect()
  .then(() => {
    console.log("Connected to Redis successfully.");
  })
  .catch((err) => {
    console.error("Error connecting to Redis:", err);
    process.exit(1);
  });


const app = express();

app.use(cors())

app.use(express.json())

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
const port = process.env.PORT || 7000;

const initDB = async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS albums (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        thumbnail VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

    await sql`
      CREATE TABLE IF NOT EXISTS songs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        thumbnail VARCHAR(255),
        audio VARCHAR(255) NOT NULL,
        album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

    console.log("Database initialised");
  } catch (error) {
    console.error("Database init error:", error);
  }
};

app.use('/api/v1/', adminRoutes)

initDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
