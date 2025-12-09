/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // Increase body size limit for Server Actions (default is 1MB)
  serverActions: {
    bodySizeLimit: '10mb',
  },
}

module.exports = nextConfig
