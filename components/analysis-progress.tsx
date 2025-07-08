import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock } from "lucide-react"

interface AnalysisProgressProps {
  currentStage: number
}

const stages = [
  { name: "Database Check", description: "Checking against known malicious URLs" },
  { name: "URL Structure", description: "Analyzing URL patterns and structure" },
  { name: "Sandbox Analysis", description: "Testing website in secure environment" },
  { name: "Credential Test", description: "Detecting credential harvesting attempts" },
  { name: "Final Report", description: "Generating comprehensive security report" },
]

export function AnalysisProgress({ currentStage }: AnalysisProgressProps) {
  const progress = ((currentStage + 1) / stages.length) * 100

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-400" />
          Analysis in Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-3">
          {stages.map((stage, index) => (
            <div key={index} className="flex items-center gap-3">
              {index < currentStage ? (
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
              ) : index === currentStage ? (
                <div className="h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              ) : (
                <div className="h-5 w-5 border-2 border-slate-600 rounded-full flex-shrink-0" />
              )}
              <div>
                <div className={`font-medium ${index <= currentStage ? "text-white" : "text-slate-500"}`}>
                  {stage.name}
                </div>
                <div className="text-sm text-slate-400">{stage.description}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
