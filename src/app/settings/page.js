'use client'

import { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { user, organization, students } = useApp()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('guardian')

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">登録情報・設定</h1>
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← ホームに戻る
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {organization?.name} - {user?.displayName}さん
        </p>
      </div>

      {/* タブメニュー */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b border-gray-200">
          <TabButton
            active={activeTab === 'guardian'}
            onClick={() => setActiveTab('guardian')}
            title="保護者情報"
            icon="👤"
          />
          <TabButton
            active={activeTab === 'students'}
            onClick={() => setActiveTab('students')}
            title="生徒情報"
            icon="👦"
          />
          <TabButton
            active={activeTab === 'other'}
            onClick={() => setActiveTab('other')}
            title="その他"
            icon="⚙️"
          />
        </div>

        {/* タブコンテンツ */}
        <div className="p-6">
          {activeTab === 'guardian' && <GuardianSettings />}
          {activeTab === 'students' && <StudentsSettings students={students} />}
          {activeTab === 'other' && <OtherSettings />}
        </div>
      </div>
    </div>
  )
}

// タブボタンコンポーネント
function TabButton({ active, onClick, title, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
        active
          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{title}</span>
    </button>
  )
}

// 保護者設定コンポーネント
function GuardianSettings() {
  const { user } = useApp()
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    phoneNumber: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      // TODO: 保護者情報更新API呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000)) // 仮の待機
      setMessage('保護者情報を更新しました')
    } catch (error) {
      setMessage('更新に失敗しました: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">保護者情報の変更</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            お名前
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            電話番号
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="090-1234-5678"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('失敗') 
              ? 'bg-red-50 text-red-600 border border-red-200' 
              : 'bg-green-50 text-green-600 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '更新中...' : '変更を保存'}
        </button>
      </form>
    </div>
  )
}

// 生徒設定コンポーネント
function StudentsSettings({ students }) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">生徒情報の管理</h2>
        <button
          onClick={() => router.push('/register/student')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          + 生徒を追加
        </button>
      </div>

      <div className="space-y-4">
        {students.map((student) => (
          <StudentSettingCard key={student.student_id} student={student} />
        ))}
      </div>
    </div>
  )
}

// 生徒設定カードコンポーネント
function StudentSettingCard({ student }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-800">
            {student.family_name} {student.given_name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {student.enrollments?.map((enrollment, index) => (
              <span key={enrollment.enrollment_id}>
                {enrollment.class_sessions.locations.name} {' '}
                {['日', '月', '火', '水', '木', '金', '土'][enrollment.class_sessions.day_of_week]}曜 {' '}
                {enrollment.class_sessions.start_time}
                {index < student.enrollments.length - 1 && ' / '}
              </span>
            ))}
          </p>
          {student.school_name && (
            <p className="text-sm text-gray-500">学校: {student.school_name}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm">
            編集
          </button>
          <button className="text-red-600 hover:text-red-800 text-sm">
            削除
          </button>
        </div>
      </div>
    </div>
  )
}

// その他設定コンポーネント
function OtherSettings() {
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">その他の設定</h2>
      
      <div className="space-y-4">
        {/* 通知設定 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-800">通知設定</h3>
            <p className="text-sm text-gray-600">欠席・振替の確認通知</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* アカウント情報 */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">アカウント情報</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>LINE ID: mock_line_user_123</p>
            <p>登録日: 2024年12月</p>
            <p>最終ログイン: 今日</p>
          </div>
        </div>

        {/* ヘルプ・サポート */}
        <div className="space-y-3">
          <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800">よくある質問</span>
              <span className="text-gray-400">→</span>
            </div>
          </button>
          
          <button className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800">お問い合わせ</span>
              <span className="text-gray-400">→</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
