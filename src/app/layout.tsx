import type { Metadata, Viewport } from 'next';
import './globals.css';
import { OrientationGuard } from '@/components/landscape/OrientationGuard';
import { SITE } from '@/data/series';

export const metadata: Metadata = {
  title: `${SITE.name}  ${SITE.tagline}`,
  description: SITE.about.en,
  openGraph: {
    title: `${SITE.name}  ${SITE.tagline}`,
    description: SITE.about.en,
    type: 'website'
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg'
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <OrientationGuard />
      </body>
    </html>
  );
}
