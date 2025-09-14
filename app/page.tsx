"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  const [isAutoFilled, setIsAutoFilled] = useState(false)
  const [showCompletionNotice, setShowCompletionNotice] = useState(false)

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const fetchAndAutoFillForm = async () => {
    try {
      console.log("[v0] Starting auto-fill process")
      // Call the actual API endpoint
      const response = await fetch("/api/form-data")
      const responseData = await response.json()
      console.log("[v0] API response received:", responseData)

      const autoFilledData: FormData = {
        insuranceContract: {},
        vehicleInfo: {},
        personalInfo: {},
      }

      // Process each item in the response data
      responseData.forEach((item: any, index: number) => {
        console.log(`[v0] Processing item ${index}:`, item)

        // Handle radio buttons
        if (item.radio && item.radio.name && item.radio.value) {
          const fieldName = item.radio.name
          const value = item.radio.value
          console.log(`[v0] Setting radio field ${fieldName} to ${value}`)

          // Map to appropriate form section based on field name patterns
          if (
            fieldName.includes("radPreContInsco") ||
            fieldName.includes("radPrevcontyear") ||
            fieldName.includes("sltAcdtapply")
          ) {
            autoFilledData.insuranceContract[fieldName] = value
          } else if (fieldName.includes("radBvehtyp") || fieldName.includes("radCommuse")) {
            autoFilledData.vehicleInfo[fieldName] = value
          } else if (fieldName.includes("radBinslbzkc")) {
            autoFilledData.personalInfo[fieldName] = value
          }
        }

        // Handle select dropdowns
        if (item.select && item.select.selects) {
          item.select.selects.forEach((select: any) => {
            const fieldName = select.name || select.id
            const value = select.value
            console.log(`[v0] Setting select field ${fieldName} to ${value}`)

            // Map to appropriate form section based on field name patterns
            if (
              fieldName.includes("sltOcrdatey") ||
              fieldName.includes("sltOcrdatem") ||
              fieldName.includes("sltOcrdated") ||
              fieldName.includes("sltOccdatey") ||
              fieldName.includes("sltOccdatem") ||
              fieldName.includes("sltOccdated") ||
              fieldName.includes("sltBprefcl")
            ) {
              autoFilledData.insuranceContract[fieldName] = value
            } else if (fieldName.includes("lstRgstdtegy") || fieldName.includes("lstRgstdtem")) {
              autoFilledData.vehicleInfo[fieldName] = value
            } else if (
              fieldName.includes("sltBinslbdoby") ||
              fieldName.includes("sltBinslbdobm") ||
              fieldName.includes("sltBinslbdobd")
            ) {
              autoFilledData.personalInfo[fieldName] = value
            }
          })
        }
      })

      console.log("[v0] Final auto-filled data:", autoFilledData)
      setFormData(autoFilledData)
      setIsAutoFilled(true)

      // Show completion notice after auto-fill
      setTimeout(() => {
        setShowCompletionNotice(true)
      }, 1000)
    } catch (error) {
      console.error("Failed to fetch form data:", error)
      alert("APIからのデータ取得に失敗しました。")
    }
  }

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

          <div className="mt-4 space-y-4">
            <Button
              onClick={fetchAndAutoFillForm}
              variant="outline"
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              APIからデータを取得してフォームを自動入力
            </Button>

            {showCompletionNotice && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  ✅ フォーム入力が完了しました！APIからのデータで自動入力されています。
                </AlertDescription>
              </Alert>
            )}
          </div>
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
