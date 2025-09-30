"use client"

import { useEffect, useState } from "react"
import type { FormData } from "@/src/types/form-data"

const STORAGE_KEY = "insurance-form-data"

export function useSessionStorage() {
  const [formData, setFormData] = useState({
    insuranceContract: {},
    vehicleInfo: {},
    personalInfo: {},
  })

  // セッションストレージからデータを読み込み
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsedData = JSON.parse(saved)
          setFormData(parsedData)
        } catch (error) {
          console.error("Failed to parse session storage data:", error)
        }
      }
    }
  }, [])

  // データを保存する関数
  const saveFormData = (newData: Partial<FormData>) => {
    const updatedData = { ...formData, ...newData }
    setFormData(updatedData)
    
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
    }
  }

  // 特定のステップのデータを更新
  const updateStepData = (step: number, stepData: Record<string, string | boolean | undefined>) => {
    const stepKeys = ["", "insuranceContract", "vehicleInfo", "personalInfo"] as const
    const stepKey = stepKeys[step] as keyof FormData
    
    if (stepKey) {
      saveFormData({ [stepKey]: stepData })
    }
  }

  // 特定のステップのデータを取得
  const getStepData = (step: number) => {
    const stepKeys = ["", "insuranceContract", "vehicleInfo", "personalInfo"] as const
    const stepKey = stepKeys[step] as keyof FormData
    return stepKey ? formData[stepKey] : {}
  }

  // セッションストレージをクリア
  const clearFormData = () => {
    const emptyData: FormData = {
      insuranceContract: {},
      vehicleInfo: {},
      personalInfo: {},
    }
    setFormData(emptyData)
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }

  return {
    formData,
    saveFormData,
    updateStepData,
    getStepData,
    clearFormData,
  }
}
