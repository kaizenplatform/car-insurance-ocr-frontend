import { NextResponse } from "next/server"
import responseData from "@/src/data/response.json"
import type { FormItem } from "@/src/types/form-data"

// ステップごとのフィールド名パターン
const STEP_FIELD_PATTERNS = {
  1: [
    "radPreContInsco", "radPrevcontyear", "sltAcdtapply",
    "sltOcrdatey", "sltOcrdatem", "sltOcrdated",
    "sltOccdatey", "sltOccdatem", "sltOccdated",
    "sltBprefcl"
  ],
  2: [
    "radBvehtyp", "radCommuse", "lstRgstdtegy", "lstRgstdtem"
  ],
  3: [
    "radBinslbzkc", "sltBinslbdoby", "sltBinslbdobm", "sltBinslbdobd"
  ]
}

function filterDataByStep(data: any[], step: number) {
  const patterns = STEP_FIELD_PATTERNS[step as keyof typeof STEP_FIELD_PATTERNS]
  if (!patterns) return []

  return (data as FormItem[]).filter((item) => {
    // radio フィールドをチェック
    if (item.radio && item.radio.name) {
      if (patterns.some(pattern => item.radio!.name.includes(pattern))) return true
    }
    // select フィールドをチェック
    if (item.select && item.select.selects) {
      if (item.select.selects.some((select: any) => patterns.some(pattern => (select.name || select.id)?.includes(pattern)))) return true
    }
    // checkbox フィールドをチェック
    if (item.checkbox && item.checkbox.name) {
      if (patterns.some(pattern => item.checkbox!.name.includes(pattern))) return true
    }
    return false
  })
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const step = searchParams.get("step")

    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (step) {
      const stepNumber = parseInt(step)
      const filteredData: FormItem[] = filterDataByStep(responseData as FormItem[], stepNumber)
      return NextResponse.json(filteredData)
    }

    // すべてのステップのデータを結合して返す
    const allStepsData = {
      step1: filterDataByStep(responseData as FormItem[], 1),
      step2: filterDataByStep(responseData as FormItem[], 2),
      step3: filterDataByStep(responseData as FormItem[], 3),
    }

    return NextResponse.json(allStepsData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch form data" }, { status: 500 })
  }
}
