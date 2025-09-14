"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FormFieldRenderer } from "@/components/form-field-renderer"
import { getPageFields } from "@/utils/form-config"

interface VehicleInfoFormProps {
  initialData: any
  onSubmit: (data: any) => void
  onPrevious: () => void
}

export function VehicleInfoForm({ initialData, onSubmit, onPrevious }: VehicleInfoFormProps) {
  const [formData, setFormData] = useState(initialData)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const updateFormData = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }))
  }

  const pageFields = getPageFields(2)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6 max-h-96 overflow-y-auto">
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
