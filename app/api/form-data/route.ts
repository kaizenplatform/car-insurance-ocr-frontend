import { NextResponse } from "next/server"
import responseData from "@/src/data/response.json"

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

  return data.filter((item: any) => {
    // radio フィールドをチェック
    if (item.radio?.name) {
      return patterns.some(pattern => item.radio.name.includes(pattern))
    }
    
    // select フィールドをチェック
    if (item.select?.selects) {
      return item.select.selects.some((select: any) => 
        patterns.some(pattern => (select.name || select.id)?.includes(pattern))
      )
    }
    
    // checkbox フィールドをチェック
    if (item.checkbox?.name) {
      return patterns.some(pattern => item.checkbox.name.includes(pattern))
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
      const filteredData = filterDataByStep(responseData, stepNumber)
      return NextResponse.json(filteredData)
    }
    
    return NextResponse.json(responseData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch form data" }, { status: 500 })
  }
}
