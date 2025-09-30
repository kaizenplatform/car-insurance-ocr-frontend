"use client"

import type React from "react"
import { useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Checkbox } from "@/src/components/ui/checkbox"
import { useInsuranceForm } from "@/src/hooks/use-insurance-form"
import { useAutoFill } from "@/src/hooks/use-auto-fill"
import { useFocusManagement } from "@/src/hooks/use-focus-management"
import page1 from "@/src/data/page1.json"

import type { Page1 } from "@/src/types/form-data";

const mainData = page1
interface InsuranceContractFormProps {
  initialData?: any
  onNext: (data: any) => void
  onChange?: () => void
}

export function InsuranceContractForm({ initialData, onNext, onChange }: InsuranceContractFormProps) {
  // Use custom hooks
  const {
    formData,
    conditionalFields,
    isInAutoFillMode,
    handleConditionalFields,
    updateFormData: baseUpdateFormData
  } = useInsuranceForm(initialData)

  const {
    isAutoFilling,
    pendingUserInput,
    setPendingUserInput,
    shouldResumeAutoFill,
    originalAutoFillData,
    findNextUnansweredField,
    scrollToField,
    resumeAutoFillFromData,
    startSequentialAutoFill
  } = useAutoFill(formData, baseUpdateFormData, isInAutoFillMode)

  const {
    currentFieldIndex,
    updateVisibleFieldIndex
  } = useFocusManagement(
    isInAutoFillMode,
    isAutoFilling,
    findNextUnansweredField,
    scrollToField,
    setPendingUserInput
  )

  // Use initialData effect
  useEffect(() => {
    // Update visible field index for initial data
    updateVisibleFieldIndex(initialData || {})
  }, [initialData])

  // Auto-fill completion handler
  useEffect(() => {
    const handleAutoFillCompleted = (event: CustomEvent) => {
      if (event.detail?.shouldFocusNextField && event.detail?.isAutoFillMode) {
        startSequentialAutoFill()
      }
    }

    window.addEventListener('autoFillCompleted', handleAutoFillCompleted as EventListener)
    
    return () => {
      window.removeEventListener('autoFillCompleted', handleAutoFillCompleted as EventListener)
    }
  }, [formData, startSequentialAutoFill])

  // Enhanced updateFormData that handles all logic
  const updateFormData = (key: string, value: any) => {
    const updatedData = baseUpdateFormData(key as keyof Page1, value, isAutoFilling);

    // Handle conditional fields
    handleConditionalFields(key, value);

    // Update visible field index and handle focus
    updateVisibleFieldIndex(updatedData);

    // Handle autoFill resumption
    const autoFillModeActive = isInAutoFillMode();
    if (autoFillModeActive && !isAutoFilling && shouldResumeAutoFill && originalAutoFillData) {
      setTimeout(() => {
        resumeAutoFillFromData(updatedData);
      }, 1000);
    } else if (autoFillModeActive && !isAutoFilling && !shouldResumeAutoFill && originalAutoFillData) {
      setTimeout(() => {
        resumeAutoFillFromData(updatedData);
      }, 1000);
    }

    onChange?.();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  const renderField = (item: any, index: number) => {
    // 現在の表示範囲を超える項目は表示しない
    if (index >= currentFieldIndex) {
      return null
    }

    const shouldShow = true // Simplified - conditional fields handled by hook

    if (!shouldShow) return null

    const isHighlighted = pendingUserInput === index
    const isAutoFillHighlight = isHighlighted && isAutoFilling
    const isManualHighlight = isHighlighted && !isAutoFilling
    
    let cardClassName = "mb-6 transition-all duration-300 ease-in-out"
    
    if (isAutoFillHighlight) {
      // 自動入力時は青色ハイライト
      cardClassName += " border-2 border-blue-400 bg-blue-50 shadow-lg"
    } else if (isManualHighlight) {
      // 通常時はオレンジ色ハイライト
      cardClassName += " border-2 border-orange-400 bg-orange-50 shadow-lg"
    }

    return (
      <Card key={index} className={cardClassName} data-field-index={index}>
        <CardContent className="p-4">
          <Label className="text-base font-medium mb-4 block">{item.question}</Label>

          {item.radio && (
            <RadioGroup
              value={formData[item.radio.name] || ""}
              onValueChange={(value) => updateFormData(item.radio.name, value)}
              className="space-y-2"
            >
              {item.radio.options.map((option: string, optIndex: number) => (
                <div key={optIndex} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={option} 
                    id={`${item.radio.name}-${optIndex}`}
                    className="border-blue-500 text-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" 
                  />
                  <Label htmlFor={`${item.radio.name}-${optIndex}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {item.checkbox && (
            <div className="space-y-2 mt-4">
              {item.checkbox.options.map((option: string, optIndex: number) => (
                <div key={optIndex} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${item.checkbox.name}-${optIndex}`}
                    checked={formData[`${item.checkbox.name}-${optIndex}`] || false}
                    onCheckedChange={(checked) => updateFormData(`${item.checkbox.name}-${optIndex}`, checked)}
                    className="border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label htmlFor={`${item.checkbox.name}-${optIndex}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {item.select && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {item.select.selects.map((select: any, selectIndex: number) => {
                let placeholder = "選択してください"
                if (select.name && select.name.includes("datey")) placeholder = "年"
                else if (select.name && select.name.includes("datem")) placeholder = "月"
                else if (select.name && select.name.includes("dated")) placeholder = "日"

                return (
                  <div key={selectIndex}>
                    <Select
                      value={formData[select.name] || ""}
                      onValueChange={(value) => updateFormData(select.name, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {select.options.map((option: string, optIndex: number) => (
                          <SelectItem key={optIndex} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mainData.map((item, index) => renderField(item, index))}

      {/* 完了項目数の表示 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            回答済み: {Object.keys(formData).filter(key => formData[key] && formData[key] !== '').length} 項目
          </p>
          <p className="text-xs text-gray-500">
            表示中: {currentFieldIndex} / {mainData.length} 項目
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button type="submit" className="px-8">
          次へ進む
        </Button>
      </div>
    </form>
  )
}
