"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Checkbox } from "@/src/components/ui/checkbox"
import { useSessionStorage } from "@/src/hooks/use-session-storage"
import mainData from "@/src/data/main.json"

interface InsuranceContractFormProps {
  initialData?: any
  onNext: (data: any) => void
  onChange?: () => void
}

export function InsuranceContractForm({ initialData, onNext, onChange }: InsuranceContractFormProps) {
  const { updateStepData } = useSessionStorage()
  const [formData, setFormData] = useState(initialData)
  const [conditionalFields, setConditionalFields] = useState<Record<string, boolean>>({})
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0)
  const [pendingUserInput, setPendingUserInput] = useState<number | null>(null) // 入力待ちの項目インデックス
  const [isAutoFilling, setIsAutoFilling] = useState(false) // 自動入力中かどうか
  const [autoFillQueue, setAutoFillQueue] = useState<Array<{key: string, value: any, fieldIndex: number}>>([]) // 自動入力のキュー
  const [shouldResumeAutoFill, setShouldResumeAutoFill] = useState(false) // ユーザー入力後に自動入力を再開するかどうか
  const [originalAutoFillData, setOriginalAutoFillData] = useState<any>(null) // 元の自動入力データを保存

  // autoFillモードかどうかを判定する関数
  const isInAutoFillMode = () => {
    return sessionStorage.getItem('autoFillButtonPressed') === 'true'
  }

  useEffect(() => {
    console.log("[v0] Insurance contract form received new initialData:", initialData)
    setFormData(initialData)
    
    // データに基づいて表示すべき項目数を計算
    updateVisibleFieldIndex(initialData)
  }, [initialData])

  // 通常の自動入力完了後のフォーカス処理
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

  // 段階的自動入力を開始
  const startSequentialAutoFill = () => {
    console.log('[Insurance] Building auto-fill queue from current form data...')
    
    // 自動入力モード再開フラグを設定
    setShouldResumeAutoFill(true)
    
    // 元の自動入力データを保存（APIから取得された完全なデータ）
    setOriginalAutoFillData({ ...formData })
    console.log('🔵 [Insurance] Saved original auto-fill data:', { ...formData })
    
    // 現在のフォームデータから自動入力すべき項目を特定
    const fieldsToAutoFill: Array<{key: string, value: any, fieldIndex: number}> = []
    
    // 現在表示されている範囲で、値が設定されているが未入力だった項目を探す
    for (let i = 0; i < currentFieldIndex; i++) {
      const item = mainData[i]
      
      // ラジオボタンの値をチェック
      if (item.radio?.name && formData[item.radio.name]) {
        fieldsToAutoFill.push({
          key: item.radio.name,
          value: formData[item.radio.name],
          fieldIndex: i
        })
      }
      
      // セレクトボックスの値をチェック
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
      
      // チェックボックスの値をチェック
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
      
      // フォームデータを一旦クリアして順次入力する
      const clearedData = {}
      setFormData(clearedData)
      
      // 最初のフィールドから開始
      setTimeout(() => {
        processAutoFillQueue(fieldsToAutoFill, 0, clearedData, 0)
      }, 500)
    }
  }

  // 自動入力キューを順次処理
  const processAutoFillQueue = (queue: Array<{key: string, value: any, fieldIndex: number}>, index: number, currentData: any, retryCount: number = 0) => {
    if (index >= queue.length) {
      // 全ての自動入力完了
      console.log('[Insurance] Sequential auto-fill completed!')
      setIsAutoFilling(false)
      setPendingUserInput(null)
      
      // shouldResumeAutoFillフラグは維持（ユーザー入力後に再開できるように）
      
      // 最終的に未記入項目があればフォーカス
      setTimeout(() => {
        const nextUnfilledIndex = findNextUnansweredField(currentData)
        if (nextUnfilledIndex < mainData.length) {
          scrollToField(nextUnfilledIndex)
          setPendingUserInput(nextUnfilledIndex)
          setTimeout(() => setPendingUserInput(null), 3000)
        } else {
          // 全て完了した場合のみフラグをリセット
          setShouldResumeAutoFill(false)
          setOriginalAutoFillData(null)
        }
      }, 1000)
      return
    }
    
    const currentItem = queue[index]
    console.log(`[Insurance] Auto-filling field ${index + 1}/${queue.length}:`, currentItem)
    
    // 同じfieldIndexの項目をまとめて取得
    const sameFieldItems = queue.filter(item => item.fieldIndex === currentItem.fieldIndex)
    const nextDifferentFieldIndex = queue.findIndex((item, idx) => idx > index && item.fieldIndex !== currentItem.fieldIndex)
    const nextIndex = nextDifferentFieldIndex === -1 ? queue.length : nextDifferentFieldIndex
    
    console.log(`[Insurance] Found ${sameFieldItems.length} items for field ${currentItem.fieldIndex}`)
    
    // フィールドにフォーカス（青色ハイライト）
    scrollToField(currentItem.fieldIndex)
    setPendingUserInput(currentItem.fieldIndex)
    
    // 同じフィールドの全ての値を一度に入力
    let updatedData = { ...currentData }
    sameFieldItems.forEach(item => {
      updatedData[item.key] = item.value
    })
    
    // 少し待ってから値を設定
    setTimeout(() => {
      setFormData(updatedData)
      
      // autoFill時はsessionStorageを更新しない（ユーザー入力のみ保存）
      console.log('[Insurance] Auto-fill data set (not saved to sessionStorage):', updatedData)
      
      // バリデーション通過後にのみ次に進む
      setTimeout(() => {
        // 現在のフィールドが回答済みになったかチェック
        const currentFieldItem = mainData[currentItem.fieldIndex]
        const isValidated = isFieldAnswered(currentFieldItem, updatedData)
        
        console.log(`[Insurance] Validation result for field ${currentItem.fieldIndex}: ${isValidated}, retry count: ${retryCount}`)
        
        if (isValidated) {
          // バリデーション通過：表示フィールド数を更新し、次の処理へ
          updateVisibleFieldIndex(updatedData)
          
          setTimeout(() => {
            processAutoFillQueue(queue, nextIndex, updatedData, 0) // 次の異なるfieldIndexへ
          }, 200)
        } else if (retryCount < 3) {
          // バリデーション未通過の場合は最大3回までリトライ
          console.log(`[Insurance] Retrying auto-fill for field ${currentItem.fieldIndex} (attempt ${retryCount + 1}/3)`)
          setTimeout(() => {
            processAutoFillQueue(queue, index, currentData, retryCount + 1)
          }, 500)
        } else {
          // 3回リトライしても失敗した場合は次の項目へスキップ
          console.log(`[Insurance] Max retry reached for field ${currentItem.fieldIndex}, skipping to next`)
          updateVisibleFieldIndex(updatedData)
          setTimeout(() => {
            processAutoFillQueue(queue, nextIndex, updatedData, 0)
          }, 200)
        }
      }, 300)
    }, 200)
  }

  // フォームデータ変更時の自動フォーカス処理（API入力時のみ）
  useEffect(() => {
    // APIからの自動入力後のみフォーカス機能を動作させる
    // 通常のユーザー入力では動作しない
  }, [formData, currentFieldIndex])

  // フォームデータに基づいて表示する項目インデックスを更新
  const updateVisibleFieldIndex = (data: any) => {
    const nextUnansweredIndex = findNextUnansweredField(data)
    const newFieldIndex = nextUnansweredIndex + 1
    setCurrentFieldIndex(newFieldIndex)
    console.log(`[Insurance] Updated field index to: ${newFieldIndex}`)
    
    // autoFillモード判定
    const autoFillModeActive = isInAutoFillMode()
    console.log(`[Insurance] AutoFill mode active: ${autoFillModeActive}`)
    
    // autoFillモードでない場合は、フォーカス処理を一切実行しない
    if (!autoFillModeActive) {
      console.log('[Insurance] 🚫 AutoFill mode not active - no focus handling')
      return
    }
    
    // autoFillモードの場合、自動入力中でなければフォーカス処理を実行
    if (!isAutoFilling) {
      setTimeout(() => {
        console.log(`[Insurance] 🟠 AutoFill mode - checking focus after field index update - next unfilled: ${nextUnansweredIndex}`)
        if (nextUnansweredIndex < mainData.length) {
          console.log(`[Insurance] 🟠 AutoFill mode - auto-focusing on field: ${nextUnansweredIndex}`)
          scrollToField(nextUnansweredIndex)
          setPendingUserInput(nextUnansweredIndex)
          
          // 3秒後にハイライトを解除
          setTimeout(() => setPendingUserInput(null), 3000)
        }
      }, 500)
    }
  }

  // 次の未回答項目のインデックスを見つける
  const findNextUnansweredField = (data: any): number => {
    for (let i = 0; i < mainData.length; i++) {
      if (!isFieldAnswered(mainData[i], data)) {
        return i
      }
    }
    return mainData.length
  }

  // 項目が回答済みかどうかをチェック（スマート版）
  const isFieldAnswered = (item: any, data: any): boolean => {
    console.log(`[Insurance] Checking if field is answered:`, item.question, data)
    
    // ラジオボタン
    if (item.radio?.name) {
      const isAnswered = data[item.radio.name] && data[item.radio.name] !== ''
      console.log(`[Insurance] Radio check for ${item.radio.name}: ${isAnswered}`)
      return isAnswered
    }
    
    // チェックボックスとセレクトボックスが両方ある場合
    if (item.checkbox?.options && item.select?.selects) {
      // チェックボックスが選択されている場合
      const hasCheckedOption = item.checkbox.options.some((_: any, index: number) => 
        data[`${item.checkbox.name}-${index}`] === true
      )
      if (hasCheckedOption) {
        console.log(`[Insurance] Checkbox checked for ${item.checkbox.name}`)
        return true
      }
      
      // または、全てのselectが選択されている場合
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
    
    // チェックボックスのみ（任意のオプションがチェック済み）
    if (item.checkbox?.options) {
      const hasCheckedOption = item.checkbox.options.some((_: any, index: number) => 
        data[`${item.checkbox.name}-${index}`] === true
      )
      if (hasCheckedOption) {
        console.log(`[Insurance] Checkbox-only field completed`)
        return true
      }
    }
    
    // セレクトボックスのみ（複数のselect要素がある場合は全て選択済みである必要がある）
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

  const updateFormData = (key: string, value: any) => {
    const updatedData = { ...formData, [key]: value }
    setFormData(updatedData)
    console.log('[Insurance] Form data updated:', updatedData)
    
    // 自動入力中でない場合のみsessionStorageに保存（ユーザー手動入力のみ保存）
    if (!isAutoFilling) {
      updateStepData(1, updatedData)
      console.log('[Insurance] User data saved to sessionStorage:', updatedData)
    } else {
      console.log('[Insurance] Auto-fill mode - skipping sessionStorage update')
    }
    
    // autoFillモード判定
    const autoFillModeActive = isInAutoFillMode()
    console.log(`[Insurance] AutoFill mode check in updateFormData: ${autoFillModeActive}`)
    
    // 条件に応じて次のフィールドを表示（フォーカス処理も含む）
    updateVisibleFieldIndex(updatedData)
    
    // autoFillモードで、自動入力セッション中のユーザー入力の場合のみ、再開をチェック
    if (autoFillModeActive && !isAutoFilling && shouldResumeAutoFill && originalAutoFillData) {
      console.log('[Insurance] User manual input during auto-fill session, checking for resume...')
      setTimeout(() => {
        resumeAutoFillFromData(updatedData)
      }, 1000)
    }
    // autoFillモードで、ユーザー入力後にautoFillセッションを開始する場合
    else if (autoFillModeActive && !isAutoFilling && !shouldResumeAutoFill && originalAutoFillData) {
      console.log('[Insurance] AutoFill mode active but no session - starting auto-fill from original data...')
      setShouldResumeAutoFill(true)
      setTimeout(() => {
        resumeAutoFillFromData(updatedData)
      }, 1000)
    }
    
    onChange?.()
  }

  // より簡単な自動入力再開ロジック
  const resumeAutoFillFromData = (currentData: any) => {
    if (isAutoFilling || !originalAutoFillData) return
    
    console.log('[Insurance] Checking for auto-fill resume...')
    console.log('[Insurance] Original data:', originalAutoFillData)
    console.log('[Insurance] Current data:', currentData)
    
    // 元データにあって現在データにない項目を見つける
    const missingFields: Array<{key: string, value: any, fieldIndex: number}> = []
    
    // すべてのキーをチェック
    Object.keys(originalAutoFillData).forEach((key) => {
      const originalValue = originalAutoFillData[key]
      const currentValue = currentData[key]
      
      // 元データに値があり、現在データに値がない場合
      if (originalValue && !currentValue && originalValue !== 'ご選択ください') {
        // このキーがどのフィールドに属するかを特定
        for (let i = 0; i < currentFieldIndex; i++) {
          const item = mainData[i]
          
          // ラジオボタンのキーかチェック
          if (item.radio?.name === key) {
            missingFields.push({ key, value: originalValue, fieldIndex: i })
            break
          }
          
          // セレクトボックスのキーかチェック
          if (item.select?.selects) {
            for (const select of item.select.selects) {
              if (select.name === key) {
                missingFields.push({ key, value: originalValue, fieldIndex: i })
                break
              }
            }
          }
          
          // チェックボックスのキーかチェック
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
      // 最初の未入力項目から再開
      setTimeout(() => {
        processAutoFillQueue(missingFields, 0, currentData, 0)
      }, 500)
    } else {
      // 全て完了
      setShouldResumeAutoFill(false)
      setOriginalAutoFillData(null)
      console.log('[Insurance] Auto-fill completely finished!')
    }
  }

  // 特定の項目にスクロール
  const scrollToField = (fieldIndex: number) => {
    const fieldElement = document.querySelector(`[data-field-index="${fieldIndex}"]`)
    if (fieldElement) {
      fieldElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
      console.log(`[Insurance] Scrolled to field ${fieldIndex}`)
    }
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  const renderField = (item: any, index: number) => {
    // 現在の表示範囲を超える項目は表示しない
    if (index >= currentFieldIndex) {
      return null
    }

    const shouldShow =
      !conditionalFields.hasOwnProperty(item.radio?.name || item.checkbox?.name || "") ||
      conditionalFields[item.radio?.name || item.checkbox?.name || ""]

    if (!shouldShow) return null

    const isHighlighted = pendingUserInput === index
    const isAutoFillHighlight = isHighlighted && isAutoFilling
    const isManualHighlight = isHighlighted && !isAutoFilling
    
    let cardClassName = "mb-6 transition-all duration-300 ease-in-out"
    
    if (isAutoFillHighlight) {
      // 自動入力時は青色ハイライト
      cardClassName += " border-2 border-blue-400 bg-blue-50 shadow-lg"
    } else if (isManualHighlight) {
      // 通常時はオレンジ色ハイライト
      cardClassName += " border-2 border-orange-400 bg-orange-50 shadow-lg"
    }

    return (
      <Card key={index} className={cardClassName} data-field-index={index}>
        <CardContent className="p-4">
          <Label className="text-base font-medium mb-4 block">{item.question}</Label>

          {item.radio && (
            <RadioGroup
              value={formData[item.radio.name] || ""}
              onValueChange={(value) => updateFormData(item.radio.name, value)}
              className="space-y-2"
            >
              {item.radio.options.map((option: string, optIndex: number) => (
                <div key={optIndex} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={option} 
                    id={`${item.radio.name}-${optIndex}`}
                    className="border-blue-500 text-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" 
                  />
                  <Label htmlFor={`${item.radio.name}-${optIndex}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {item.checkbox && (
            <div className="space-y-2 mt-4">
              {item.checkbox.options.map((option: string, optIndex: number) => (
                <div key={optIndex} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${item.checkbox.name}-${optIndex}`}
                    checked={formData[`${item.checkbox.name}-${optIndex}`] || false}
                    onCheckedChange={(checked) => updateFormData(`${item.checkbox.name}-${optIndex}`, checked)}
                    className="border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label htmlFor={`${item.checkbox.name}-${optIndex}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {item.select && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {item.select.selects.map((select: any, selectIndex: number) => {
                let placeholder = "選択してください"
                if (select.name && select.name.includes("datey")) placeholder = "年"
                else if (select.name && select.name.includes("datem")) placeholder = "月"
                else if (select.name && select.name.includes("dated")) placeholder = "日"

                return (
                  <div key={selectIndex}>
                    <Select
                      value={formData[select.name] || ""}
                      onValueChange={(value) => updateFormData(select.name, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {select.options.map((option: string, optIndex: number) => (
                          <SelectItem key={optIndex} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 進捗ヒント */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-600">
          📝 質問に順次回答いただくと、次の関連項目が自動的に表示されます
        </p>
        <p className="text-xs text-blue-500 mt-1">
          既に保存されたデータがある場合は、自動的に復元されます
        </p>
      </div>

      {mainData.map((item, index) => renderField(item, index))}

      {/* 完了項目数の表示 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            回答済み: {Object.keys(formData).filter(key => formData[key] && formData[key] !== '').length} 項目
          </p>
          <p className="text-xs text-gray-500">
            表示中: {currentFieldIndex} / {mainData.length} 項目
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button type="submit" className="px-8">
          次へ進む
        </Button>
      </div>
    </form>
  )
}
