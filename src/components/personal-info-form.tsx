"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { getPageFields } from "@/src/utils/form-config"
import { FormFieldRenderer } from "./form-field-render"

interface PersonalInfoFormProps {
  initialData: any
  onSubmit: (data: any) => void
  onPrevious: () => void
  onChange?: () => void
}

export function PersonalInfoForm({ initialData, onSubmit, onPrevious, onChange }: PersonalInfoFormProps) {
  const [formData, setFormData] = useState(initialData)

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const updateFormData = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }))
    onChange?.() // フォームが変更されたことを通知
  }

  const pageFields = getPageFields(3)

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
        <Button type="submit" className="px-8 bg-green-600 hover:bg-green-700">
          見積もりを取得する
        </Button>
      </div>
    </form>
  )
}
