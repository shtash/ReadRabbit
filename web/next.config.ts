import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["@readrabbit/ui", "@readrabbit/domain", "@readrabbit/config"],
};

export default nextConfig;
