import { URLAnalyzer } from "@/components/url-analyzer"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            PhishGuard <span className="text-blue-400">Pro</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Advanced multi-stage phishing detection system with real-time threat analysis, URL structure validation, and
            credential harvesting detection.
          </p>
        </div>
        <URLAnalyzer />
      </main>
      <Footer />
    </div>
  )
}
