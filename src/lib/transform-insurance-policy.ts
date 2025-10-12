import type { InsurancePolicy } from "../types/insurancePolicy";
import type { FormItem } from "../types/form-data";

// InsurancePolicy型からresponse.json形式(FormItem[])へ変換
export function transformInsurancePolicy(policy: InsurancePolicy): FormItem[] {
  return [
    {
      question: "現在契約中の保険会社（共済）をご選択ください。",
      radio: {
        type: "radio",
        name: "radPreContInsco",
        value: policy.insuranceCompany ?? ""
      },
      checkbox: {
        type: "checkbox",
        name: "radPreContInsco",
        values: []
      }
    },
    {
      question: "現在のご契約は1年契約（1年ごとに更新する契約）ですか？",
      radio: {
        type: "radio",
        name: "contentsform:radPrevcontyear",
        value: policy.isOneYearContract ? "1年契約である" : "1年契約ではない"
      }
    },
    {
      question: "現在のご契約の満期日をご選択ください。",
      checkbox: {
        type: "checkbox",
        name: "contentsform:chkPrevContMatrUnkwn",
        values: []
      },
      select: {
        type: "select",
        selects: [
          {
            id: "contentsform:sltOcrdatey",
            name: "contentsform:sltOcrdatey",
            value: policy.expiryDate?.year ? `${policy.expiryDate.year}年` : ""
          },
          {
            id: "contentsform:sltOcrdatem",
            name: "contentsform:sltOcrdatem",
            value: policy.expiryDate?.month ? `${policy.expiryDate.month}月` : ""
          },
          {
            id: "contentsform:sltOcrdated",
            name: "contentsform:sltOcrdated",
            value: policy.expiryDate?.day ? `${policy.expiryDate.day}日` : ""
          }
        ]
      }
    },
    {
      question: "現在のご契約の保険期間をご選択ください。",
      checkbox: {
        type: "checkbox",
        name: "contentsform:chkPrevContCcdateUnkwn",
        values: []
      },
      select: {
        type: "select",
        selects: [
          {
            id: "contentsform:sltOccdatey",
            name: "contentsform:sltOccdatey",
            value: policy.insurancePeriod?.start?.year ? `${policy.insurancePeriod.start.year}年` : ""
          },
          {
            id: "contentsform:sltOccdatem",
            name: "contentsform:sltOccdatem",
            value: policy.insurancePeriod?.start?.month ? `${policy.insurancePeriod.start.month}月` : ""
          },
          {
            id: "contentsform:sltOccdated",
            name: "contentsform:sltOccdated",
            value: policy.insurancePeriod?.start?.day ? `${policy.insurancePeriod.start.day}日` : ""
          },
          {
            id: "contentsform:sltOcrdateyMult",
            name: "contentsform:sltOcrdateyMult",
            value: policy.insurancePeriod?.end?.year ? `${policy.insurancePeriod.end.year}年` : ""
          },
          {
            id: "contentsform:sltOcrdatemMult",
            name: "contentsform:sltOcrdatemMult",
            value: policy.insurancePeriod?.end?.month ? `${policy.insurancePeriod.end.month}月` : ""
          },
          {
            id: "contentsform:sltOcrdatedMult",
            name: "contentsform:sltOcrdatedMult",
            value: policy.insurancePeriod?.end?.day ? `${policy.insurancePeriod.end.day}日` : ""
          }
        ]
      }
    },
    {
      question: "現在のノンフリート等級をご選択ください。",
      checkbox: {
        type: "checkbox",
        name: "contentsform:chkManyHokenkikan",
        values: []
      },
      select: {
        type: "select",
        selects: [
          {
            id: "contentsform:sltBprefcl",
            name: "contentsform:sltBprefcl",
            value: policy.nonFleetGrade ?? ""
          }
        ]
      }
    },
    {
      question: "現在の事故あり係数適用期間（事故あり期間）をご選択ください。",
      radio: {
        type: "radio",
        name: "contentsform:sltAcdtapply",
        value: policy.accidentCoefficientPeriod ?? ""
      },
      checkbox: {
        type: "checkbox",
        name: "contentsform:chkAcdtapplyUnkwn",
        values: []
      }
    },
    {
      question: "初度登録年月（初度検査年月）をご選択ください。",
      checkbox: {
        type: "checkbox",
        name: "contentsform:chkRgstDte",
        values: []
      },
      select: {
        type: "select",
        selects: [
          {
            id: "contentsform:lstRgstdtegy",
            name: "contentsform:lstRgstdtegy",
            value: policy.firstRegistrationYear?.year ? `${policy.firstRegistrationYear.year}年` : ""
          },
          {
            id: "contentsform:lstRgstdtem",
            name: "contentsform:lstRgstdtem",
            value: policy.firstRegistrationYear?.month ? `${policy.firstRegistrationYear.month}月` : ""
          }
        ]
      }
    },
    {
      question: "お車の型式・車名を教えてください。",
      radio: {
        type: "radio",
        name: "contentsform:radBvehtyp",
        value: policy.vehicleModel ?? ""
      }
    },
    {
      question: "車名をご選択ください。",
      radio: {
        type: "radio",
        name: "contentsform:vehicleName",
        value: policy.vehicleName ?? ""
      }
    },
    {
      question: "お車の使用目的をご選択ください。",
      radio: {
        type: "radio",
        name: "contentsform:radCommuse",
        value: policy.vehicleUsage ?? ""
      }
    },
    {
      question: "主にお車を使用される方（記名被保険者）は、どなたですか？ （お1人だけご選択ください）",
      radio: {
        type: "radio",
        name: "contentsform:radBinslbzkc",
        value: policy.insuredPersonName ?? ""
      }
    },
    {
      question: "主にお車を使用される方（記名被保険者）の生年月日をご選択ください。",
      select: {
        type: "select",
        selects: [
          {
            id: "contentsform:sltBinslbdoby",
            name: "contentsform:sltBinslbdoby",
            value: policy.insuredPersonDob?.year ? `${policy.insuredPersonDob.year}年` : ""
          },
          {
            id: "contentsform:sltBinslbdobm",
            name: "contentsform:sltBinslbdobm",
            value: policy.insuredPersonDob?.month ? `${policy.insuredPersonDob.month}月` : ""
          },
          {
            id: "contentsform:sltBinslbdobd",
            name: "contentsform:sltBinslbdobd",
            value: policy.insuredPersonDob?.day ? `${policy.insuredPersonDob.day}日` : ""
          }
        ]
      }
    },
    {
      question: "主にお車を使用される方（記名被保険者）の運転免許証の色をご選択ください。",
      radio: {
        type: "radio",
        name: "contentsform:radBlicensecol",
        value: policy.licenseColor ?? ""
      }
    }
  ];
}
