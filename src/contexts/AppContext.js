'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [organization, setOrganization] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    initializeApp()
  }, [searchParams])

  const initializeApp = async () => {
    try {
      // LINE認証状態をチェック
      const lineUser = await checkLineAuth()
      setUser(lineUser)

      // 既存ユーザーかチェック
      const userInfo = await checkUserRegistration(lineUser.lineUserId)
      
      if (userInfo.isRegistered) {
        // 登録済みユーザーの場合
        // 登録済みユーザーは塾名のパラメーターが不要
        setIsRegistered(true)
        setOrganization(userInfo.organization)
        setStudents(userInfo.students || [])
      } else {
        // 未登録ユーザーの場合
        const orgCode = searchParams.get('org')
        if (orgCode) {
          // 新規登録用URLの場合
          const orgData = await fetchOrganization(orgCode)
          setOrganization(orgData)
        } else {
          // パラメーターなしで未登録の場合はエラー
          router.push('/error?message=無効なアクセスです。塾からのリンクを使用してください')
          return
        }
      }
    } catch (error) {
      console.error('アプリの初期化に失敗しました:', error)
      router.push('/error?message=システムエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const checkLineAuth = async () => {
    // 今回はLINE認証の仮実装
    // 実際にはLINE LIFF SDKを使用
    return {
      lineUserId: 'mock_line_user_123',
      displayName: '山田太郎',
      pictureUrl: ''
    }
  }

  const checkUserRegistration = async (lineUserId) => {
    const response = await fetch(`/api/guardians/check?lineUserId=${lineUserId}`)
    if (response.ok) {
      return await response.json()
    }
    throw new Error('ユーザー確認に失敗しました')
  }

  const fetchOrganization = async (orgCode) => {
    const response = await fetch(`/api/organizations/${orgCode}`)
    if (response.ok) {
      return await response.json()
    }
    throw new Error('教室が見つかりません')
  }

  const registerGuardian = async (guardianData) => {
    try {
      const response = await fetch('/api/guardians', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...guardianData,
          lineUserId: user.lineUserId,
          organizationId: organization.organization_id
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsRegistered(true)
        return data
      } else {
        throw new Error('保護者登録に失敗しました')
      }
    } catch (error) {
      console.error('保護者登録エラー:', error)
      throw error
    }
  }

  const registerStudent = async (studentData) => {
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...studentData,
          guardianLineUserId: user.lineUserId
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setStudents(prev => [...prev, data.student])
        return data
      } else {
        throw new Error('生徒登録に失敗しました')
      }
    } catch (error) {
      console.error('生徒登録エラー:', error)
      throw error
    }
  }

  const value = {
    user,
    organization,
    students,
    loading,
    isRegistered,
    registerGuardian,
    registerStudent,
    setStudents
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
