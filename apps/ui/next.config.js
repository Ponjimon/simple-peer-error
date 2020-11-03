const withOffline = require('next-offline');

const nextConfig = {
  transformManifest: manifest => ['/'].concat(manifest), // add the homepage to the cache
  workboxOpts: {
    swDest: 'static/service-worker.js',
  },
  experimental: {
    async rewrites() {
      return [
        {
          source: '/service-worker.js',
          destination: '/_next/static/service-worker.js',
        },
      ];
    },
  },
  env: {
    SERVER_URL: process.env.SERVER_URL,
    PEER_HOST: process.env.PEER_HOST,
    PEER_PORT: process.env.PEER_PORT,
    PEER_PATH: process.env.PEER_PATH,
  },
};

module.exports = withOffline(nextConfig);
