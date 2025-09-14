"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { isFieldEnabled, type FormField } from "@/utils/form-config"

interface FormFieldRendererProps {
  field: FormField
  formData: any
  updateFormData: (key: string, value: string) => void
}

export function FormFieldRenderer({ field, formData, updateFormData }: FormFieldRendererProps) {
  const renderRadioField = (radioConfig: NonNullable<FormField["radio"]>) => {
    const isEnabled = isFieldEnabled(radioConfig.name)

    return (
      <div className={`space-y-3 ${!isEnabled ? "opacity-50" : ""}`}>
        <RadioGroup
          value={formData[radioConfig.name] || ""}
          onValueChange={(value) => isEnabled && updateFormData(radioConfig.name, value)}
          disabled={!isEnabled}
          className="space-y-2"
        >
          {radioConfig.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${radioConfig.name}-${index}`} disabled={!isEnabled} />
              <Label
                htmlFor={`${radioConfig.name}-${index}`}
                className={`text-sm ${!isEnabled ? "text-gray-400" : ""}`}
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
    const isEnabled = isFieldEnabled(checkboxConfig.name)

    return (
      <div className={`space-y-2 ${!isEnabled ? "opacity-50" : ""}`}>
        {checkboxConfig.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              id={`${checkboxConfig.name}-${index}`}
              disabled={!isEnabled}
              checked={formData[`${checkboxConfig.name}-${index}`] || false}
              onCheckedChange={(checked) =>
                isEnabled && updateFormData(`${checkboxConfig.name}-${index}`, checked ? "true" : "false")
              }
            />
            <Label
              htmlFor={`${checkboxConfig.name}-${index}`}
              className={`text-sm ${!isEnabled ? "text-gray-400" : ""}`}
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
        {selectConfig.selects.map((select, index) => {
          const isEnabled = isFieldEnabled(select.name)

          return (
            <div key={index} className={!isEnabled ? "opacity-50" : ""}>
              <Select
                value={formData[select.name] || ""}
                onValueChange={(value) => isEnabled && updateFormData(select.name, value)}
                disabled={!isEnabled}
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
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <Label className="text-base font-medium block">
        {field.question}
        {(!field.radio || !isFieldEnabled(field.radio.name)) &&
          (!field.checkbox || !isFieldEnabled(field.checkbox.name)) &&
          (!field.select || !field.select.selects.some((s) => isFieldEnabled(s.name))) && (
            <span className="ml-2 text-xs text-gray-400 font-normal">(無効)</span>
          )}
      </Label>

      {field.radio && renderRadioField(field.radio)}
      {field.checkbox && renderCheckboxField(field.checkbox)}
      {field.select && renderSelectField(field.select)}
    </div>
  )
}
