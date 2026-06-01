import CookieBanner from '@/components/CookieBanner'

export const metadata = {
  title: 'WOW NanoCeramic Restore & Protect',
  description: 'Tratament ceramic pentru plastic auto',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    images: [
      {
        url: 'https://www.wownanoceramic.ro/og-image.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
      },
    ],
    siteName: 'WOW NanoCeramic',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro">
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}