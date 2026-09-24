import type { NextConfig } from "next";
const sharePreview = process.env.NEXT_PUBLIC_SHARE_PREVIEW === "true";
const config: NextConfig = {
  ...(sharePreview
    ? {
        output: "export",
        trailingSlash: true,
        basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
      }
    : {}),
  images: {
    unoptimized: sharePreview,
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  async headers() {
    if (sharePreview) return [];
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
if (sharePreview) delete config.headers;
export default config;
