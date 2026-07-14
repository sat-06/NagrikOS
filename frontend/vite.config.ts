// Configuration for NagrikOS frontend (TanStack Start + Vite)
// Default: Cloudflare Workers via @lovable.dev/vite-tanstack-config
// For Vercel deployment, set NITRO_PRESET=vercel in env vars
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 5173,
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
