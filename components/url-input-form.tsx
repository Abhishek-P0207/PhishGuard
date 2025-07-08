"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Shield } from "lucide-react"

interface URLInputFormProps {
  onAnalyze: (url: string) => void
  isAnalyzing: boolean
}

export function URLInputForm({ onAnalyze, isAnalyzing }: URLInputFormProps) {
  const [url, setUrl] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onAnalyze(url.trim())
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
          <Shield className="h-6 w-6 text-blue-400" />
          URL Security Analysis
        </CardTitle>
        <p className="text-slate-400">Enter a URL to perform comprehensive phishing and malware detection</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              disabled={isAnalyzing}
              required
            />
            <Button
              type="submit"
              disabled={isAnalyzing || !url.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {isAnalyzing ? (
                <>Analyzing...</>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
