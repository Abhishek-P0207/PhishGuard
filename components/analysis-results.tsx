import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Code,
  SpaceIcon as Sandbox,
  Key,
} from "lucide-react"
import type { AnalysisResult } from "@/types/analysis"

interface AnalysisResultsProps {
  results: AnalysisResult
}

export function AnalysisResults({ results }: AnalysisResultsProps) {
  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low":
        return "text-green-400 border-green-400"
      case "medium":
        return "text-yellow-400 border-yellow-400"
      case "high":
        return "text-red-400 border-red-400"
      default:
        return "text-slate-400 border-slate-400"
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low":
        return <CheckCircle className="h-5 w-5" />
      case "medium":
        return <AlertTriangle className="h-5 w-5" />
      case "high":
        return <XCircle className="h-5 w-5" />
      default:
        return <Shield className="h-5 w-5" />
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-400" />
            Analysis Results
          </CardTitle>
          <Badge variant="outline" className={getRiskColor(results.overallRisk)}>
            {getRiskIcon(results.overallRisk)}
            {results.overallRisk.toUpperCase()} RISK
          </Badge>
        </div>
        <div className="text-slate-400">
          URL: <span className="text-white font-mono">{results.url}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Alert
            className={`border-l-4 ${
              results.overallRisk === "high"
                ? "border-l-red-400 bg-red-900/20"
                : results.overallRisk === "medium"
                  ? "border-l-yellow-400 bg-yellow-900/20"
                  : "border-l-green-400 bg-green-900/20"
            }`}
          >
            <AlertDescription className="text-white">
              <strong>Security Assessment:</strong> {results.summary}
            </AlertDescription>
          </Alert>
        </div>

        <Tabs defaultValue="stages" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700">
            <TabsTrigger value="stages" className="text-slate-300 data-[state=active]:text-white">
              Detection Stages
            </TabsTrigger>
            <TabsTrigger value="details" className="text-slate-300 data-[state=active]:text-white">
              Technical Details
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="text-slate-300 data-[state=active]:text-white">
              Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stages" className="space-y-4">
            {results.stages.map((stage, index) => (
              <Card key={index} className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {stage.name === "Database Check" && <Database className="h-5 w-5 text-blue-400" />}
                      {stage.name === "URL Structure Analysis" && <Code className="h-5 w-5 text-purple-400" />}
                      {stage.name === "Sandbox Analysis" && <Sandbox className="h-5 w-5 text-orange-400" />}
                      {stage.name === "Credential Harvesting Test" && <Key className="h-5 w-5 text-red-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{stage.name}</h4>
                        <Badge variant="outline" className={getRiskColor(stage.result)}>
                          {stage.result.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-slate-300 text-sm mb-2">{stage.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        Completed at {stage.timestamp}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-300">Risk Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{results.riskScore}/100</div>
                  <div className="text-xs text-slate-400">Security Risk Assessment</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-300">Analysis Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{results.analysisTime}s</div>
                  <div className="text-xs text-slate-400">Total Processing Time</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Threat Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.threatIndicators.map((indicator, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          indicator.severity === "high"
                            ? "bg-red-400"
                            : indicator.severity === "medium"
                              ? "bg-yellow-400"
                              : "bg-green-400"
                        }`}
                      />
                      <span className="text-slate-300">{indicator.type}:</span>
                      <span className="text-white">{indicator.description}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="space-y-3">
              {results.recommendations.map((rec, index) => (
                <Alert key={index} className="border-slate-600 bg-slate-700/30">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-slate-300">{rec}</AlertDescription>
                </Alert>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
