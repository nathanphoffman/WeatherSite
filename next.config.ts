import type { NextConfig } from "next";

const securityHeaders = [
    {
        // Prevents the page from being embedded in an <iframe> on another domain.
        // Protects against clickjacking attacks where an attacker overlays an invisible
        // iframe on top of a legitimate page to trick users into clicking hidden elements.
        key: "X-Frame-Options",
        value: "DENY",
    },
    {
        // Stops browsers from guessing (sniffing) the content type of a response.
        // Without this, a browser might execute a file as a script even if the server
        // says it's an image — a common vector for XSS via uploaded file attacks.
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    {
        // Controls how much referrer information is included with requests.
        // "strict-origin-when-cross-origin" sends the full URL for same-origin requests
        // but only the origin (no path or query params) for cross-origin requests.
        // Prevents leaking sensitive query parameters (like tokens) to third-party services.
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
    },
    {
        // Disables browser features and APIs that this site doesn't use.
        // Limits the blast radius if XSS occurs — an attacker can't silently access
        // the camera, microphone, or geolocation even if they inject a script.
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
    },
];

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                // Apply security headers to all routes
                source: "/(.*)",
                headers: securityHeaders,
            },
        ];
    },
};

export default nextConfig;
