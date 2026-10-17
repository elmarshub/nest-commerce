import createClient from "openapi-fetch";
import type { paths } from "./schema";

// Set API_URL in Vercel to override; production falls back to the Render API
const API_URL =
  process.env.API_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://nest-commerce-api.onrender.com"
    : "http://127.0.0.1:3001");

export const api = createClient<paths>({ baseUrl: API_URL });

export const CATALOG_CACHE = { next: { revalidate: 60 } } as const;
