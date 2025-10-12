import { NextResponse } from "next/server"
import type { FormItem } from "@/src/types/form-data"
import { transformInsurancePolicy } from "@/src/lib/transform-insurance-policy"

// ステップごとのフィールド名パターン
const STEP_FIELD_PATTERNS = {
  1: [
    "radPreContInsco", "radPrevcontyear", "sltAcdtapply",
    "sltOcrdatey", "sltOcrdatem", "sltOcrdated",
    "sltOccdatey", "sltOccdatem", "sltOccdated",
    "sltBprefcl"
  ],
  2: [
    "radBvehtyp", "vehicleName", "radCommuse", "lstRgstdtegy", "lstRgstdtem"
  ],
  3: [
    "radBinslbzkc", "sltBinslbdoby", "sltBinslbdobm", "sltBinslbdobd", "radBlicensecol"
  ]
}

function filterDataByStep(data: FormItem[], step: number): FormItem[] {
  const patterns = STEP_FIELD_PATTERNS[step as keyof typeof STEP_FIELD_PATTERNS]
  if (!patterns) return []
  return data.filter((item) => {
    if (item.radio && item.radio.name) {
      if (patterns.some(pattern => item.radio!.name.includes(pattern))) return true
    }
    if (item.select && item.select.selects) {
      if (item.select.selects.some((select: any) => patterns.some(pattern => (select.name || select.id)?.includes(pattern)))) return true
    }
    if (item.checkbox && item.checkbox.name) {
      if (patterns.some(pattern => item.checkbox!.name.includes(pattern))) return true
    }
    return false
  })
}

export async function POST(request: Request) {
  try {
    // 画像ファイル受け取り
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "画像ファイルがありません" }, { status: 400 });
    }

    // OCR APIのURLを環境変数から取得
    const ocrApiUrl = process.env.POLICY_API_URL;
    if (!ocrApiUrl) {
      return NextResponse.json({ error: "OCR APIのURLが未設定です" }, { status: 500 });
    }
    // OCR APIへリクエスト
    const ocrRes = await fetch(ocrApiUrl, {
      method: "POST",
      body: (() => {
        const fd = new FormData();
        fd.append("file", file);
        return fd;
      })(),
    });
    if (!ocrRes.ok) {
      const errorText = await ocrRes.text();
      console.error("OCR API error:", ocrRes.status, errorText);
      return NextResponse.json({ 
        error: "OCR APIリクエスト失敗",
        status: ocrRes.status,
        details: errorText
      }, { status: 502 });
    }
    const ocrJson = await ocrRes.json();
    console.log("OCR API response:", ocrJson);

    // InsurancePolicy型に変換（APIレスポンスが型に合致している前提）
    const policy = ocrJson.data;
    console.log("Policy data:", policy);
    // response.json形式に変換
    const items: FormItem[] = transformInsurancePolicy(policy.data);
    console.log("Transformed items:", items);

    // ステップごとに分割
    const allStepsData = {
      step1: filterDataByStep(items, 1),
      step2: filterDataByStep(items, 2),
      step3: filterDataByStep(items, 3),
    };

    return NextResponse.json(allStepsData);
  } catch (error) {
    console.error("Form data API error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch form data",
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
