import type { Metadata } from "next"
import "@/styles/globals.css"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import { Inter, JetBrains_Mono, Poppins } from "next/font/google"
import Providers from "@/components/layout/providers"
import dynamic from "next/dynamic"
import PageWrapper from "@/components/layout/page-wrapper"

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" })
const jetbrains = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono" })
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"], display: "swap", variable: "--font-poppins" })
const ChatWidget = dynamic(() => import("@/components/chat/chat-widget"), { ssr: false, loading: () => null })

export const metadata: Metadata = {
  title: "ALSS — Advanced Link Security Scanner",
  description: "Modern, AI-powered security scanning platform.",
  themeColor: "#0a0a0a",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrains.variable} ${poppins.variable} min-h-screen bg-background text-foreground font-sans`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:outline-none focus:ring-2 focus:ring-ring">Skip to main content</a>
        <Providers>
          <Navbar />
          <main id="main" className="custom-container py-10">
            <PageWrapper>
              {children}
            </PageWrapper>
          </main>
          {/** Lazy-load chat to reduce initial JS */}
          <ChatWidget />
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
