import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  // Pin the workspace root. Without this, Turbopack walks up and finds a stray
  // package-lock.json in the home directory and guesses the wrong root.
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
};

export default nextConfig;
