import { useEffect, useState, useRef, useCallback } from "react";
import { FormItem } from "../types/form-data";

interface AutoFillItem {
  key: string;
  value: any;
  fieldIndex: number;
}

export function useAutoFillForm(
  formStructure: FormItem[] | null,
  formValues: Record<string, any> | null,
  onChange: (key: string, value: any, options?: { autoFilling?: boolean }) => void,
  onAutoFillComplete?: () => void
) {
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isAutoFillComplete, setIsAutoFillComplete] = useState(false);
  const [autoFillQueue, setAutoFillQueue] = useState<AutoFillItem[]>([]);
  const onChangeRef = useRef(onChange);
  const onAutoFillCompleteRef = useRef(onAutoFillComplete);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    onAutoFillCompleteRef.current = onAutoFillComplete;
  }, [onAutoFillComplete]);

  const focusAndScrollToField = useCallback((fieldIndex: number) => {
    const el = document.querySelector(
      `[data-field-index="${fieldIndex}"] input, [data-field-index="${fieldIndex}"] select, [data-field-index="${fieldIndex}"] [role="radiogroup"]`
    );
    if (el && typeof (el as HTMLElement).focus === "function") {
      if (document.activeElement !== el) {
        (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
        (el as HTMLElement).focus();
      }
    }
  }, []);

  const startSequentialAutoFill = () => {
    if (!formStructure || !formValues) return;

    const fieldsToAutoFill: AutoFillItem[] = formStructure
      .map((item, index) => {
        let value;
        let key;

        if (item.radio?.name) {
          key = item.radio.name;
          value = formValues[key];
          if (value) {
            return { key, value, fieldIndex: index };
          }
        }

        if (item.select?.selects) {
          return item.select.selects.map((select) => {
            key = select.name;
            value = formValues[key];
            if (value) {
              return { key, value, fieldIndex: index };
            }
            return null;
          }).filter(Boolean);
        }

        return null;
      })
      .flat()
      .filter(Boolean) as AutoFillItem[];

    if (fieldsToAutoFill.length > 0) {
      setAutoFillQueue(fieldsToAutoFill);
      setIsAutoFilling(true);
      setIsAutoFillComplete(false);
    } else {
      setIsAutoFillComplete(true);
      if (onAutoFillCompleteRef.current) {
        onAutoFillCompleteRef.current();
      }
    }
  };

  useEffect(() => {
    if (isAutoFilling && autoFillQueue.length > 0) {
      const processQueue = (index: number) => {
        if (index >= autoFillQueue.length) {
          setIsAutoFilling(false);
          setAutoFillQueue([]);
          setIsAutoFillComplete(true);
          if (onAutoFillCompleteRef.current) {
            onAutoFillCompleteRef.current();
          }
          return;
        }

        const currentItem = autoFillQueue[index];
        focusAndScrollToField(currentItem.fieldIndex);
        onChangeRef.current(currentItem.key, currentItem.value, { autoFilling: true });

        setTimeout(() => {
          processQueue(index + 1);
        }, 300);
      };

      processQueue(0);
    }
  }, [isAutoFilling, autoFillQueue, focusAndScrollToField]);

  useEffect(() => {
    if (formStructure && formValues && !isAutoFilling && autoFillQueue.length === 0) {
      startSequentialAutoFill();
    }
  }, [formStructure, formValues]);

  return {
    isAutoFilling,
    isAutoFillComplete,
    focusAndScrollToField,
  };
}
