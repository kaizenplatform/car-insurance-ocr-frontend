export const metadata = {
  title: '申込み完了',
}

export default function CompletePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">お申し込みが完了しました</h1>
        <p className="text-sm text-muted-foreground mb-6">ご入力いただきありがとうございました。確認メールをお送りしましたので、ご確認ください。</p>
        <div className="flex justify-center">
          <a href="/" className="inline-block px-6 py-2 rounded bg-sky-600 text-white">トップに戻る</a>
        </div>
      </div>
    </main>
  )
}
