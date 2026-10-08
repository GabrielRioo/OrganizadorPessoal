import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const here = path.dirname(fileURLToPath(import.meta.url));
const rootEnv = path.resolve(here, "../../.env");
dotenv.config({ path: rootEnv });
dotenv.config();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: required("DATABASE_URL"),
  appPassword: required("APP_PASSWORD"),
  sessionSecret: required("SESSION_SECRET"),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  tmdbApiKey: process.env.TMDB_API_KEY?.trim() || "",
  rawgApiKey: process.env.RAWG_API_KEY?.trim() || "",
};

export const isProduction = env.nodeEnv === "production";
