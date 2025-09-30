import page1 from "@/src/data/page1.json";
import { StepForm } from "./StepForm";

interface InsuranceContractFormProps {
  onNext: (data: any) => void;
}

export function InsuranceContractForm({ onNext }: InsuranceContractFormProps) {
  return <StepForm mainData={page1} stepNumber={1} onNext={onNext} />;
}