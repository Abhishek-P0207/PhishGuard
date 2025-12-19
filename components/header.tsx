import { Shield, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">PhishGuard</span>
          </div>
          {/* <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-slate-300 hover:text-white transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">
              Reports
            </a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">
              API
            </a>
            <Button
              variant="outline"
              className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white bg-transparent"
            >
              Sign In
            </Button>
          </nav> */}
          <Button variant="ghost" size="icon" className="md:hidden text-white">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  )
}
