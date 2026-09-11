import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'GYM OS — The Operating System for Independent Gyms',
  description: 'A commercial-grade multi-tenant operating system for independent fitness centers, strength facilities, and health clubs.',
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6.5 6.5 11 11'%3E%3C/path%3E%3Cpath d='m21 21-1-1'%3E%3C/path%3E%3Cpath d='m3 3 1 1'%3E%3C/path%3E%3Cpath d='m18 22 4-4'%3E%3C/path%3E%3Cpath d='m2 6 4-4'%3E%3C/path%3E%3Cpath d='m3 10 7-7'%3E%3C/path%3E%3Cpath d='m14 21 7-7'%3E%3C/path%3E%3C/svg%3E",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-zinc-100 antialiased selection:bg-brand-500/30 selection:text-brand-300 font-sans min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
