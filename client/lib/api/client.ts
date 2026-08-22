import createClient from "openapi-fetch";
import type { paths } from "./schema";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:3001";

export const api = createClient<paths>({ baseUrl: API_URL });

export const CATALOG_CACHE = { next: { revalidate: 60 } } as const;
