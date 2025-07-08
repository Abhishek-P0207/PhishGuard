import { chromium, Browser, Page, Request, Response } from 'playwright'

export interface NetworkRequest {
  url: string
  method: string
  headers: Record<string, string>
  postData?: string
  timestamp: number
}

export interface NetworkResponse {
  url: string
  status: number
  headers: Record<string, string>
  body?: string
  timestamp: number
}

export interface FormData {
  action: string
  method: string
  inputs: Array<{
    name: string
    type: string
    value: string
    required: boolean
  }>
}

export interface ScreenshotData {
  url: string
  timestamp: number
  path: string
  description: string
}

export interface RedirectData {
  from: string
  to: string
  timestamp: number
  statusCode: number
}

export interface SandboxResult {
  maliciousActivity: boolean
  description: string
  indicators: Array<{
    type: string
    description: string
    severity: "low" | "medium" | "high"
  }>
  analysis: {
    renderedHtml: string
    networkRequests: NetworkRequest[]
    networkResponses: NetworkResponse[]
    forms: FormData[]
    screenshots: ScreenshotData[]
    redirects: RedirectData[]
    finalUrl: string
    title: string
    metaTags: Record<string, string>
    scripts: string[]
    externalResources: string[]
    cookies: Array<{
      name: string
      value: string
      domain: string
      path: string
    }>
    localStorage: Record<string, string>
    sessionStorage: Record<string, string>
  }
}

export class SandboxAnalyzer {
  private browser: Browser | null = null
  private page: Page | null = null
  private networkRequests: NetworkRequest[] = []
  private networkResponses: NetworkResponse[] = []
  private screenshots: ScreenshotData[] = []
  private redirects: RedirectData[] = []
  private forms: FormData[] = []
  private baseUrl: string = ''

  async analyzeSite(url: string): Promise<SandboxResult> {
    try {
      await this.initializeBrowser()
      await this.setupPage()
      await this.navigateAndAnalyze(url)
      
      const result = await this.generateAnalysisResult()
      await this.cleanup()
      
      return result
    } catch (error) {
      await this.cleanup()
      throw error
    }
  }

