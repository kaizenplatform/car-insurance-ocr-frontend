import page2 from "@/src/data/page2.json";
import { StepForm } from "./StepForm";

interface VehicleInfoFormProps {
  onNext: (data: any) => void;
  onPrevious: () => void;
}

export function VehicleInfoForm({ onNext, onPrevious }: VehicleInfoFormProps) {
  return (
    <StepForm mainData={page2} stepNumber={2} onNext={onNext} onPrevious={onPrevious} />
  );
}
