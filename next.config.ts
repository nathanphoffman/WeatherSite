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
    {
        // Instructs browsers to only load resources from explicitly allowed sources.
        // Restricts scripts, styles, images, and connections to same-origin and the
        // NOAA API to prevent XSS and data injection attacks.
        key: "Content-Security-Policy",
        value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data:",
            "connect-src 'self' https://api.weather.gov",
            "font-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
        ].join("; "),
    },
    {
        // Instructs browsers to always use HTTPS for this domain and subdomains for
        // the next two years. Prevents protocol-downgrade attacks and cookie hijacking.
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
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
