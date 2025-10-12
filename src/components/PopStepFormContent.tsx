import { useMemo, useEffect } from "react";
import { useToast } from "../hooks/use-toast";
import { usePopup } from "@/src/components/ui/popup";
import { Button } from "@/src/components/ui/button";
import { FormItem } from "../types/form-data";
import { useFormVisibility } from "../hooks/use-form-visibility";
import { FormField } from "./FormField";
import { useSessionStorage } from "../hooks/use-session-storage";
import { useAutoFillForm } from "../hooks/use-auto-fill-form";
import { useAutoFillHighlight } from "../hooks/use-auto-fill-highlight";

interface StepFormProps {
  mainData: FormItem[];
  stepNumber: number;
  onNext?: (data: any) => void;
  onPrevious?: () => void;
  onSubmit?: (data: any) => void;
  nextButtonText?: string;
  previousButtonText?: string;
  submitButtonText?: string;
  enableAutoFillDelay?: boolean;
}

export function PopStepFormContent({
  mainData,
  stepNumber,
  onNext,
  onPrevious,
  onSubmit,
  nextButtonText = "次へ進む",
  previousButtonText = "前に戻る",
  submitButtonText = "見積もりを取得する",
  enableAutoFillDelay = false,
}: StepFormProps) {
  const { visibleIndex, formData, handleFieldChange } = useFormVisibility(mainData);
  const { isAutoFillEnabled, getStepData } = useSessionStorage();
  const autoFillEnabled = isAutoFillEnabled();
  const stepDataValues = getStepData(stepNumber);

  const formValuesObject = useMemo(() => {
    if (!autoFillEnabled || !Array.isArray(stepDataValues)) {
      return null;
    }
    return stepDataValues.reduce((acc: Record<string, any>, item: any) => {
      if (item.radio && item.radio.name) {
        acc[item.radio.name] = item.radio.value;
      }
      if (item.select && item.select.selects) {
        item.select.selects.forEach((select: any) => {
          if (select.name && select.value) {
            acc[select.name] = select.value;
          }
        });
      }
      return acc;
    }, {});
  }, [stepDataValues, autoFillEnabled]);

  const { toast } = useToast();
  const { showLoading, showCompletion } = usePopup();
  const { isAutoFilling, isAutoFillComplete, focusAndScrollToField } = useAutoFillForm(
    autoFillEnabled ? mainData : null,
    formValuesObject,
    handleFieldChange,
    () => {
      showCompletion({
        title: "自動入力が完了しました",
        description: "画像の内容をもとにフォームが自動入力されました。残りの項目を入力してください。",
      });
    },
    enableAutoFillDelay
  );

  useEffect(() => {
    if (isAutoFilling) {
      showLoading({ title: "自動入力中...", description: "画像を解析してフォームに入力しています", spinner: true });
    }
  }, [isAutoFilling, showLoading]);

  const highlightedFields = useAutoFillHighlight(
    mainData,
    formData,
    isAutoFillComplete
  );

  const isFieldHighlighted = (item: FormItem): boolean => {
    const keys: string[] = [];
    if (item.radio?.name) keys.push(item.radio.name);
    if (item.checkbox?.name) {
      item.checkbox.options?.forEach((o, i) => keys.push(`${item.checkbox!.name}-${i}`))}
    if (item.select?.selects) {
      item.select.selects.forEach(s => keys.push(s.name));
    }
    return keys.some(key => highlightedFields.has(key));
  };

  // Handle focus for manual input in pop-step (one question at a time)
  // Only activate focus after autofill is enabled
  useEffect(() => {
    if (autoFillEnabled && !isAutoFilling && visibleIndex < mainData.length) {
      // Use setTimeout to ensure focus logic runs after DOM update
      setTimeout(() => {
        focusAndScrollToField(visibleIndex);
      }, 100);
    }
  }, [visibleIndex, isAutoFilling, focusAndScrollToField, mainData.length, autoFillEnabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
    else if (onNext) {
      onNext(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mainData.slice(0, visibleIndex + 1).map((item, index) => (
        <FormField
          key={index}
          item={item}
          onChange={handleFieldChange}
          index={index}
          formData={formData}
          isHighlighted={isFieldHighlighted(item)}
        />
      ))}
      <div className={`flex ${onPrevious ? 'justify-between' : 'justify-end'} pt-6`}>
        {onPrevious && (
          <Button type="button" variant="outline" onClick={onPrevious}>
            {previousButtonText}
          </Button>
        )}
        <Button type="submit" className="px-8">
          {onSubmit ? submitButtonText : nextButtonText}
        </Button>
      </div>
    </form>
  );
}