  private async initializeBrowser(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })
  }

  private async setupPage(): Promise<void> {
    if (!this.browser) throw new Error('Browser not initialized')
    
    this.page = await this.browser.newPage()
    
    // Set up network monitoring
    this.page.on('request', (request: Request) => {
      this.networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData() || undefined,
        timestamp: Date.now()
      })
    })

    this.page.on('response', (response: Response) => {
      this.networkResponses.push({
        url: response.url(),
        status: response.status(),
        headers: response.headers(),
        body: undefined, // We'll capture body separately if needed
        timestamp: Date.now()
      })
    })

    // Set up redirect monitoring
    this.page.on('framenavigated', (frame) => {
      if (frame === this.page?.mainFrame()) {
        const currentUrl = frame.url()
        if (this.baseUrl && currentUrl !== this.baseUrl) {
          this.redirects.push({
            from: this.baseUrl,
            to: currentUrl,
            timestamp: Date.now(),
            statusCode: 200 // We'll get this from response if available
          })
          this.baseUrl = currentUrl
        }
      }
    })

    // Set user agent to avoid detection
    await this.page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })

    // Set viewport
    await this.page.setViewportSize({ width: 1920, height: 1080 })
  }

  private async navigateAndAnalyze(url: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized')
    
    this.baseUrl = url
    
    // Navigate to the URL
    await this.page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    })

    // Take initial screenshot
    await this.captureScreenshot('initial_load', 'Initial page load')

    // Extract forms before interaction
    await this.extractForms()

    // Interact with forms and buttons
    await this.interactWithPage()

    // Wait for any dynamic content to load
    await this.page.waitForTimeout(2000)

    // Take final screenshot
    await this.captureScreenshot('final_state', 'Final page state after interactions')
  }

  private async extractForms(): Promise<void> {
    if (!this.page) return

    this.forms = await this.page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form'))
      return forms.map(form => ({
        action: form.action || '',
        method: form.method || 'GET',
        inputs: Array.from(form.querySelectorAll('input, textarea, select')).map(input => ({
          name: (input as HTMLInputElement).name || '',
          type: (input as HTMLInputElement).type || 'text',
          value: (input as HTMLInputElement).value || '',
          required: (input as HTMLInputElement).required || false
        }))
      }))
    })
  }

  private async interactWithPage(): Promise<void> {
    if (!this.page) return

    try {
      // Click buttons that look safe (not submit buttons in forms)
      await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a[href="#"]'))
        buttons.forEach((button, index) => {
          // Skip buttons that are inside forms to avoid form submissions
          if (button.closest('form')) return
          
          // Add a small delay between clicks
          setTimeout(() => {
            try {
              (button as HTMLElement).click()
            } catch (e) {
              // Ignore click errors
            }
          }, index * 100)
        })
      })

      // Fill and submit forms with safe test data
      await this.fillAndSubmitForms()

    } catch (error) {
      console.log('Interaction error:', error)
    }
  }

  private async fillAndSubmitForms(): Promise<void> {
    if (!this.page) return

    await this.page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form'))
      forms.forEach((form, formIndex) => {
        const inputs = Array.from(form.querySelectorAll('input, textarea, select'))
        
        inputs.forEach((input) => {
          const inputElement = input as HTMLInputElement
          const type = inputElement.type.toLowerCase()
          
          // Fill with safe test data based on input type
          switch (type) {
            case 'text':
            case 'search':
              inputElement.value = 'test_input'
              break
            case 'email':
              inputElement.value = 'test@example.com'
              break
            case 'password':
              inputElement.value = 'testpassword123'
              break
            case 'tel':
              inputElement.value = '1234567890'
              break
            case 'url':
              inputElement.value = 'https://example.com'
              break
            case 'number':
              inputElement.value = '123'
              break
            case 'checkbox':
              inputElement.checked = true
              break
            case 'radio':
              if (inputElement.name) {
                const radios = document.querySelectorAll(`input[name="${inputElement.name}"]`)
                if (radios.length > 0) {
                  (radios[0] as HTMLInputElement).checked = true
                }
              }
              break
          }
        })

        // Submit form after a delay
        setTimeout(() => {
          try {
            form.submit()
          } catch (e) {
            // Ignore submit errors
          }
        }, formIndex * 500)
      })
    })
  }

  private async captureScreenshot(identifier: string, description: string): Promise<void> {
    if (!this.page) return

    try {
      const timestamp = Date.now()
      const filename = `screenshot_${identifier}_${timestamp}.png`
      const path = `./public/screenshots/${filename}`
      
      await this.page.screenshot({ 
        path,
        fullPage: true 
      })

      this.screenshots.push({
        url: this.page.url(),
        timestamp,
        path,
        description
      })
    } catch (error) {
      console.log('Screenshot error:', error)
    }
  }

  private async generateAnalysisResult(): Promise<SandboxResult> {
    if (!this.page) throw new Error('Page not initialized')

    const renderedHtml = await this.page.content()
    const finalUrl = this.page.url()
    const title = await this.page.title()

    // Extract meta tags
    const metaTags = await this.page.evaluate(() => {
      const metas = Array.from(document.querySelectorAll('meta'))
      const metaObj: Record<string, string> = {}
      metas.forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property') || ''
        const content = meta.getAttribute('content') || ''
        if (name && content) {
          metaObj[name] = content
        }
      })
      return metaObj
    })

    // Extract scripts
    const scripts = await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('script')).map(script => {
        return script.src || script.textContent || ''
      }).filter(src => src.length > 0)
    })

    // Extract external resources
    const externalResources = await this.page.evaluate(() => {
      const resources: string[] = []
      
      // CSS files
      document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.getAttribute('href')
        if (href) resources.push(href)
      })
      
      // Images
      document.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src')
        if (src) resources.push(src)
      })
      
      // Iframes
      document.querySelectorAll('iframe').forEach(iframe => {
        const src = iframe.getAttribute('src')
        if (src) resources.push(src)
      })
      
      return resources
    })

    // Extract cookies
    const cookies = await this.page.context().cookies()

    // Extract localStorage and sessionStorage
    const localStorage = await this.page.evaluate(() => {
      const storage: Record<string, string> = {}
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key) {
          storage[key] = window.localStorage.getItem(key) || ''
        }
      }
      return storage
    })

    const sessionStorage = await this.page.evaluate(() => {
      const storage: Record<string, string> = {}
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i)
        if (key) {
          storage[key] = window.sessionStorage.getItem(key) || ''
        }
      }
      return storage
    })

    // Analyze for malicious indicators
    const indicators = this.analyzeForMaliciousIndicators({
      renderedHtml,
      networkRequests: this.networkRequests,
      networkResponses: this.networkResponses,
      forms: this.forms,
      metaTags,
      scripts,
      externalResources,
      redirects: this.redirects
    })

    return {
      maliciousActivity: indicators.some(indicator => indicator.severity === 'high'),
      description: this.generateDescription(indicators),
      indicators,
      analysis: {
        renderedHtml,
        networkRequests: this.networkRequests,
        networkResponses: this.networkResponses,
        forms: this.forms,
        screenshots: this.screenshots,
        redirects: this.redirects,
        finalUrl,
        title,
        metaTags,
        scripts,
        externalResources,
        cookies,
        localStorage,
        sessionStorage
      }
    }
  }

  private analyzeForMaliciousIndicators(data: any): Array<{type: string, description: string, severity: "low" | "medium" | "high"}> {
    const indicators: Array<{type: string, description: string, severity: "low" | "medium" | "high"}> = []

    // Check for suspicious redirects
    if (data.redirects.length > 3) {
      indicators.push({
        type: 'excessive_redirects',
        description: `Multiple redirects detected (${data.redirects.length})`,
        severity: 'medium'
      })
    }

    // Check for suspicious external resources
    const suspiciousDomains = data.externalResources.filter((url: string) => {
      try {
        // Handle relative URLs and protocol-less URLs
        let fullUrl = url
        if (url.startsWith('//')) {
          fullUrl = 'https:' + url
        } else if (url.startsWith('/') || !url.includes('://')) {
          // Skip relative URLs as they're not external
          return false
        }
        
        const domain = new URL(fullUrl).hostname
        return domain.includes('suspicious') || domain.includes('malware') || domain.includes('phish')
      } catch (error) {
        // Skip invalid URLs
        console.warn(`Invalid URL detected: ${url}`)
        return false
      }
    })
    
    if (suspiciousDomains.length > 0) {
      indicators.push({
        type: 'suspicious_external_resources',
        description: `Suspicious external resources detected: ${suspiciousDomains.join(', ')}`,
        severity: 'high'
      })
    }

    // Check for form data collection
    if (data.forms.length > 0) {
      const sensitiveForms = data.forms.filter((form: FormData) => {
        return form.inputs.some(input => 
          input.name.toLowerCase().includes('password') ||
          input.name.toLowerCase().includes('credit') ||
          input.name.toLowerCase().includes('card') ||
          input.name.toLowerCase().includes('ssn') ||
          input.name.toLowerCase().includes('social')
        )
      })
      
      if (sensitiveForms.length > 0) {
        indicators.push({
          type: 'sensitive_data_collection',
          description: `Forms collecting sensitive data detected`,
          severity: 'high'
        })
      }
    }

    // Check for obfuscated JavaScript
    const obfuscatedScripts = data.scripts.filter((script: string) => {
      return script.includes('eval(') || 
             script.includes('document.write') ||
             script.includes('unescape(') ||
             script.includes('String.fromCharCode')
    })
    
    if (obfuscatedScripts.length > 0) {
      indicators.push({
        type: 'obfuscated_javascript',
        description: `Obfuscated JavaScript detected`,
        severity: 'medium'
      })
    }

    // Check for suspicious network requests
    const suspiciousRequests = data.networkRequests.filter((req: NetworkRequest) => {
      return req.url.includes('suspicious') || 
             req.url.includes('malware') ||
             req.url.includes('phish') ||
             req.method === 'POST' && req.url.includes('login')
    })
    
    if (suspiciousRequests.length > 0) {
      indicators.push({
        type: 'suspicious_network_requests',
        description: `Suspicious network requests detected`,
        severity: 'medium'
      })
    }

    return indicators
  }

  private generateDescription(indicators: Array<{type: string, description: string, severity: "low" | "medium" | "high"}>): string {
    if (indicators.length === 0) {
      return 'No suspicious activity detected during analysis.'
    }

    console.log(indicators)

    const highSeverity = indicators.filter(i => i.severity === 'high')
    const mediumSeverity = indicators.filter(i => i.severity === 'medium')
    const lowSeverity = indicators.filter(i => i.severity === 'low')

    let description = `Analysis detected ${indicators.length} potential security indicators: `
    
    if (highSeverity.length > 0) {
      description += `${highSeverity.length} high-risk, `
    }
    if (mediumSeverity.length > 0) {
      description += `${mediumSeverity.length} medium-risk, `
    }
    if (lowSeverity.length > 0) {
      description += `${lowSeverity.length} low-risk. `
    }

    description += 'Review detailed analysis for specific findings.'

    return description
  }

  private async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close()
      this.page = null
    }
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}
