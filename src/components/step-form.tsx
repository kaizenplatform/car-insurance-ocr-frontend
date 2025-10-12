"use client"

import { useState, useEffect } from "react"
import { ImageUploadModal } from "@/src/components/ImageUploadModal"
import AutoDismissPopup from "@/src/components/ui/AutoDismissPopup"
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
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/form-data", {
        method: "POST",
        body: formData,
      });
      
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        alert(`エラーが発生しました: ${errorData.error}\n詳細: ${errorData.details || ''}`);
        return;
      }
      
      const data = await res.json();
      console.log("Response data:", data);
      
      saveAllData(data);
      enableAutoFill();
      setShowAutoFillNotice(true);
    } catch (error) {
      console.error("Upload error:", error);
      alert(`アップロードエラー: ${error instanceof Error ? error.message : String(error)}`);
    }
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
    // 完了ページへ遷移
    router.push("/complete")
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
            onSubmit={handleSubmit}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {step === 1 && (
        <>
          <div className="fixed bottom-1 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-50">
            <Button
              onClick={fetchAndAutoFillForm}
              disabled={isLoading}
              className={`w-full py-6 gap-0 shadow-lg text-white flex flex-col items-center justify-center tracking-tight ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:from-purple-600 hover:to-blue-600'}`}
              style={{ backgroundImage: 'linear-gradient(90deg, #7c3aed, #2563eb)' }}
            >
              {isLoading ? (
                <span className="text-sm font-medium tracking-tight leading-tight">データ取得中...</span>
              ) : (
                <>
                  <span className="text-xs tracking-tight leading-tight">\入力時間を70%短縮/</span>
                  <span className="text-base font-bold mt-0.5 tracking-tight leading-tight">保険証券の画像を使って自動入力</span>
                </>
              )}
            </Button>
          </div>
        </>
      )}
      <ImageUploadModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        onUpload={handleImageUpload}
      />

      {/* Global popup (PopupProvider) will show loading/completion states. */}

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
