"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { InsuranceContractForm } from "@/components/insurance-contract-form"
import { VehicleInfoForm } from "@/components/vehicle-info-form"
import { PersonalInfoForm } from "@/components/personal-info-form"
import type { FormData } from "@/types/form-data"

export default function CarInsuranceForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    insuranceContract: {},
    vehicleInfo: {},
    personalInfo: {},
  })

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const handleNext = (stepData: any) => {
    const stepKey = currentStep === 1 ? "insuranceContract" : currentStep === 2 ? "vehicleInfo" : "personalInfo"
    setFormData((prev) => ({
      ...prev,
      [stepKey]: stepData,
    }))

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = (stepData: any) => {
    const finalData = {
      ...formData,
      personalInfo: stepData,
    }
    console.log("Form submitted:", finalData)
    alert("お申し込みありがとうございます。確認メールをお送りいたします。")
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "現在契約中の保険会社情報"
      case 2:
        return "車両情報"
      case 3:
        return "個人情報・契約者情報"
      default:
        return ""
    }
  }

  const renderCurrentForm = () => {
    switch (currentStep) {
      case 1:
        return <InsuranceContractForm initialData={formData.insuranceContract} onNext={handleNext} />
      case 2:
        return <VehicleInfoForm initialData={formData.vehicleInfo} onNext={handleNext} onPrevious={handlePrevious} />
      case 3:
        return (
          <PersonalInfoForm initialData={formData.personalInfo} onSubmit={handleSubmit} onPrevious={handlePrevious} />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">自動車保険お見積もり</h1>
          <p className="text-gray-600">簡単3ステップでお見積もりを取得できます</p>
          <p className="text-sm text-gray-500 mt-2">※ グレーアウトされている項目は現在無効化されています</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              ステップ {currentStep} / {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-700">{Math.round(progress)}% 完了</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle className="text-xl text-blue-900">{getStepTitle()}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">{renderCurrentForm()}</CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>お客様の個人情報は適切に保護されます</p>
        </div>
      </div>
    </div>
  )
}
