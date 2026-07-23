/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/intellihire-work-place',
        destination: '/',
      },
      {
        source: '/joblists',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;
