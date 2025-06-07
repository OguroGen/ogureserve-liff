'use client'

import { useState, useEffect } from 'react'
import { useApp } from '../../../contexts/AppContext'
import { useRouter } from 'next/navigation'

export default function StudentRegisterPage() {
  const { organization, registerStudent } = useApp()
  const router = useRouter()
  
  const [availableClasses, setAvailableClasses] = useState([])
  const [students, setStudents] = useState([{
    familyName: '',
    givenName: '',
    familyNameKana: '',
    givenNameKana: '',
    birthDate: '',
    schoolName: '',
    enrollments: []
  }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (organization) {
      fetchAvailableClasses()
    }
  }, [organization])

  const fetchAvailableClasses = async () => {
    try {
      const response = await fetch(`/api/organizations/${organization.organization_id}/classes`)
      if (response.ok) {
        const data = await response.json()
        setAvailableClasses(data.classes || [])
      }
    } catch (error) {
      console.error('クラス情報の取得に失敗しました:', error)
    }
  }

  const handleStudentChange = (index, field, value) => {
    setStudents(prev => prev.map((student, i) => 
      i === index ? { ...student, [field]: value } : student
    ))
  }

  const handleEnrollmentChange = (studentIndex, classSessionId, checked) => {
    setStudents(prev => prev.map((student, i) => {
      if (i === studentIndex) {
        const enrollments = checked 
          ? [...student.enrollments, classSessionId]
          : student.enrollments.filter(id => id !== classSessionId)
        return { ...student, enrollments }
      }
      return student
    }))
  }

  const addStudent = () => {
    setStudents(prev => [...prev, {
      familyName: '',
      givenName: '',
      familyNameKana: '',
      givenNameKana: '',
      birthDate: '',
      schoolName: '',
      enrollments: []
    }])
  }

  const removeStudent = (index) => {
    if (students.length > 1) {
      setStudents(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // 各生徒を順次登録
      for (const student of students) {
        if (!student.familyName || !student.givenName || student.enrollments.length === 0) {
          throw new Error('必須項目をすべて入力してください')
        }
        await registerStudent(student)
      }
      
      // 登録完了後、ホームページへ
      router.push('/')
    } catch (err) {
      setError(err.message || '登録に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
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
      {/* ヘッダー */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h2 className="text-lg font-bold text-blue-800 mb-2">
          お子様の情報を登録
        </h2>
        <p className="text-sm text-blue-600">
          通常受講されるクラスを選択してください
        </p>
      </div>

      {/* 登録フォーム */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {students.map((student, studentIndex) => (
          <div key={studentIndex} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {students.length > 1 ? `${studentIndex + 1}人目の` : ''}お子様の情報
              </h3>
              {students.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStudent(studentIndex)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  削除
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* 氏名 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    姓 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={student.familyName}
                    onChange={(e) => handleStudentChange(studentIndex, 'familyName', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="山田"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={student.givenName}
                    onChange={(e) => handleStudentChange(studentIndex, 'givenName', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="太郎"
                  />
                </div>
              </div>

              {/* ふりがな */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    せい <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={student.familyNameKana}
                    onChange={(e) => handleStudentChange(studentIndex, 'familyNameKana', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="やまだ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    めい <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={student.givenNameKana}
                    onChange={(e) => handleStudentChange(studentIndex, 'givenNameKana', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="たろう"
                  />
                </div>
              </div>

              {/* 生年月日 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  生年月日
                </label>
                <input
                  type="date"
                  value={student.birthDate}
                  onChange={(e) => handleStudentChange(studentIndex, 'birthDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 学校名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  学校名
                </label>
                <input
                  type="text"
                  value={student.schoolName}
                  onChange={(e) => handleStudentChange(studentIndex, 'schoolName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="○○小学校"
                />
              </div>

              {/* 通常クラス選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  通常クラス（複数選択可） <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {availableClasses.map((classSession) => (
                    <label 
                      key={classSession.class_session_id} 
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={student.enrollments.includes(classSession.class_session_id)}
                        onChange={(e) => handleEnrollmentChange(studentIndex, classSession.class_session_id, e.target.checked)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {classSession.locations.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {['日', '月', '火', '水', '木', '金', '土'][classSession.day_of_week]}曜日 {' '}
                          {classSession.start_time}〜{classSession.end_time}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {student.enrollments.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">少なくとも1つのクラスを選択してください</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* 生徒追加ボタン */}
        <div className="text-center">
          <button
            type="button"
            onClick={addStudent}
            className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            + 生徒を追加
          </button>
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
          {isSubmitting ? '登録中...' : '登録完了'}
        </button>
      </form>

      {/* ステップ表示 */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
          <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">✓</span>
          <span className="text-sm text-gray-600">保護者情報</span>
          <span className="text-gray-400">→</span>
          <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
          <span className="text-sm text-gray-600">生徒情報</span>
        </div>
      </div>
    </div>
  )
}
