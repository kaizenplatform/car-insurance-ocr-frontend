"use client"

import { useState, useEffect } from "react"
import page1 from "@/src/data/page1.json"
import page2 from "@/src/data/page2.json"
import page3 from "@/src/data/page3.json"
import type { Page1 } from "@/src/types/form-data";
interface AutoFillItem {
  key: string
  value: any
  fieldIndex: number
}

const mainData = [...page1, ...page2, ...page3]

export function useAutoFill(formData: any, updateFormData: (key: keyof Page1, value: Page1[keyof Page1], isAutoFilling?: boolean) => any, isInAutoFillMode: () => boolean) {
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [autoFillQueue, setAutoFillQueue] = useState<AutoFillItem[]>([])
  const [shouldResumeAutoFill, setShouldResumeAutoFill] = useState(false)
  const [originalAutoFillData, setOriginalAutoFillData] = useState<any>(null)
  const [pendingUserInput, setPendingUserInput] = useState<number | null>(null)

  // Check if field is answered
  const isFieldAnswered = (item: any, data: any): boolean => {
    // Radio button
    if (item.radio?.name) {
      const isAnswered = data[item.radio.name] && data[item.radio.name] !== ''
      return isAnswered
    }
    
    // Combination of checkbox and select
    if (item.checkbox?.options && item.select?.selects) {
      // Check if checkbox is selected
      const hasCheckedOption = item.checkbox.options.some((_: any, index: number) => 
        data[`${item.checkbox.name}-${index}`] === true
      )
      if (hasCheckedOption) {
        return true
      }
      
      // Or all selects are filled
      const allSelectedOptions = item.select.selects.every((select: any) => 
        data[select.name] && data[select.name] !== 'ご選択ください'
      )
      if (allSelectedOptions) {
        return true
      }
      
      return false
    }
    
    // Checkbox only
    if (item.checkbox?.options) {
      const hasCheckedOption = item.checkbox.options.some((_: any, index: number) => 
        data[`${item.checkbox.name}-${index}`] === true
      )
      if (hasCheckedOption) {
        return true
      }
    }
    
    // Select only (all selects must be filled for multi-select fields)
    if (item.select?.selects) {
      const allSelectedOptions = item.select.selects.every((select: any) => 
        data[select.name] && data[select.name] !== 'ご選択ください'
      )
      if (allSelectedOptions) {
        return true
      }
    }
    
    return false
  }

  // Find next unanswered field
  const findNextUnansweredField = (data: any): number => {
    for (let i = 0; i < mainData.length; i++) {
      if (!isFieldAnswered(mainData[i], data)) {
        return i
      }
    }
    return mainData.length
  }

  // Scroll to specific field
  const scrollToField = (fieldIndex: number) => {
    const fieldElement = document.querySelector(`[data-field-index="${fieldIndex}"]`)
    if (fieldElement) {
      fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // Process auto-fill queue
  const processAutoFillQueue = (queue: AutoFillItem[], index: number, currentData: any, retryCount: number = 0) => {
    if (index >= queue.length) {
      setIsAutoFilling(false);
      setPendingUserInput(null);

      setTimeout(() => {
        const nextUnfilledIndex = findNextUnansweredField(currentData);
        if (nextUnfilledIndex < mainData.length) {
          scrollToField(nextUnfilledIndex);
          setPendingUserInput(nextUnfilledIndex);
          setTimeout(() => setPendingUserInput(null), 3000);
        } else {
          setShouldResumeAutoFill(false);
          setOriginalAutoFillData(null);
        }
      }, 1000);
      return;
    }

    const currentItem = queue[index];
    // Get all items with same fieldIndex for batch processing
    const sameFieldItems = queue.filter((item) => item.fieldIndex === currentItem.fieldIndex);
    const nextDifferentFieldIndex = queue.findIndex(
      (item, idx) => idx > index && item.fieldIndex !== currentItem.fieldIndex
    );
    const nextIndex = nextDifferentFieldIndex === -1 ? queue.length : nextDifferentFieldIndex;

    // Focus on field (even during auto-fill)
    scrollToField(currentItem.fieldIndex);
    setPendingUserInput(currentItem.fieldIndex);

    // Apply all values for the same field at once
    sameFieldItems.forEach((item) => {
      updateFormData(item.key as keyof Page1, item.value, true);
    });

    setTimeout(() => {
      const currentFieldItem = mainData[currentItem.fieldIndex];
      const isValidated = isFieldAnswered(currentFieldItem, formData);

      if (isValidated) {
        setTimeout(() => {
          setPendingUserInput(null); // Clear pending user input after validation
          processAutoFillQueue(queue, nextIndex, formData, 0);
        }, 200);
      } else if (retryCount < 3) {
        setTimeout(() => {
          processAutoFillQueue(queue, index, formData, retryCount + 1);
        }, 500);
      } else {
        setTimeout(() => {
          setPendingUserInput(null); // Clear pending user input after retries
          processAutoFillQueue(queue, nextIndex, formData, 0);
        }, 200);
      }
    }, 300);
  }

  // Start sequential auto-fill
  const startSequentialAutoFill = () => {
    
    setShouldResumeAutoFill(true)
    setOriginalAutoFillData({ ...formData })
    
    const fieldsToAutoFill: AutoFillItem[] = []
    const currentFieldIndex = findNextUnansweredField({}) + 1
    
    // Build queue from current form data
    for (let i = 0; i < currentFieldIndex; i++) {
      const item = mainData[i]
      
      if (item.radio?.name && formData[item.radio.name]) {
        fieldsToAutoFill.push({
          key: item.radio.name as keyof Page1,
          value: formData.get(item.radio.name),
          fieldIndex: i
        })
      }
      
      if (item.select?.selects) {
        item.select.selects.forEach((select: any) => {
          const selectValue = formData.get(select.name);
          if (selectValue && selectValue !== 'ご選択ください') {
            fieldsToAutoFill.push({
              key: select.name as keyof Page1,
              value: selectValue,
              fieldIndex: i
            })
          }
        })
      }
    }
    
    if (fieldsToAutoFill.length > 0) {
      setAutoFillQueue(fieldsToAutoFill)
      setIsAutoFilling(true)
      
      // Start sequential auto-fill directly
      setTimeout(() => {
        processAutoFillQueue(fieldsToAutoFill, 0, {}, 0)
      }, 500)
    }
  }

  // Resume auto-fill from current data
  const resumeAutoFillFromData = (currentData: any) => {
    if (isAutoFilling || !originalAutoFillData) return
    
    const missingFields: AutoFillItem[] = []
    const currentFieldIndex = findNextUnansweredField(currentData) + 1
    
    Object.keys(originalAutoFillData).forEach((key) => {
      const originalValue = originalAutoFillData[key]
      const currentValue = currentData[key]
      
      if (originalValue && !currentValue && originalValue !== 'ご選択ください') {
        for (let i = 0; i < currentFieldIndex; i++) {
          const item = mainData[i]
          
          if (item.radio?.name === key) {
            missingFields.push({ key, value: originalValue, fieldIndex: i })
            break
          }
          
          if (item.select?.selects) {
            for (const select of item.select.selects) {
              if (select.name === key) {
                missingFields.push({ key, value: originalValue, fieldIndex: i })
                break
              }
            }
          }
        }
      }
    })
    
    
    if (missingFields.length > 0) {
      setIsAutoFilling(true)
      setTimeout(() => {
        processAutoFillQueue(missingFields, 0, currentData, 0)
      }, 500)
    } else {
      setShouldResumeAutoFill(false)
      setOriginalAutoFillData(null)
    }
  }

  // Start auto-fill from session storage
  const startAutoFillFromSessionStorage = () => {
    const step1Data = JSON.parse(sessionStorage.getItem("step1") || "{}") as Record<string, any>;
    const step2Data = JSON.parse(sessionStorage.getItem("step2") || "{}") as Record<string, any>;
    const step3Data = JSON.parse(sessionStorage.getItem("step3") || "{}") as Record<string, any>;

    const allData = { ...step1Data, ...step2Data, ...step3Data };

    const queue: AutoFillItem[] = Object.keys(allData).map((key) => ({
      key,
      value: allData[key],
      fieldIndex: 0, // Adjust fieldIndex logic as needed
    }));

    setAutoFillQueue(queue);
    setIsAutoFilling(true);
  };

  // Listen for auto-fill completed event
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
  }, [formData])

  return {
    isAutoFilling,
    pendingUserInput,
    setPendingUserInput,
    shouldResumeAutoFill,
    originalAutoFillData,
    isFieldAnswered,
    findNextUnansweredField,
    scrollToField,
    startSequentialAutoFill,
    resumeAutoFillFromData,
    startAutoFillFromSessionStorage,
  }
}
