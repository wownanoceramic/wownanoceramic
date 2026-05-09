export const metadata = {
  title: 'WOW NanoCeramic Restore & Protect',
  description: 'Tratament ceramic pentru plastic auto',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  )
}