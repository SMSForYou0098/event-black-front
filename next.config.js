const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  images: {
    domains: ['192.168.0.120','192.168.0.112', 'cricket.getyourticket.in','randomuser.me'], // Add the hostname of your API here
  },
}

module.exports = nextConfig;
