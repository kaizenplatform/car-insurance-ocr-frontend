"use client"

import { useState, useEffect } from "react"
import mainData from "@/src/data/main.json"

interface AutoFillItem {
  key: string
  value: any
  fieldIndex: number
}

export function useAutoFill(formData: any, updateFormData: (key: string, value: any, isAutoFilling?: boolean) => any, isInAutoFillMode: () => boolean) {
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [autoFillQueue, setAutoFillQueue] = useState<AutoFillItem[]>([])
  const [shouldResumeAutoFill, setShouldResumeAutoFill] = useState(false)
  const [originalAutoFillData, setOriginalAutoFillData] = useState<any>(null)
  const [pendingUserInput, setPendingUserInput] = useState<number | null>(null)

  // Check if field is answered
  const isFieldAnswered = (item: any, data: any): boolean => {
    console.log(`[Insurance] Checking if field is answered:`, item.question, data)
    
    // Radio button
    if (item.radio?.name) {
      const isAnswered = data[item.radio.name] && data[item.radio.name] !== ''
      console.log(`[Insurance] Radio check for ${item.radio.name}: ${isAnswered}`)
      return isAnswered
    }
    
    // Combination of checkbox and select
    if (item.checkbox?.options && item.select?.selects) {
      // Check if checkbox is selected
      const hasCheckedOption = item.checkbox.options.some((_: any, index: number) => 
        data[`${item.checkbox.name}-${index}`] === true
      )
      if (hasCheckedOption) {
        console.log(`[Insurance] Checkbox checked for ${item.checkbox.name}`)
        return true
      }
      
      // Or all selects are filled
      const allSelectedOptions = item.select.selects.every((select: any) => 
        data[select.name] && data[select.name] !== 'ご選択ください'
      )
      if (allSelectedOptions) {
        console.log(`[Insurance] All selects filled for this combo field`)
        return true
      }
      
      console.log(`[Insurance] Combo field not completed yet`)
      return false
    }
    
    // Checkbox only
    if (item.checkbox?.options) {
      const hasCheckedOption = item.checkbox.options.some((_: any, index: number) => 
        data[`${item.checkbox.name}-${index}`] === true
      )
      if (hasCheckedOption) {
        console.log(`[Insurance] Checkbox-only field completed`)
        return true
      }
    }
    
    // Select only (all selects must be filled for multi-select fields)
    if (item.select?.selects) {
      const allSelectedOptions = item.select.selects.every((select: any) => 
        data[select.name] && data[select.name] !== 'ご選択ください'
      )
      if (allSelectedOptions) {
        console.log(`[Insurance] Select-only field completed`)
        return true
      }
    }
    
    console.log(`[Insurance] Field not answered`)
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
      console.log(`[Insurance] Scrolled to field ${fieldIndex}`)
    }
  }

  // Process auto-fill queue
  const processAutoFillQueue = (queue: AutoFillItem[], index: number, currentData: any, retryCount: number = 0) => {
    if (index >= queue.length) {
      console.log('[Insurance] Sequential auto-fill completed!')
      setIsAutoFilling(false)
      setPendingUserInput(null)
      
      setTimeout(() => {
        const nextUnfilledIndex = findNextUnansweredField(currentData)
        if (nextUnfilledIndex < mainData.length) {
          scrollToField(nextUnfilledIndex)
          setPendingUserInput(nextUnfilledIndex)
          setTimeout(() => setPendingUserInput(null), 3000)
        } else {
          setShouldResumeAutoFill(false)
          setOriginalAutoFillData(null)
        }
      }, 1000)
      return
    }
    
    const currentItem = queue[index]
    console.log(`[Insurance] Auto-filling field ${index + 1}/${queue.length}:`, currentItem)
    
    // Get all items with same fieldIndex for batch processing
    const sameFieldItems = queue.filter(item => item.fieldIndex === currentItem.fieldIndex)
    const nextDifferentFieldIndex = queue.findIndex((item, idx) => idx > index && item.fieldIndex !== currentItem.fieldIndex)
    const nextIndex = nextDifferentFieldIndex === -1 ? queue.length : nextDifferentFieldIndex
    
    console.log(`[Insurance] Found ${sameFieldItems.length} items for field ${currentItem.fieldIndex}`)
    
    // Focus on field
    scrollToField(currentItem.fieldIndex)
    setPendingUserInput(currentItem.fieldIndex)
    
    // Apply all values for the same field at once
    sameFieldItems.forEach(item => {
      updateFormData(item.key, item.value, true)
    })
    
    setTimeout(() => {
      console.log('[Insurance] Auto-fill data applied via updateFormData')
      
      setTimeout(() => {
        const currentFieldItem = mainData[currentItem.fieldIndex]
        const isValidated = isFieldAnswered(currentFieldItem, formData)
        
        console.log(`[Insurance] Validation result for field ${currentItem.fieldIndex}: ${isValidated}, retry count: ${retryCount}`)
        
        if (isValidated) {
          setTimeout(() => {
            processAutoFillQueue(queue, nextIndex, formData, 0)
          }, 200)
        } else if (retryCount < 3) {
          console.log(`[Insurance] Retrying auto-fill for field ${currentItem.fieldIndex} (attempt ${retryCount + 1}/3)`)
          setTimeout(() => {
            processAutoFillQueue(queue, index, formData, retryCount + 1)
          }, 500)
        } else {
          console.log(`[Insurance] Max retry reached for field ${currentItem.fieldIndex}, skipping to next`)
          setTimeout(() => {
            processAutoFillQueue(queue, nextIndex, formData, 0)
          }, 200)
        }
      }, 300)
    }, 200)
  }

  // Start sequential auto-fill
  const startSequentialAutoFill = () => {
    console.log('[Insurance] Building auto-fill queue from current form data...')
    
    setShouldResumeAutoFill(true)
    setOriginalAutoFillData({ ...formData })
    console.log('🔵 [Insurance] Saved original auto-fill data:', { ...formData })
    
    const fieldsToAutoFill: AutoFillItem[] = []
    const currentFieldIndex = findNextUnansweredField({}) + 1
    
    // Build queue from current form data
    for (let i = 0; i < currentFieldIndex; i++) {
      const item = mainData[i]
      
      if (item.radio?.name && formData[item.radio.name]) {
        fieldsToAutoFill.push({
          key: item.radio.name,
          value: formData[item.radio.name],
          fieldIndex: i
        })
      }
      
      if (item.select?.selects) {
        item.select.selects.forEach((select: any) => {
          if (formData[select.name] && formData[select.name] !== 'ご選択ください') {
            fieldsToAutoFill.push({
              key: select.name,
              value: formData[select.name],
              fieldIndex: i
            })
          }
        })
      }
      
      if (item.checkbox?.options) {
        item.checkbox.options.forEach((_: any, checkIndex: number) => {
          const checkKey = `${item.checkbox.name}-${checkIndex}`
          if (formData[checkKey] === true) {
            fieldsToAutoFill.push({
              key: checkKey,
              value: true,
              fieldIndex: i
            })
          }
        })
      }
    }
    
    console.log(`[Insurance] Found ${fieldsToAutoFill.length} fields to auto-fill:`, fieldsToAutoFill)
    
    if (fieldsToAutoFill.length > 0) {
      setAutoFillQueue(fieldsToAutoFill)
      setIsAutoFilling(true)
      
      // Start sequential auto-fill directly
      console.log('[Insurance] Starting auto-fill sequence...')
      
      setTimeout(() => {
        processAutoFillQueue(fieldsToAutoFill, 0, {}, 0)
      }, 500)
    }
  }

  // Resume auto-fill from current data
  const resumeAutoFillFromData = (currentData: any) => {
    if (isAutoFilling || !originalAutoFillData) return
    
    console.log('[Insurance] Checking for auto-fill resume...')
    
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
          
          if (item.checkbox?.options && key.startsWith(item.checkbox.name + '-')) {
            missingFields.push({ key, value: originalValue, fieldIndex: i })
            break
          }
        }
      }
    })
    
    console.log(`[Insurance] Found ${missingFields.length} missing fields:`, missingFields)
    
    if (missingFields.length > 0) {
      setIsAutoFilling(true)
      setTimeout(() => {
        processAutoFillQueue(missingFields, 0, currentData, 0)
      }, 500)
    } else {
      setShouldResumeAutoFill(false)
      setOriginalAutoFillData(null)
      console.log('[Insurance] No missing fields, resume complete')
    }
  }

  // Listen for auto-fill completed event
  useEffect(() => {
    const handleAutoFillCompleted = (event: CustomEvent) => {
      if (event.detail?.shouldFocusNextField && event.detail?.isAutoFillMode) {
        console.log('[Insurance] Starting sequential auto-fill from API data...')
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
  }
}
