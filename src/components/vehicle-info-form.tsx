"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { getPageFields } from "@/src/utils/form-config"
import { FormFieldRenderer } from "./form-field-render"

interface VehicleInfoFormProps {
  initialData: any
  onNext: (data: any) => void
  onPrevious: () => void
  onChange?: () => void
}

export function VehicleInfoForm({ initialData, onNext, onPrevious, onChange }: VehicleInfoFormProps) {
  const [formData, setFormData] = useState(initialData)

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
    <form onSubmit={handleSubmit} className="space-y-6">
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
