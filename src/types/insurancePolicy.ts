const INSURANCE_COMPANY_OPTIONS = [
  "損保ジャパン",
  "東京海上日動火災",
  "三井住友海上",
  "あいおいニッセイ同和損保",
  "アクサ損保（アクサダイレクト）",
  "ＳＯＭＰＯダイレクト（セゾン自動車火災）",
  "チューリッヒ",
  "イーデザイン損保",
  "ＳＢＩ損保",
  "三井ダイレクト",
  "ＪＡ共済",
  "楽天損保",
  "全労済（マイカー共済）",
  "ＡＩＧ損害保険",
  "日新火災海上",
  "共栄火災海上",
  "全国自動車共済",
  "セコム損保",
  "チャブ（エース）",
  "大同火災海上",
  "全日本火災共済（旧中小企業共済）",
  "ニューインディア",
  "その他",
] as const;

type InsuranceCompanyOption = (typeof INSURANCE_COMPANY_OPTIONS)[number];
const NON_FLEET_GRADE_OPTIONS = [
  "ご選択ください",
  "20等級",
  "19等級",
  "18等級",
  "17等級",
  "16等級",
  "15等級",
  "14等級",
  "13等級",
  "12等級",
  "11等級",
  "10等級",
  "9等級",
  "8等級",
  "7S等級",
  "7F等級",
  "7E等級",
  "7D等級",
  "7C等級",
  "7B等級",
  "7A等級",
  "6S等級",
  "6F等級",
  "6E等級",
  "6D等級",
  "6C等級",
  "6B等級",
  "6A等級",
  "5等級",
  "4等級",
  "3等級",
  "2等級",
  "1等級",
] as const;

type NonFleetGradeOption = (typeof NON_FLEET_GRADE_OPTIONS)[number];
const ACCIDENT_COEFFICIENT_PERIOD_OPTIONS = [
  "0年",
  "1年",
  "2年",
  "3年",
  "4年",
  "5年",
  "6年",
] as const;

type AccidentCoefficientPeriodOption =
  (typeof ACCIDENT_COEFFICIENT_PERIOD_OPTIONS)[number];
const VEHICLE_USAGE_OPTIONS = [
  "主に家庭用※通勤用含む",
  "主に業務用",
] as const;
type VehicleUsageOption = (typeof VEHICLE_USAGE_OPTIONS)[number];

interface DateParts {
  year: number | null;
  month: number | null;
  day: number | null;
}

interface YearMonthParts {
  year: number | null;
  month: number | null;
}

export interface InsurancePolicy {
  insuranceCompany: InsuranceCompanyOption | null;
  isOneYearContract: boolean | null;
  expiryDate: DateParts | null;
  insurancePeriod: {
    start: DateParts | null;
    end: DateParts | null;
  } | null;
  nonFleetGrade: NonFleetGradeOption | null;
  accidentCoefficientPeriod: AccidentCoefficientPeriodOption | null;
  firstRegistrationYear: YearMonthParts | null;
  vehicleModel: string | null;
  vehicleName: string | null;
  vehicleUsage: VehicleUsageOption | null;
  insuredPersonName: string | null;
  insuredPersonDob: DateParts | null;
  licenseColor: string | null;
}
