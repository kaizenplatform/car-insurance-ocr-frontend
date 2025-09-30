"use client"

import { useState, useEffect } from "react"
import { useSessionStorage } from "@/src/hooks/use-session-storage"
import type { Page1 } from "@/src/types/form-data";

export function useInsuranceForm(initialData?: any) {
  const { updateStepData } = useSessionStorage()
  
  // Basic form state
  const [formData, setFormData] = useState(initialData || {})
  const [conditionalFields, setConditionalFields] = useState<Record<string, boolean>>({})
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0)

  // AutoFill mode check
  const isInAutoFillMode = () => {
    return sessionStorage.getItem('autoFillButtonPressed') === 'true'
  }

  // Handle conditional fields
  const handleConditionalFields = (fieldName: string, value: string | boolean) => {
    const newConditionalFields = { ...conditionalFields }

    // 事故関連の条件表示
    if (fieldName === "contentsform:radPrevContAccExst" && value !== "事故なし") {
      newConditionalFields["contentsform:radAcctyp"] = true
    } else if (fieldName === "contentsform:radPrevContAccExst" && value === "事故なし") {
      newConditionalFields["contentsform:radAcctyp"] = false
    }

    setConditionalFields(newConditionalFields)
  }

  // Update form data and save to sessionStorage (only for manual user input)
  const updateFormData = (key: keyof Page1, value: Page1[keyof Page1], isAutoFilling: boolean = false) => {
    const updatedData = { ...formData, [key]: value }
    setFormData(updatedData)
    
    // Only save to sessionStorage for manual user input
    if (!isAutoFilling) {
      updateStepData(1, updatedData)
    }
    
    return updatedData
  }

  // Initialize form data when initialData changes
  useEffect(() => {
    setFormData(initialData || {})
  }, [initialData])

  return {
    formData,
    setFormData,
    conditionalFields,
    setConditionalFields,
    currentFieldIndex,
    setCurrentFieldIndex,
    isInAutoFillMode,
    handleConditionalFields,
    updateFormData,
  }
}
