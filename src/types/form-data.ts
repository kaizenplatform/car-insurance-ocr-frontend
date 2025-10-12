export interface FormData {
  insuranceContract: Record<string, string | boolean | undefined>
  vehicleInfo: Record<string, string | boolean | undefined>
  personalInfo: Record<string, string | boolean | undefined>
}

export interface RadioField {
  type: "radio" | string;
  name: string;
  value?: string;
  options?: string[];
}

export interface SelectField {
  type: "select" | string;
  selects: Array<{
    id: string;
    name: string;
    value?: string;
  }>;
  options?: string[];
}

export interface CheckboxField {
  type: "checkbox" | string;
  name: string;
  values?: string[];
  options?: string[];
}

export interface FormItem {
  question: string;
  radio?: RadioField;
  select?: SelectField;
  checkbox?: CheckboxField;
}

export interface Page1 {
  "radPreContInsco"?: string;
  "contentsform:radPrevcontyear"?: string;
  "contentsform:sltOcrdatey"?: string;
  "contentsform:sltOcrdatem"?: string;
  "contentsform:sltOcrdated"?: string;
  "contentsform:sltOccdatey"?: string;
  "contentsform:sltOccdatem"?: string;
  "contentsform:sltOccdated"?: string;
  "contentsform:sltOcrdateyMult"?: string;
  "contentsform:sltOcrdatemMult"?: string;
  "contentsform:sltOcrdatedMult"?: string;
  "contentsform:sltBprefcl"?: string;
  "contentsform:sltAcdtapply"?: string;
  "contentsform:chkRgstDte"?: boolean;
  "contentsform:radBvehtyp"?: string;
  "contentsform:radCommuse"?: string;
  "contentsform:radBinslbzkc"?: string;
  "contentsform:sltBinslbdoby"?: string;
  "contentsform:sltBinslbdobm"?: string;
  "contentsform:sltBinslbdobd"?: string;
}

export interface Page2 {
  "contentsform:lstRgstdtegy"?: string;
  "contentsform:lstRgstdtem"?: string;
  "contentsform:radBvehtyp"?: string;
  "contentsform:radCommuse"?: string;
  "contentsform:radDumpcar"?: string;
  "contentsform:radAebDvcePhSel"?: string;
  "contentsform:radCntrange"?: string;
}

export interface Page3 {
  "contentsform:radBinslbzkc"?: string;
  "contentsform:sltBinslbdoby"?: string;
  "contentsform:sltBinslbdobm"?: string;
  "contentsform:sltBinslbdobd"?: string;
  "contentsform:radBlicensecol"?: string;
}

export interface FormDataResponse {
  step1: FormItem[];
  step2: FormItem[];
  step3: FormItem[];
}
