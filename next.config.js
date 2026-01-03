const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  webpack: (config, { isServer }) => {
    // Fix for face-api.js and other libraries that use Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'tbz.getyourticket.in',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'tb.getyourticket.in',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'dark.getyourticket.in',
      },
      {
        protocol: 'https',
        hostname: 'cricket.getyourticket.in',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'http',
        hostname: '192.168.0.197',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.0.191',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.0.122',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.0.184',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.0.166',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.0.106',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.0.153',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.0.141',
        port: '8000',
        pathname: '/uploads/**',
      },
    ],
  },


}

module.exports = nextConfig


// images: {
//   domains: ['192.168.0.120','192.168.0.112', 'cricket.getyourticket.in','randomuser.me'], // Add the hostname of your API here
// },