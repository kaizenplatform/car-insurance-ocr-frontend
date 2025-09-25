"use client"

import { useState, useEffect } from "react"
import { useSessionStorage } from "@/src/hooks/use-session-storage"
import mainData from "@/src/data/main.json"

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
  const updateFormData = (key: string, value: any, isAutoFilling: boolean = false) => {
    const updatedData = { ...formData, [key]: value }
    setFormData(updatedData)
    console.log('[Insurance] Form data updated:', updatedData)
    
    // Only save to sessionStorage for manual user input
    if (!isAutoFilling) {
      updateStepData(1, updatedData)
      console.log('[Insurance] User data saved to sessionStorage:', updatedData)
    } else {
      console.log('[Insurance] Auto-fill mode - skipping sessionStorage update')
    }
    
    return updatedData
  }

  // Initialize form data when initialData changes
  useEffect(() => {
    console.log("[Insurance] Form received new initialData:", initialData)
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
