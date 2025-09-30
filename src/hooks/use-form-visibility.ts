import { useState, useCallback } from "react";
import { FormItem } from "../types/form-data";

// itemが回答済みかどうかをチェックするヘルパー関数
function isAnswered(item: FormItem, formData: Record<string, any>): boolean {
  // Case 1: Select-only questions (all parts must be filled)
  if (item.select && !item.radio && !item.checkbox) {
    return item.select.selects.every(s => {
      const value = formData[s.name];
      return typeof value === 'string' && value !== '';
    });
  }

  // Case 2: Checkbox only (no radio/select)
  if (item.checkbox && !item.radio && !item.select) {
    const values = formData[item.checkbox.name];
    return Array.isArray(values) && values.length > 0;
  }

  // Case 3: Mixed (radio/select/checkbox)
  // どれか1つでも回答されていればOK
  const keysToCheck: string[] = [];
  if (item.radio?.name) {
    keysToCheck.push(item.radio.name);
  }
  if (item.select?.selects) {
    item.select.selects.forEach(s => keysToCheck.push(s.name));
  }
  if (item.checkbox?.name) {
    keysToCheck.push(item.checkbox.name);
  }

  return keysToCheck.some(key => {
    const value = formData[key];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value === true || (typeof value === 'string' && value !== '');
  });
}

export function useFormVisibility(initialData: FormItem[]) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleFieldChange = useCallback((fieldName: string, value: any, options?: { autoFilling?: boolean; checkboxGroup?: boolean; optionValue?: string }) => {
    setFormData((currentFormData) => {
      // checkboxグループの場合は配列で管理
      if (options?.checkboxGroup && options.optionValue) {
        const arr = Array.isArray(currentFormData[fieldName]) ? [...currentFormData[fieldName]] : [];
        if (value) {
          // 追加
          if (!arr.includes(options.optionValue)) arr.push(options.optionValue);
        } else {
          // 削除
          return {
            ...currentFormData,
            [fieldName]: arr.filter(v => v !== options.optionValue),
          };
        }
        return {
          ...currentFormData,
          [fieldName]: arr,
        };
      }
      // 通常のinput
      return {
        ...currentFormData,
        [fieldName]: value,
      };
    });
  }, []);

  // formDataが変更されるたびに、表示すべきインデックスを再計算する
  let firstUnansweredIndex = initialData.findIndex(item => !isAnswered(item, formData));

  // すべて回答済みの場合は、全項目を表示する
  if (firstUnansweredIndex === -1) {
    firstUnansweredIndex = initialData.length;
  }

  // 表示するインデックスは、最初の未回答の質問のインデックス
  const visibleIndex = firstUnansweredIndex;

  return {
    visibleIndex,
    formData,
    handleFieldChange,
  };
}
