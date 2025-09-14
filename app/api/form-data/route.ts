import { NextResponse } from "next/server"
import responseData from "@/data/response.json"

export async function GET() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return NextResponse.json(responseData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch form data" }, { status: 500 })
  }
}
