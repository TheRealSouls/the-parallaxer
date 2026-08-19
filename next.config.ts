import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root. Without this, Turbopack walks up past the project
  // and picks up an unrelated lockfile in the user's home directory.
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
