"use client"

import { useState } from "react"
import { URLInputForm } from "./url-input-form"
import { AnalysisProgress } from "./analysis-progress"
import { AnalysisResults } from "./analysis-results"
import type { AnalysisResult } from "@/types/analysis"

export function URLAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentStage, setCurrentStage] = useState(0)
  const [results, setResults] = useState<AnalysisResult | null>(null)

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true)
    setCurrentStage(0)
    setResults(null)

    try {
      // Simulate progress updates since we can't get real-time updates from the API
      const progressInterval = setInterval(() => {
        setCurrentStage(prev => {
          if (prev < 4) return prev + 1
          clearInterval(progressInterval)
          return prev
        })
      }, 1000)

      const response = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const analysisResults = await response.json()
      setResults(analysisResults)
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <URLInputForm onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

      {isAnalyzing && <AnalysisProgress currentStage={currentStage} />}

      {results && <AnalysisResults results={results} />}
    </div>
  )
}
