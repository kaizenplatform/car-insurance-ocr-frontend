"use client"

import { useEffect, useState } from "react"
import type { FormData, FormDataResponse } from "@/src/types/form-data"

const STORAGE_KEY = "insurance-form-data"
const AUTO_FILL_FLAG = "autoFillFlag"
const UPDATE_EVENT_KEY = "sessionStorageUpdate"

export function useSessionStorage() {
  const [formData, setFormData] = useState<FormData>({
    insuranceContract: {},
    vehicleInfo: {},
    personalInfo: {},
  });
  const [autoFillEnabled, setAutoFillEnabled] = useState(false);

  const updateStateFromStorage = () => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setFormData(parsedData);
      } catch (error) {
        console.error("Failed to parse session storage data:", error);
      }
    }
    const savedAutoFillFlag = sessionStorage.getItem(AUTO_FILL_FLAG);
    setAutoFillEnabled(savedAutoFillFlag === "true");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      updateStateFromStorage(); // Initial load
      window.addEventListener(UPDATE_EVENT_KEY, updateStateFromStorage);
      return () => {
        window.removeEventListener(UPDATE_EVENT_KEY, updateStateFromStorage);
      };
    }
  }, []);

  const dispatchUpdateEvent = () => {
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT_KEY));
  }

  const enableAutoFill = (): boolean => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(AUTO_FILL_FLAG, "true");
      dispatchUpdateEvent();
      return true;
    }
    return false;
  }

  const isAutoFillEnabled = (): boolean => {
    return autoFillEnabled;
  }

  const saveAllData = (allData: FormDataResponse) => {
    const formattedData = {
      insuranceContract: allData.step1,
      vehicleInfo: allData.step2,
      personalInfo: allData.step3,
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formattedData));
      dispatchUpdateEvent();
    }
  }

  const getStepData = (step: number): Record<string, any> | null => {
    switch (step) {
      case 1:
        return formData.insuranceContract
      case 2:
        return formData.vehicleInfo
      case 3:
        return formData.personalInfo
      default:
        return null
    }
  }

  return {
    formData,
    saveAllData,
    getStepData,
    isAutoFillEnabled,
    enableAutoFill,
  }
}
