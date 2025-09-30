import { useEffect, useState } from "react";

export function usePrefillForm(step: number) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    // Retrieve data from sessionStorage for the given step
    const savedData = sessionStorage.getItem(`step${step}`);
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, [step]);

  return { formData, setFormData };
}
