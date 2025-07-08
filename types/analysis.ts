export interface DetectionStage {
  name: string
  result: "clean" | "low" | "medium" | "high"
  description: string
  timestamp: string
}

export interface ThreatIndicator {
  type: string
  description: string
  severity: "low" | "medium" | "high"
}

export interface AnalysisResult {
  url: string
  overallRisk: "low" | "medium" | "high"
  riskScore: number
  summary: string
  stages: DetectionStage[]
  threatIndicators: ThreatIndicator[]
  recommendations: string[]
  analysisTime: string
}
