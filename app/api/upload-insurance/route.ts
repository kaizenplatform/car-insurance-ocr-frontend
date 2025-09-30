import { NextResponse } from "next/server"
import responseData from "@/src/data/response.json"
import type { FormItem } from "@/src/types/form-data"

export async function POST(request: Request) {
  try {
    // 保険証書画像受け取り（モック）
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // すべてのステップのデータを結合して返す
    const allStepsData = {
      step1: responseData,
    }
    return NextResponse.json(allStepsData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch insurance data" }, { status: 500 });
  }
}
