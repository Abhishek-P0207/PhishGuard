export function Footer() {
  return (
    <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">PhishGuard Pro</h3>
            <p className="text-slate-400 text-sm">
              Advanced cybersecurity solutions for threat detection and prevention.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>URL Analysis</li>
              <li>Threat Detection</li>
              <li>Sandbox Testing</li>
              <li>Real-time Monitoring</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Documentation</li>
              <li>API Reference</li>
              <li>Security Blog</li>
              <li>Best Practices</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Contact Us</li>
              <li>Help Center</li>
              <li>Status Page</li>
              <li>Report Issue</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400 text-sm">
          © 2024 PhishGuard Pro. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
