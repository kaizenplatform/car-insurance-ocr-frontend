"use client"

import { useState } from "react"

export function useFocusManagement(
  isInAutoFillMode: () => boolean,
  isAutoFilling: boolean,
  findNextUnansweredField: (data: any) => number,
  scrollToField: (fieldIndex: number) => void,
  setPendingUserInput: (index: number | null) => void
) {
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0)

  // Update visible field index and handle focus
  const updateVisibleFieldIndex = (data: any) => {
    const nextUnansweredIndex = findNextUnansweredField(data)
    const newFieldIndex = nextUnansweredIndex + 1
    setCurrentFieldIndex(newFieldIndex)
    console.log(`[Insurance] Updated field index to: ${newFieldIndex}`)
    
    // Check if autoFill mode is active
    const autoFillModeActive = isInAutoFillMode()
    console.log(`[Insurance] AutoFill mode active: ${autoFillModeActive}`)
    
    // Do not handle focus if autoFill mode is not active
    if (!autoFillModeActive) {
      console.log('[Insurance] 🚫 AutoFill mode not active - no focus handling')
      return
    }
    
    // Handle focus only in autoFill mode and when not currently auto-filling
    if (!isAutoFilling) {
      setTimeout(() => {
        console.log(`[Insurance] 🟠 AutoFill mode - checking focus after field index update - next unfilled: ${nextUnansweredIndex}`)
        if (nextUnansweredIndex < 100) { // Assuming max 100 fields
          console.log(`[Insurance] 🟠 AutoFill mode - auto-focusing on field: ${nextUnansweredIndex}`)
          scrollToField(nextUnansweredIndex)
          setPendingUserInput(nextUnansweredIndex)
          
          // Remove highlight after 3 seconds
          setTimeout(() => setPendingUserInput(null), 3000)
        }
      }, 500)
    }
  }

  return {
    currentFieldIndex,
    setCurrentFieldIndex,
    updateVisibleFieldIndex,
  }
}
