import { useState, useEffect } from 'react';
import { FormItem } from '../types/form-data';

export function useAutoFillHighlight(
  formStructure: FormItem[] | null,
  formData: Record<string, any>,
  isAutoFillComplete: boolean
) {
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isAutoFillComplete && formStructure) {
      const unansweredFields = new Set<string>();

      formStructure.forEach(item => {
        let isAnswered = false;
        const keys: string[] = [];
        if (item.radio?.name) keys.push(item.radio.name);
        if (item.checkbox?.name) keys.push(item.checkbox.name);
        if (item.select?.selects) {
          item.select.selects.forEach(s => keys.push(s.name));
        }

        isAnswered = keys.some(key => formData[key] !== undefined && formData[key] !== null && formData[key] !== '');

        if (!isAnswered) {
          keys.forEach(key => unansweredFields.add(key));
        }
      });

      setHighlightedFields(unansweredFields);
    }
  }, [isAutoFillComplete, formStructure, formData]);

  return highlightedFields;
}
