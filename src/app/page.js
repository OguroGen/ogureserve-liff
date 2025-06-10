'use client'

import { useApp } from '../contexts/AppContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { user, organization, students, loading, isRegistered } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isRegistered && students.length === 0) {
      // 登録済みだが生徒がいない場合のみ生徒登録へ
      router.push('/register/student')
    }
  }, [loading, isRegistered, students, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  // 新規登録フローは AppContext で /register/guardian に直行するので、
  // ここには既存ユーザーしか来ない
  if (!isRegistered || students.length === 0) {
    return null // リダイレクト中
  }

  return (
    <div className="space-y-6">
      {/* 教室名表示 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-bold text-center text-gray-800 mb-2">
          {organization.name}
        </h2>
        <p className="text-sm text-gray-600 text-center">
          こんにちは、{user?.displayName}さん
        </p>
      </div>

      {/* 生徒選択 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-md font-bold text-gray-800 mb-4">生徒を選択</h3>
        <div className="space-y-3">
          {students.map((student) => (
            <StudentCard key={student.student_id} student={student} />
          ))}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="space-y-3">
        <ActionButton 
          href="/absence" 
          className="bg-red-500 hover:bg-red-600"
          icon="✋"
          title="欠席連絡をする"
          description="体調不良などで欠席する場合"
        />
        
        <ActionButton 
          href="/makeup" 
          className="bg-green-500 hover:bg-green-600"
          icon="🔄"
          title="振替予約をする"
          description="欠席した分を別の日に振替"
        />
        
        <ActionButton 
          href="/history" 
          className="bg-blue-500 hover:bg-blue-600"
          icon="📋"
          title="履歴を確認する"
          description="過去の欠席・振替履歴"
        />
      </div>
    </div>
  )
}

// 生徒カードコンポーネント
function StudentCard({ student }) {
  return (
    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer">
      <input type="checkbox" className="w-5 h-5 text-blue-600" />
      <div className="flex-1">
        <div className="font-medium text-gray-800">
          {student.family_name} {student.given_name}
        </div>
        <div className="text-sm text-gray-600">
          {student.enrollments?.map((enrollment, index) => (
            <div key={enrollment.enrollment_id}>
              {enrollment.class_sessions.locations.name} {' '}
              {['日', '月', '火', '水', '木', '金', '土'][enrollment.class_sessions.day_of_week]}曜 {' '}
              {enrollment.class_sessions.start_time}
              {index < student.enrollments.length - 1 && ' / '}
            </div>
          ))}
        </div>
      </div>
    </label>
  )
}

// アクションボタンコンポーネント
function ActionButton({ href, className, icon, title, description }) {
  return (
    <a href={href} className={`block ${className} text-white rounded-lg p-4 transition-colors`}>
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="font-bold text-lg">{title}</div>
          <div className="text-sm opacity-90">{description}</div>
        </div>
      </div>
    </a>
  )
}
