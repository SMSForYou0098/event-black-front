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
    // {
    //   protocol: 'http',
    //   hostname: 'dark.getyourticket.in',
    // },
    {
      protocol: 'https',
      hostname: 'dark.getyourticket.in',
    },
    {
      protocol: 'http',
      hostname: '192.168.0.120',
    },
    {
      protocol: 'http',
      hostname: '192.168.0.164',
    },
    {
      protocol: 'http',
      hostname: '192.168.0.112',
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
      hostname: 'nav.ssgarba.com',
    },
    {
      protocol: 'https',
      hostname: 'via.placeholder.com',
    },
    {
      protocol: 'http',
      hostname: '192.168.0.164',
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