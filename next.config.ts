import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "delta-web-t3.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/profile-images/**",
      },
      {
        protocol: "https",
        hostname: "delta-web-t3.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/event-images/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
