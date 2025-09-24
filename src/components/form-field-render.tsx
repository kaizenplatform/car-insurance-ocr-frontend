"use client"

import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Checkbox } from "@/src/components/ui/checkbox"
import { isFieldEnabled, type FormField } from "@/src/utils/form-config"

interface FormFieldRendererProps {
  field: FormField
  formData: any
  updateFormData: (key: string, value: string) => void
}

export function FormFieldRenderer({ field, formData, updateFormData }: FormFieldRendererProps) {
  const renderRadioField = (radioConfig: NonNullable<FormField["radio"]>) => {
    return (
      <div className="space-y-3">
        <RadioGroup
          value={formData[radioConfig.name] || ""}
          onValueChange={(value) => updateFormData(radioConfig.name, value)}
          className="space-y-2"
        >
          {radioConfig.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={option} 
                id={`${radioConfig.name}-${index}`} 
                className="border-blue-500 text-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" 
              />
              <Label
                htmlFor={`${radioConfig.name}-${index}`}
                className="text-sm"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    )
  }

  const renderCheckboxField = (checkboxConfig: NonNullable<FormField["checkbox"]>) => {
    return (
      <div className="space-y-2">
        {checkboxConfig.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              id={`${checkboxConfig.name}-${index}`}
              checked={formData[`${checkboxConfig.name}-${index}`] || false}
              onCheckedChange={(checked) =>
                updateFormData(`${checkboxConfig.name}-${index}`, checked ? "true" : "false")
              }
              className="border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
            />
            <Label
              htmlFor={`${checkboxConfig.name}-${index}`}
              className="text-sm"
            >
              {option}
            </Label>
          </div>
        ))}
      </div>
    )
  }

  const renderSelectField = (selectConfig: NonNullable<FormField["select"]>) => {
    return (
      <div className="flex gap-4 flex-wrap">
        {selectConfig.selects.map((select, index) => (
          <div key={index}>
            <Select
              value={formData[select.name] || ""}
              onValueChange={(value) => updateFormData(select.name, value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                {select.options.map((option, optionIndex) => (
                  <SelectItem key={optionIndex} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <Label className="text-base font-medium block">
        {field.question}
      </Label>

      {field.radio && renderRadioField(field.radio)}
      {field.checkbox && renderCheckboxField(field.checkbox)}
      {field.select && renderSelectField(field.select)}
    </div>
  )
}
