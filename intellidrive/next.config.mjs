/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "www.shareicon.net",
            },
        ],
    },
    experimental: {
        serverComponentsExternalPackages: ["pdf-parse"],
    },
};

export default nextConfig;
