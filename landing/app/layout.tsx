import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOTTURA AI — Video to PDF Notes",
  description: "Transform any video lesson into structured, readable PDF notes. Works on paid courses, YouTube, lectures — anything.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
