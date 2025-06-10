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
  }, [])

  const initializeApp = async () => {
    try {
      // LINE認証
      const lineUser = await checkLineAuth()
      setUser(lineUser)

      // URLパラメーターをチェック
      const orgCode = searchParams.get('org')
      
      if (orgCode) {
        // パラメーター付きアクセス
        const orgData = await fetchOrganization(orgCode)
        setOrganization(orgData)
        
        // 既存ユーザーかつ同じ塾への登録済みかチェック
        const userInfo = await checkUserRegistration(lineUser.lineUserId)
        
        if (userInfo.isRegistered && 
            userInfo.organization?.organization_id === orgData.organization_id) {
          // 同じ塾に登録済み → 通常のホーム画面へ
          setIsRegistered(true)
          setStudents(userInfo.students || [])
        } else {
          // 未登録または別の塾 → 新規登録フローへ
          setIsRegistered(false)
          router.push('/register/guardian')
          return
        }
      } else {
        // パラメーターなし = 既存ユーザー
        const userInfo = await checkUserRegistration(lineUser.lineUserId)
        
        if (userInfo.isRegistered) {
          setIsRegistered(true)
          setOrganization(userInfo.organization)
          setStudents(userInfo.students || [])
        } else {
          router.push('/error?message=無効なアクセスです。塾からのリンクを使用してください')
          return
        }
      }
    } catch (error) {
      console.error('初期化エラー:', error)
      router.push(`/error?message=システムエラー: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const checkLineAuth = async () => {
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
  }

  const registerStudent = async (studentData) => {
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
