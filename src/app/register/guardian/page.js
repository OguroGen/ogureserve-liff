'use client'

import { useState } from 'react'
import { useApp } from '../../../contexts/AppContext'
import { useRouter } from 'next/navigation'

export default function GuardianRegisterPage() {
  const { organization, user, registerGuardian } = useApp()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    phoneNumber: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await registerGuardian(formData)
      router.push('/register/student')
    } catch (err) {
      setError(err.message || '登録に失敗しました')
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

  if (!organization) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">教室情報が取得できませんでした</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ウェルカムメッセージ */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h2 className="text-lg font-bold text-blue-800 mb-2">
          {organization.name}にご入会いただき
        </h2>
        <h2 className="text-lg font-bold text-blue-800 mb-2">
          ありがとうございます
        </h2>
        <p className="text-sm text-blue-600">
          初回のみ、保護者様とお子様の情報を登録させていただきます
        </p>
      </div>

      {/* 登録フォーム */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          保護者情報の登録
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* お名前 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              お名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="山田太郎"
            />
          </div>

          {/* 電話番号 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              電話番号 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="090-1234-5678"
            />
          </div>

          {/* 所属教室（固定表示） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              所属教室
            </label>
            <div className="w-full px-3 py-2 bg-green-50 border border-green-300 rounded-lg text-green-800">
              ✓ {organization.name}（確定）
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '登録中...' : '次へ進む'}
          </button>
        </form>
      </div>

      {/* 注意事項 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2">ご注意</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 電話番号は緊急時の連絡に使用いたします</li>
          <li>• 入力いただいた情報は適切に管理いたします</li>
          <li>• 次の画面でお子様の情報を登録します</li>
        </ul>
      </div>

      {/* ステップ表示 */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
          <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
          <span className="text-sm text-gray-600">保護者情報</span>
          <span className="text-gray-400">→</span>
          <span className="bg-gray-300 text-gray-600 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
          <span className="text-sm text-gray-400">生徒情報</span>
        </div>
      </div>
    </div>
  )
}
