import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Weather",
  description: "Created for fun by Nathan Hoffman",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <main>{children}</main>
        <footer className="mt-8 pb-4 text-center text-sm text-gray-600">
          City data provided by <a href="https://simplemaps.com/data/countries" className="underline hover:text-gray-400" target="_blank" rel="noopener noreferrer">Simple Maps</a>
        </footer>
      </body>
    </html>
  );
}
