/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use experimental object for serverComponentsExternalPackages
  experimental: {
    serverComponentsExternalPackages: ['puppeteer'],
  },
  webpack: (config) => {
    // Ignore specific modules that cause issues with Puppeteer in serverless environments
    config.externals = [...(config.externals || []), 'chrome-aws-lambda'];
    return config;
  },
};

module.exports = nextConfig; 