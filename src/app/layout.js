// src/app/layout.js
import './globals.css'
import { AppProvider } from '../contexts/AppContext'
import { Suspense } from 'react'

export const metadata = {
  title: 'そろばん教室 予約システム',
  description: 'そろばん教室の欠席連絡・振替予約システム',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <Suspense fallback={<div>読み込み中...</div>}>
          <AppProvider>
            {/* ヘッダー */}
            <header className="bg-blue-600 text-white p-4 shadow-lg">
              <h1 className="text-lg font-bold text-center">
                そろばん教室 予約システム
              </h1>
            </header>

            {/* メインコンテンツ */}
            <main className="container mx-auto px-4 py-6 max-w-md">
              {children}
            </main>

            {/* フッターナビゲーション */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
              <div className="flex justify-around py-2">
                <NavButton href="/" icon="🏠" label="ホーム" />
                <NavButton href="/absence" icon="✋" label="欠席" />
                <NavButton href="/makeup" icon="🔄" label="振替" />
                <NavButton href="/history" icon="📋" label="履歴" />
                <NavButton href="/settings" icon="⚙️" label="設定" />
              </div>
            </nav>

            {/* フッター分のスペース確保 */}
            <div className="h-20"></div>
          </AppProvider>
        </Suspense>
      </body>
    </html>
  )
}

// ナビゲーションボタンコンポーネント
function NavButton({ href, icon, label }) {
  return (
    <a 
      href={href}
      className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors"
    >
      <span className="text-lg mb-1">{icon}</span>
      <span className="text-xs">{label}</span>
    </a>
  )
}
