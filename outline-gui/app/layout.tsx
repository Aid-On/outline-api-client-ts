import './globals.css'
import QueryProvider from '../components/QueryProvider'

export const metadata = {
  title: 'Outline GUI',
  description: 'Outline API Client GUI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}