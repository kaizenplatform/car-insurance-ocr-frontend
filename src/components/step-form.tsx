"use client"

import { useEffect, useState } from "react"
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
  const { getStepData, updateStepData } = useSessionStorage()
  const [isLoading, setIsLoading] = useState(false)
  const [showAutoFillNotice, setShowAutoFillNotice] = useState(false)
  const [initialData, setInitialData] = useState({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  useEffect(() => {
    // ページロード時にsessionStorageからデータを取得し、自動でフォームに反映
    const savedData = getStepData(step)
    setInitialData(savedData)
    console.log(`[StepForm] Loaded saved data for step ${step}:`, savedData)
  }, [step, getStepData])

  const fetchAndAutoFillForm = async () => {
    setIsLoading(true)
    try {
      // 自動入力ボタンが押されたことをsessionStorageに記録
      sessionStorage.setItem('autoFillButtonPressed', 'true')
      
      console.log(`[StepForm] Fetching data for step ${step}`)
      // ステップごとのAPIコール
      const response = await fetch(`/api/form-data?step=${step}`)
      const responseData = await response.json()
      console.log(`[StepForm] API response for step ${step}:`, responseData)

      const autoFilledData: Record<string, string | boolean | undefined> = {}

      // Process each item in the response data
      responseData.forEach((item: any, index: number) => {
        console.log(`[StepForm] Processing item ${index}:`, item)

        // Handle radio buttons
        if (item.radio && item.radio.name && item.radio.value) {
          const fieldName = item.radio.name
          const value = item.radio.value
          autoFilledData[fieldName] = value
        }

        // Handle select dropdowns
        if (item.select && item.select.selects) {
          item.select.selects.forEach((select: any) => {
            const fieldName = select.name || select.id
            const value = select.value
            if (fieldName && value) {
              autoFilledData[fieldName] = value
            }
          })
        }

        // Handle checkbox
        if (item.checkbox && item.checkbox.name && item.checkbox.value) {
          const fieldName = item.checkbox.name
          const value = item.checkbox.value
          autoFilledData[fieldName] = value
        }
      })

      console.log(`[StepForm] Auto-filled data for step ${step}:`, autoFilledData)
      
      // 既存のsessionStorageデータ（ユーザー入力）を取得
      const currentData = getStepData(step)
      console.log(`[StepForm] Current user data for step ${step}:`, currentData)
      
      // ユーザーデータを優先してマージ（APIデータで上書きしない）
      const mergedData = { ...autoFilledData, ...currentData }
      console.log(`[StepForm] Merged data (user priority) for step ${step}:`, mergedData)
      
      // sessionStorageに保存
      updateStepData(step, mergedData)
      setInitialData(mergedData)
      setShowAutoFillNotice(true)

      // 通知を3秒後に非表示
      setTimeout(() => {
        setShowAutoFillNotice(false)
      }, 3000)

      // 未記入項目にフォーカス（ステップ1のみ）
      if (step === 1) {
        setTimeout(() => {
          const event = new CustomEvent('autoFillCompleted', { 
            detail: { shouldFocusNextField: true, isAutoFillMode: true } 
          })
          window.dispatchEvent(event)
        }, 500)
      }

    } catch (error) {
      console.error(`Failed to fetch step ${step} data:`, error)
      alert("APIからのデータ取得に失敗しました。")
    } finally {
      setIsLoading(false)
    }
  }

  // バリデーション関数（段階的表示対応版）
  const validateStepData = (stepData: any, step: number) => {
    const errors: string[] = []
    
    console.log(`[StepForm] Validating step ${step} data:`, stepData)
    
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
    
    console.log(`[StepForm] Validation errors for step ${step}:`, errors)
    return errors
  }

  const handleNext = (stepData: any) => {
    console.log(`[StepForm] Attempting to proceed from step ${step} with data:`, stepData)
    
    // バリデーション実行
    const errors = validateStepData(stepData, step)
    setValidationErrors(errors)
    
    if (errors.length > 0) {
      // エラーがある場合は処理を停止
      console.log(`[StepForm] Validation failed for step ${step}:`, errors)
      return
    }
    
    console.log(`[StepForm] Validation passed for step ${step}, proceeding...`)
    
    // データをsessionStorageに保存
    updateStepData(step, stepData)
    
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
    
    // 最終ステップのデータを保存
    updateStepData(step, stepData)
    
    console.log("Form submitted:", stepData)
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
        return <InsuranceContractForm initialData={initialData} onNext={handleNext} onChange={handleFormChange} />
      case 2:
        return (
          <VehicleInfoForm 
            initialData={initialData} 
            onNext={handleNext} 
            onPrevious={handlePrevious}
            onChange={handleFormChange}
          />
        )
      case 3:
        return (
          <PersonalInfoForm 
            initialData={initialData} 
            onSubmit={handleSubmit} 
            onPrevious={handlePrevious}
            onChange={handleFormChange} 
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* UX改善ヒント */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              💡 <strong>スマート機能のご案内</strong>
            </p>
            <ul className="mt-2 text-xs text-blue-600 space-y-1">
              <li>• ステップ1：回答に応じて関連項目が段階的に表示されます</li>
              <li>• スマート入力：見えている項目のみを自動入力し、未記入項目をハイライト</li>
              <li>• データは自動保存され、ブラウザを閉じても継続できます</li>
            </ul>
          </div>
        </div>
      </div>

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
