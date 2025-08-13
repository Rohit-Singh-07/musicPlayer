import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DB_URL) {
  throw new Error("DB_URL is not defined in .env file");
}

export const sql = neon(process.env.DB_URL);
