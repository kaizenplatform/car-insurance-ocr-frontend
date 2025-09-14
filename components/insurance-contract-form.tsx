"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import page1Data from "@/data/page1.json"
import mainData from "@/data/main.json"

interface InsuranceContractFormProps {
  initialData: any
  onNext: (data: any) => void
}

export function InsuranceContractForm({ initialData, onNext }: InsuranceContractFormProps) {
  const [formData, setFormData] = useState(initialData)
  const [conditionalFields, setConditionalFields] = useState<Record<string, boolean>>({})

  const enabledFields = new Set()
  mainData.forEach((item: any) => {
    if (item.radio?.name) enabledFields.add(item.radio.name)
    if (item.checkbox?.name) enabledFields.add(item.checkbox.name)
    if (item.select?.selects) {
      item.select.selects.forEach((select: any) => {
        if (select.name) enabledFields.add(select.name)
      })
    }
  })

  const isFieldEnabled = (fieldName: string) => enabledFields.has(fieldName)

  const updateFormData = (name: string, value: string | boolean) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }))

    handleConditionalFields(name, value)
  }

  const handleConditionalFields = (fieldName: string, value: string | boolean) => {
    const newConditionalFields = { ...conditionalFields }

    // Example conditional logic - show accident type when accidents exist
    if (fieldName === "contentsform:radPrevContAccExst" && value !== "事故なし") {
      newConditionalFields["contentsform:radAcctyp"] = true
    } else if (fieldName === "contentsform:radPrevContAccExst" && value === "事故なし") {
      newConditionalFields["contentsform:radAcctyp"] = false
    }

    // Show previous contract questions when "いいえ" is selected
    if (fieldName === "contentsform:prePrevContJoinSts" && value === "いいえ") {
      newConditionalFields["contentsform:prePrevContJoinStsPriod"] = true
    } else if (fieldName === "contentsform:prePrevContJoinSts" && value !== "いいえ") {
      newConditionalFields["contentsform:prePrevContJoinStsPriod"] = false
    }

    setConditionalFields(newConditionalFields)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  const renderField = (item: any, index: number) => {
    const isEnabled = isFieldEnabled(item.radio?.name || item.checkbox?.name || "")
    const shouldShow =
      !conditionalFields.hasOwnProperty(item.radio?.name || item.checkbox?.name || "") ||
      conditionalFields[item.radio?.name || item.checkbox?.name || ""]

    if (!shouldShow) return null

    return (
      <Card key={index} className={`mb-6 ${!isEnabled ? "opacity-50 bg-gray-50" : ""}`}>
        <CardContent className="p-4">
          <Label className="text-base font-medium mb-4 block">{item.question}</Label>

          {item.radio && (
            <RadioGroup
              value={formData[item.radio.name] || ""}
              onValueChange={(value) => updateFormData(item.radio.name, value)}
              disabled={!isEnabled}
              className="space-y-2"
            >
              {item.radio.options.map((option: string, optIndex: number) => (
                <div key={optIndex} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${item.radio.name}-${optIndex}`} />
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
                    disabled={!isEnabled}
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
              {item.select.selects.map((select: any, selectIndex: number) => (
                <div key={selectIndex}>
                  <Select
                    value={formData[select.name] || ""}
                    onValueChange={(value) => updateFormData(select.name, value)}
                    disabled={!isEnabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {page1Data.map((item, index) => renderField(item, index))}

      <div className="flex justify-end pt-6">
        <Button type="submit" className="px-8">
          次へ進む
        </Button>
      </div>
    </form>
  )
}
