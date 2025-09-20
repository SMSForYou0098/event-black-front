const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.0.120',
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
    ],
  },
}

module.exports = nextConfig


// images: {
//   domains: ['192.168.0.120','192.168.0.112', 'cricket.getyourticket.in','randomuser.me'], // Add the hostname of your API here
// },