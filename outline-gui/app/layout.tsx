import './globals.css'
import QueryProvider from '../components/QueryProvider'
import { ThemeProvider } from '../contexts/ThemeContext'

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
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}