import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root. Without this, Turbopack walks up past the project
  // and picks up an unrelated lockfile in the user's home directory.
  turbopack: {
    root: path.resolve(process.cwd()),
  },

  experimental: {
    // Enables forbidden() and unauthorized(), used by the auth guards to render
    // real 403 and 401 pages instead of pretending a studio route does not exist.
    authInterrupts: true,
  },

  images: {
    // Stage 3 uploads article covers to Vercel Blob, which serves them from a
    // per-store subdomain. Declared now so next/image accepts them on arrival.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
