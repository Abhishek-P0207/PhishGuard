import type { AnalysisResult, DetectionStage } from "@/types/analysis"
import { DatabaseChecker } from "./database-checker"
import { URLStructureAnalyzer } from "./url-structure-analyzer"
import { SandboxAnalyzer } from "./sandbox-analyzer"
import { CredentialHarvestingDetector } from "./credential-harvesting-detector"

export class DetectionService {
  private databaseChecker = new DatabaseChecker()
  private urlAnalyzer = new URLStructureAnalyzer()
  private sandboxAnalyzer = new SandboxAnalyzer()
  private credentialDetector = new CredentialHarvestingDetector()

  async analyzeURL(url: string, onStageUpdate: (stage: number) => void): Promise<AnalysisResult> {
    const startTime = Date.now()
    const stages: DetectionStage[] = []
    let overallRisk = "low"
    let riskScore = 0
    const threatIndicators: any[] = []

    // Stage 1: Database Check
    onStageUpdate(0)
    await this.delay(1500)
    const dbResult = await this.databaseChecker.checkURL(url)
    stages.push({
      name: "Database Check",
      result: dbResult.isMalicious ? "high" : "clean",
      description: dbResult.description,
      timestamp: new Date().toLocaleTimeString(),
    })

    if (dbResult.isMalicious) {
      overallRisk = "high"
      riskScore = 95
      threatIndicators.push({
        type: "Known Malicious URL",
        description: "URL found in threat database",
        severity: "high",
      })
    } else {
      // Stage 2: URL Structure Analysis
      onStageUpdate(1)
      await this.delay(1200)
      const structureResult = await this.urlAnalyzer.analyzeStructure(url)
      stages.push({
        name: "URL Structure Analysis",
        result: structureResult.suspicious ? "medium" : "clean",
        description: structureResult.description,
        timestamp: new Date().toLocaleTimeString(),
      })

      if (structureResult.suspicious) {
        overallRisk = "medium"
        riskScore = Math.max(riskScore, 60)
        threatIndicators.push(...structureResult.indicators)
      }

      // Stage 3: Sandbox Analysis
      onStageUpdate(2)
      await this.delay(2000)
      const sandboxResult = await this.sandboxAnalyzer.analyzeSite(url)
      stages.push({
        name: "Sandbox Analysis",
        result: sandboxResult.maliciousActivity ? "high" : "clean",
        description: sandboxResult.description,
        timestamp: new Date().toLocaleTimeString(),
      })

      if (sandboxResult.maliciousActivity) {
        overallRisk = "high"
        riskScore = Math.max(riskScore, 85)
        threatIndicators.push(...sandboxResult.indicators)
      }

      // Stage 4: Credential Harvesting Test
      onStageUpdate(3)
      await this.delay(1800)
      const credentialResult = await this.credentialDetector.testCredentialHarvesting(url)
      stages.push({
        name: "Credential Harvesting Test",
        result: credentialResult.isPhishing ? "high" : "clean",
        description: credentialResult.description,
        timestamp: new Date().toLocaleTimeString(),
      })

      if (credentialResult.isPhishing) {
        overallRisk = "high"
        riskScore = Math.max(riskScore, 90)
        threatIndicators.push(...credentialResult.indicators)
      }
    }

    // Final stage
    onStageUpdate(4)
    await this.delay(500)

    const analysisTime = ((Date.now() - startTime) / 1000).toFixed(1)

    return {
      url,
      overallRisk: overallRisk as "low" | "medium" | "high",
      riskScore: Math.max(riskScore, 15), // Minimum risk score
      summary: this.generateSummary(overallRisk, stages),
      stages,
      threatIndicators,
      recommendations: this.generateRecommendations(overallRisk, threatIndicators),
      analysisTime,
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private generateSummary(risk: string, stages: DetectionStage[]): string {
    const cleanStages = stages.filter((s) => s.result === "clean").length
    const totalStages = stages.length

    switch (risk) {
      case "high":
        return "This URL poses a significant security threat and should be avoided."
      case "medium":
        return "This URL shows suspicious characteristics and should be approached with caution."
      default:
        return `This URL appears to be safe. ${cleanStages}/${totalStages} security checks passed.`
    }
  }

  private generateRecommendations(risk: string, indicators: any[]): string[] {
    const recommendations = []

    if (risk === "high") {
      recommendations.push("Do not visit this URL or enter any personal information")
      recommendations.push("Report this URL to your security team or IT department")
      recommendations.push("Run a full antivirus scan if you have already visited this site")
    } else if (risk === "medium") {
      recommendations.push("Exercise caution when visiting this URL")
      recommendations.push("Verify the legitimacy of the website through official channels")
      recommendations.push("Avoid entering sensitive information unless absolutely necessary")
    } else {
      recommendations.push("This URL appears safe, but always remain vigilant online")
      recommendations.push("Keep your browser and security software up to date")
      recommendations.push("Be cautious of any unexpected downloads or pop-ups")
    }

    return recommendations
  }
}
