"use client"

import { useState, useEffect } from "react"
import { ImageUploadModal } from "@/src/components/ImageUploadModal"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import { useSessionStorage } from "@/src/hooks/use-session-storage"
import page1 from "@/src/data/page1.json";
import page2 from "@/src/data/page2.json";
import page3 from "@/src/data/page3.json";
import { StepFormContent } from "./StepFormContent"

interface StepFormProps {
  step: number
  enableAutoFillDelay?: boolean
}

export function StepForm({ step, enableAutoFillDelay = true }: StepFormProps) {
    // step:1の時に初回レンダリングでセッションをクリア

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showAutoFillNotice, setShowAutoFillNotice] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const { saveAllData, enableAutoFill, clearSessionData } = useSessionStorage()

  useEffect(() => {
    if (step === 1) {
      clearSessionData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // 画像アップロード後のAPI POST（FormDataで送信）
  const handleImageUpload = async (file: File) => {
    await new Promise(res => setTimeout(res, 1000));
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/form-data", {
      method: "POST",
      body: formData,
    });
    console.log(res);
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

  const renderForm = () => {
    switch (step) {
      case 1:
        return <StepFormContent mainData={page1} stepNumber={1} onNext={handleNext} enableAutoFillDelay={enableAutoFillDelay} />
      case 2:
        return (
          <StepFormContent
            mainData={page2}
            stepNumber={2}
            onNext={handleNext}
            onPrevious={handlePrevious}
            enableAutoFillDelay={enableAutoFillDelay}
          />
        )
      case 3:
        return (
          <StepFormContent
            mainData={page3}
            stepNumber={3}
            onPrevious={handlePrevious}
            submitButtonText="見積もりを取得する"
            enableAutoFillDelay={enableAutoFillDelay}
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
          {isLoading ? "データ取得中..." : "保険証券画像からデータを取得"}
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
            ✅ ステップ{step}に画像読み込みから追加データが入力されました！
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
