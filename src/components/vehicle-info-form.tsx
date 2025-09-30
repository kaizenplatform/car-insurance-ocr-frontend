"use client"

import type React from "react"
import { useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { getPageFields } from "@/src/utils/form-config"
import { FormFieldRenderer } from "./form-field-render"
import { usePrefillForm } from "@/src/hooks/use-prefill-form";

interface VehicleInfoFormProps {
  initialData: any
  onNext: (data: any) => void
  onPrevious: () => void
  onChange?: () => void
}

export function VehicleInfoForm({ initialData, onNext, onPrevious, onChange }: VehicleInfoFormProps) {
  const { formData, setFormData } = usePrefillForm(2);

  // autoFillCompletedイベントで未記入項目に自動フォーカス
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.shouldFocusNextField) {
        // 未記入項目を探してフォーカス
        setTimeout(() => {
          const formElements = document.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-step='2'] input, [data-step='2'] select")
          for (const el of formElements) {
            if (!el.value) {
              el.focus()
              break
            }
          }
        }, 100)
      }
    }
    window.addEventListener('autoFillCompleted', handler)
    return () => window.removeEventListener('autoFillCompleted', handler)
  }, [])

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  const updateFormData = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }))
    onChange?.() // フォームが変更されたことを通知
  }

  const pageFields = getPageFields(2)

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-step="2">
      <div className="space-y-6">
        {pageFields.map((field, index) => (
          <FormFieldRenderer key={index} field={field} formData={formData} updateFormData={updateFormData} />
        ))}
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onPrevious}>
          前に戻る
        </Button>
        <Button type="submit" className="px-8">
          次へ進む
        </Button>
      </div>
    </form>
  )
}
