import page3 from "@/src/data/page3.json";
import { StepForm } from "./StepForm";

interface PersonalInfoFormProps {
  onSubmit: (data: any) => void;
  onPrevious: () => void;
}

export function PersonalInfoForm({ onSubmit, onPrevious }: PersonalInfoFormProps) {
  return (
    <StepForm
      mainData={page3}
      stepNumber={3}
      onSubmit={onSubmit}
      onPrevious={onPrevious}
      submitButtonText="見積もりを取得する"
    />
  );
}