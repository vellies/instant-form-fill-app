/** @type {import('next').NextConfig} */
const nextConfig = {
  // API-only in V1: the extension's options page is the UI, this app just
  // serves /api routes backed by Prisma. Pages get added when the dashboard
  // is built.
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
