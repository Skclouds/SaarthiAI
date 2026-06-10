import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { LOGO_SRC } from '@/lib/brand';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SaarthiAI',
    template: '%s | SaarthiAI',
  },
  description: 'AI-powered customer support platform',
  icons: {
    icon: [{ url: LOGO_SRC, type: 'image/png' }],
    shortcut: [{ url: LOGO_SRC, type: 'image/png' }],
    apple: [{ url: LOGO_SRC, type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={LOGO_SRC} type="image/png" sizes="any" />
        <link rel="shortcut icon" href={LOGO_SRC} type="image/png" />
        <link rel="apple-touch-icon" href={LOGO_SRC} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
