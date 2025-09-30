"use client"

import { useState } from "react"
import { ImageUploadModal } from "@/src/components/ImageUploadModal"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import { InsuranceContractForm } from "@/src/components/insurance-contract-form"
import { VehicleInfoForm } from "@/src/components/vehicle-info-form"
import { PersonalInfoForm } from "@/src/components/personal-info-form"
import { useSessionStorage } from "@/src/hooks/use-session-storage"

interface StepFormProps {
  step: number
}

export function StepForm({ step }: StepFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showAutoFillNotice, setShowAutoFillNotice] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const { saveAllData, enableAutoFill } = useSessionStorage()

  // 画像アップロード後のAPIモックPOST
  const handleImageUpload = async (file: File) => {
    // 実際のアップロードはモック
    await new Promise(res => setTimeout(res, 1000));
    // モックAPI: /api/form-data
    const res = await fetch("/api/form-data", {
      method: "POST",
      body: file,
    });
    console.log(res);
    // レスポンスとしてresponse.jsonを返す
    saveAllData(await res.json());
    enableAutoFill();
    setShowAutoFillNotice(true);
  };

  const fetchAndAutoFillForm = async () => {
    setShowImageModal(true);
  }

  // バリデーション関数（段階的表示対応版）
  const validateStepData = (stepData: any, step: number) => {
    const errors: string[] = []
    
    if (step !== 1) {
      // ステップ1以外は従来のバリデーション
      const filledFields = Object.keys(stepData).filter(key => {
        const value = stepData[key]
        if (typeof value === 'boolean') return true
        return value && value !== "" && value !== "ご選択ください"
      })
      
      const allFields = Object.keys(stepData)
      const emptyFields = allFields.filter(key => {
        const value = stepData[key]
        if (typeof value === 'boolean') return false
        return !value || value === "" || value === "ご選択ください"
      })
      
      if (filledFields.length === 0) {
        errors.push("すべての項目に回答してください。")
      } else if (emptyFields.length > 0) {
        errors.push("すべての項目に回答してください。")
      }
    } else {
      // ステップ1は段階的表示のため、基本的なデータ存在確認のみ
      const hasAnyData = Object.keys(stepData).some(key => {
        const value = stepData[key]
        if (typeof value === "boolean") return value
        return value && value !== "" && value !== "ご選択ください"
      })
      
      if (!hasAnyData) {
        errors.push("項目に回答してから次へ進んでください。")
      }
    }
    
    return errors
  }

  const handleNext = (stepData: any) => {
    // バリデーション実行
    const errors = validateStepData(stepData, step)
    setValidationErrors(errors)
    
    if (errors.length > 0) {
      // エラーがある場合は処理を停止
      return
    }
    
    
    if (step < 3) {
      // 次のステップへ遷移
      router.push(`/step/${step + 1}`)
    }
  }

  const handleSubmit = (stepData: any) => {
    // バリデーション実行
    const errors = validateStepData(stepData, step)
    setValidationErrors(errors)
    
    if (errors.length > 0) {
      // エラーがある場合は処理を停止
      return
    }
    
    alert("お申し込みありがとうございます。確認メールをお送りいたします。")
    
    // メインページに戻る
    router.push("/")
  }

  const handlePrevious = () => {
    if (step > 1) {
      router.push(`/step/${step - 1}`)
    }
  }

  const handleFormChange = () => {
    // フォームが変更されたらバリデーションエラーをクリア
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }
  const renderForm = () => {
    switch (step) {
      case 1:
        return <InsuranceContractForm  onNext={handleNext} />
      case 2:
        return (
          <VehicleInfoForm 
            onNext={handleNext} 
            onPrevious={handlePrevious}
          />
        )
      case 3:
        return (
          <PersonalInfoForm 
            onSubmit={handleSubmit} 
            onPrevious={handlePrevious}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Button
          onClick={fetchAndAutoFillForm}
          disabled={isLoading}
          variant="outline"
          className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
        >
          {isLoading ? "データ取得中..." : "APIから追加データを取得"}
        </Button>
      </div>
      <ImageUploadModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        onUpload={handleImageUpload}
      />

      {showAutoFillNotice && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            ✅ ステップ{step}にAPIからの追加データが入力されました！
          </AlertDescription>
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">
            <div className="space-y-1">
              {validationErrors.map((error, index) => (
                <div key={index}>❌ {error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {renderForm()}
    </div>
  )
}
