import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // ponytail: reactCompiler (babel-plugin-react-compiler@1.0.0, still early)
  // was mis-transforming a component with an early return somewhere in the
  // tree, producing invalid hook sequences at runtime — React error #300 on
  // every navigation in production only (the compiler pass is prod-only).
  // Re-enable once on a compiler version that's proven stable with React 19 +
  // Next 16, and audit early-return components first.
  reactCompiler: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
