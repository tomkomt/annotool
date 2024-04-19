/** @type {import('next').NextConfig} */
const nextConfig = {
    // webpack: (config) => {
    //     config.resolve.alias.canvas = false
    //     return config
    // }
    output: 'standalone',
    images: {
        domains: ['firebasestorage.googleapis.com']
    }
};

export default nextConfig;
