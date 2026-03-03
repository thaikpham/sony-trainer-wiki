/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Add remote domains here as needed, e.g.:
    // remotePatterns: [{ protocol: 'https', hostname: 'example.com' }],
  },
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
