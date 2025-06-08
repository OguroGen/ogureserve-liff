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
    // URLパラメータから教室コードを取得
    const orgCode = searchParams.get('org')
    if (orgCode) {
      fetchOrganization(orgCode)
    }
    
    // LINE認証状態をチェック（今回は仮データ）
    checkAuthStatus()
  }, [searchParams])

  const fetchOrganization = async (orgCode) => {
    try {
      const response = await fetch(`/api/organizations/${orgCode}`)
      if (response.ok) {
        const orgData = await response.json()
        setOrganization(orgData)
      } else {
        console.error('教室が見つかりません')
      }
    } catch (error) {
      console.error('教室情報の取得に失敗しました:', error)
    }
  }

  const checkAuthStatus = async () => {
    // 今回はLINE認証の仮実装
    // 実際にはLINE LIFF SDKを使用
    const mockLineUser = {
      lineUserId: 'mock_line_user_123',
      displayName: '山田太郎',
      pictureUrl: ''
    }
    
    setUser(mockLineUser)
    
    // 既存ユーザーかチェック
    try {
      const response = await fetch(`/api/guardians/check?lineUserId=${mockLineUser.lineUserId}`)
      if (response.ok) {
        const data = await response.json()
        setIsRegistered(data.isRegistered)
        if (data.guardian) {
          // 既存ユーザーの場合、生徒情報も取得
          fetchStudents(data.guardian.guardian_id)
        }
      }
    } catch (error) {
      console.error('ユーザー状態確認に失敗しました:', error)
    }
    
    setLoading(false)
  }

  const fetchStudents = async (guardianId) => {
    try {
      const response = await fetch(`/api/guardians/${guardianId}/students`)
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error('生徒情報の取得に失敗しました:', error)
    }
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
        // 生徒リストを更新
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
