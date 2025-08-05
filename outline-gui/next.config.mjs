/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['outline-api-client'],
  experimental: {
    appDir: true,
  },
}

export default nextConfig