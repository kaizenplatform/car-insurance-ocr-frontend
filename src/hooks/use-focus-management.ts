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
    
    // Check if autoFill mode is active
    const autoFillModeActive = isInAutoFillMode()
    
    // Do not handle focus if autoFill mode is not active
    if (!autoFillModeActive) {
      return
    }
    
    // Handle focus only in autoFill mode and when not currently auto-filling
    if (!isAutoFilling) {
      setTimeout(() => {
        
        if (nextUnansweredIndex < 100) { // Assuming max 100 fields
          
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
