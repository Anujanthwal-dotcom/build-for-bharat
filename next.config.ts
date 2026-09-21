import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pdf-parse", "@prisma/client"],
  env: {
    NEXTAUTH_URL:
      process.env.NODE_ENV === "production"
        ? "https://main.d3ds9gzbu94egf.amplifyapp.com"
        : (process.env.NEXTAUTH_URL || "http://localhost:3000"),
  },
};

export default nextConfig;