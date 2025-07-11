import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow all hostnames
        port: "", // Leave blank to allow all ports
        pathname: "**", // Allow all paths
      },
    ],
  },
 
};

export default nextConfig;