'use client'

import { useSearchParams } from 'next/navigation'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'エラーが発生しました'

  return (
    <div className="text-center py-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h2 className="text-lg font-bold text-red-800 mb-2">エラー</h2>
        <p className="text-red-600">{message}</p>
      </div>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          お手数ですが、正しいURLまたはQRコードからアクセスしてください。
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-800 mb-2">お困りの場合</h3>
          <p className="text-sm text-gray-600">
            そろばん教室へ直接お問い合わせください
          </p>
        </div>
      </div>
    </div>
  )
}
