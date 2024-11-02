import './globals.css'

import type { Metadata } from 'next'
import { Inter, Roboto } from 'next/font/google'
import { ThemeProvider } from 'next-themes'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-roboto',
})

export const metadata: Metadata = {
  title: 'CSN :: Júpiter Finance',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      className={`${inter.variable} ${roboto.variable} font-sans`}
      suppressHydrationWarning
      lang="pt-BR"
    >
      <body className="antialiased">
        <ThemeProvider
          storageKey="@csn:jupiter:theme"
          defaultTheme="dark"
          attribute="class"
          disableTransitionOnChange
          enableSystem
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
