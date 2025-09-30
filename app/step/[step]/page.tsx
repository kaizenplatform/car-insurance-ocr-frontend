"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Progress } from "@/src/components/ui/progress"
import { StepForm } from "@/src/components/step-form"

const STEP_TITLES = {
  1: "現在契約中の保険会社情報",
  2: "車両情報",  
  3: "個人情報・契約者情報"
} as const

export default function StepPage() {
  const params = useParams()
  const step = Number(params.step)
  
  if (step < 1 || step > 3) {
    return <div>無効なステップです</div>
  }

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">自動車保険お見積もり</h1>
          <p className="text-gray-600">簡単3ステップでお見積もりを取得できます</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              ステップ {step} / {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-700">{Math.round(progress)}% 完了</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle className="text-xl text-blue-900 my-2">
              {STEP_TITLES[step as keyof typeof STEP_TITLES]}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 min-h-0">
            <StepForm step={step} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
