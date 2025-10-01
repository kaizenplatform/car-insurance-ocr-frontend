import { NextResponse } from "next/server"
import responseData from "@/src/data/response.json"

export async function POST(request: Request) {
  try {
    // 運転免許証画像受け取り（モック）
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // すべてのステップのデータを結合して返す
    const allStepsData = {
      step2: responseData,
    }
    return NextResponse.json(allStepsData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch license data" }, { status: 500 });
  }
}
