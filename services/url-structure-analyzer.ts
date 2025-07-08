export interface URLStructureResult {
  suspicious: boolean
  description: string
  indicators: Array<{
    type: string
    description: string
    severity: "low" | "medium" | "high"
  }>
}

export class URLStructureAnalyzer {
  private suspiciousPatterns = [
    {
      pattern: /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/,
      description: "Uses IP address instead of domain",
      severity: "medium" as const,
    },
    {
      pattern: /[a-z]+-[a-z]+-[a-z]+\.(tk|ml|ga|cf)$/i,
      description: "Suspicious free domain extension",
      severity: "medium" as const,
    },
    { pattern: /[a-z]{20,}/i, description: "Unusually long domain name", severity: "low" as const },
    {
      pattern: /paypal|amazon|google|microsoft|apple/,
      description: "Potential brand impersonation",
      severity: "high" as const,
    },
    {
      pattern: /secure|login|verify|update|confirm/i,
      description: "Common phishing keywords",
      severity: "medium" as const,
    },
    { pattern: /[0-9]{4,}/, description: "Contains suspicious number sequences", severity: "low" as const },
  ]

  async analyzeStructure(url: string): Promise<URLStructureResult> {

    const indicators: URLStructureResult["indicators"] = []
    let maxSeverity: "low" | "medium" | "high" = "low"

    // Check URL against suspicious patterns
    for (const { pattern, description, severity } of this.suspiciousPatterns) {
      if (pattern.test(url)) {
        indicators.push({
          type: "Suspicious Pattern",
          description,
          severity,
        })

        if (severity === "high" || (severity === "medium" && maxSeverity === "low")) {
          maxSeverity = severity
        }
      }
    }

    // Check URL length
    if (url.length > 100) {
      indicators.push({
        type: "URL Length",
        description: "Unusually long URL (potential obfuscation)",
        severity: "low",
      })
    }

    // Check for URL shorteners
    const shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly"]
    const domain = this.extractDomain(url)
    if (shorteners.some((shortener) => domain.includes(shortener))) {
      indicators.push({
        type: "URL Shortener",
        description: "Uses URL shortening service (potential redirect)",
        severity: "medium",
      })
      maxSeverity = "medium"
    }

    // Check for suspicious subdomains
    const subdomainCount = domain.split(".").length - 2
    if (subdomainCount > 2) {
      indicators.push({
        type: "Subdomain Structure",
        description: "Multiple subdomains detected",
        severity: "low",
      })
    }

    // Check if the Font varies
    const fontVariation = await this.checkFontVariation(url)
    if (fontVariation) {
      indicators.push({
        type: "Font Variation",
        description: "Font variation detected",
        severity: "medium",
      })
    }

    const suspicious = indicators.length > 0 && maxSeverity !== "low"

    return {
      suspicious,
      description: suspicious
        ? `Found ${indicators.length} suspicious URL characteristics`
        : "URL structure appears normal with no suspicious patterns detected",
      indicators,
    }
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.toLowerCase()
    } catch {
      return url.toLowerCase()
    }
  }

  private async checkFontVariation(url: string): Promise<boolean> {
    const domain = this.extractDomain(url);
    return /^x[a-z]-/.test(domain);
  }
}
