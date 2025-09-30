import React from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";
import { FormItem } from "../types/form-data";
import { cn } from "../lib/utils";

interface FormFieldProps {
  item: FormItem;
  onChange: (fieldName: string, value: any, options?: { autoFilling?: boolean; checkboxGroup?: boolean; optionValue?: string }) => void;
  index: number;
  formData: Record<string, any>;
  isHighlighted: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({ item, onChange, index, formData, isHighlighted }) => {
  return (
    <Card 
      key={index} 
      data-field-index={index}
      className={cn("transition-all duration-300 ease-in-out", {
        "border-2 border-orange-500": isHighlighted,
      })}
    >
      <CardContent className="p-4">
        {/* メイン質問ラベルは最初のinput/checkbox/selectのidと紐付ける */}
        <Label className="text-base font-medium mb-4 block" htmlFor={
          item.radio?.name ? `${item.radio.name}-0` :
          item.checkbox?.name ? `${item.checkbox.name}-0` :
          item.select?.selects?.[0]?.name ? `${item.select.selects[0].name}-0` : undefined
        }>
          {item.question}
        </Label>

        {item.radio && (
          <RadioGroup
            name={item.radio.name}
            value={formData[item.radio.name] || ""}
            className="space-y-2"
            onValueChange={(value) => onChange(item.radio!.name, value)}
          >
            {item.radio.options?.map((option: string, optIndex: number) => (
              <div key={optIndex} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option}
                  id={`${item.radio?.name}-${optIndex}`}
                  className="border-blue-500 text-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <Label htmlFor={`${item.radio?.name}-${optIndex}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {item.checkbox && item.checkbox.options && (
          <div className="space-y-2 mt-4">
            {item.checkbox.options.map((option: string, optIndex: number) => {
              // item.checkboxはこのスコープ内でundefinedにならない
              const checkboxName = item.checkbox!.name;
              return (
                <div key={optIndex} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${checkboxName}-${optIndex}`}
                    checked={Array.isArray(formData[checkboxName]) ? formData[checkboxName].includes(option) : false}
                    className="border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    onCheckedChange={(checked) =>
                      onChange(checkboxName, checked, { checkboxGroup: true, optionValue: option })
                    }
                  />
                  <Label htmlFor={`${checkboxName}-${optIndex}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        )}

        {item.select && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {item.select.selects.map((select: any, selectIndex: number) => {
              let placeholder = "選択してください";
              if (select.name && select.name.includes("datey")) placeholder = "年";
              else if (select.name && select.name.includes("datem")) placeholder = "月";
              else if (select.name && select.name.includes("dated")) placeholder = "日";

              return (
                <div key={selectIndex}>
                  <Select
                    value={formData[select.name] || ""}
                    onValueChange={(value) => onChange(select.name, value, {})}
                  >
                    <SelectTrigger id={`${select.name}-${selectIndex}`}>
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
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
