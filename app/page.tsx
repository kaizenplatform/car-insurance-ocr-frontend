"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">自動車保険お見積もり</h1>
          <p className="text-gray-600">簡単3ステップでお見積もりを取得できます</p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-blue-900">
                お見積もりを開始する
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center p-6 flex flex-col space-y-4">
              <p className="text-gray-600 mb-6">
                現在の契約状況や車両情報、個人情報を順番に入力していただきます。<br />
                途中で離脱されても、入力内容は自動保存されます。
              </p>
              <Link href="/step/1">
                <Button size="lg" className="w-full">
                  見積もり開始
                </Button>
              </Link>
              <Link href="/pop-step/1">
                <Button size="lg" className="w-full">
                  見積もり開始(pop step型)
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>お客様の個人情報は適切に保護されます</p>
          <p>入力したデータはブラウザのセッションストレージに一時保存されます</p>
        </div>
      </div>
    </div>
  )
}
