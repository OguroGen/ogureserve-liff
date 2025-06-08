import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const lineUserId = searchParams.get('lineUserId')
    
    if (!lineUserId) {
      return NextResponse.json(
        { error: 'LINE User IDが必要です' }, 
        { status: 400 }
      )
    }
    
    const supabase = createServerClient()
    
    // 保護者情報を検索（組織情報も含む）
    const { data: guardian, error: guardianError } = await supabase
      .from('guardians')
      .select(`
        guardian_id,
        name,
        line_display_name,
        organizations (
          organization_id,
          name
        )
      `)
      .eq('line_user_id', lineUserId)
      .single()
    
    if (guardianError && guardianError.code !== 'PGRST116') {
      // PGRST116は「見つからない」エラーなので除外
      console.error('Guardian fetch error:', guardianError)
      return NextResponse.json(
        { error: 'データベースエラーが発生しました' }, 
        { status: 500 }
      )
    }
    
    if (!guardian) {
      // 未登録ユーザー
      return NextResponse.json({
        isRegistered: false,
        guardian: null,
        organization: null,
        students: []
      })
    }
    
    // 登録済みユーザーの場合、生徒情報も取得
    const { data: relations, error: relationsError } = await supabase
      .from('student_guardian_relations')
      .select('student_id')
      .eq('guardian_id', guardian.guardian_id)
    
    let students = []
    if (relations && relations.length > 0 && !relationsError) {
      const studentIds = relations.map(rel => rel.student_id)
      
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select(`
          student_id,
          family_name,
          given_name,
          family_name_kana,
          given_name_kana,
          birth_date,
          gender,
          school_name,
          remaining_makeups,
          organization_student_id,
          enrollments (
            enrollment_id,
            class_sessions (
              class_session_id,
              name,
              day_of_week,
              start_time,
              end_time,
              locations (
                location_id,
                name
              )
            )
          )
        `)
        .in('student_id', studentIds)
      
      if (!studentError) {
        students = studentData || []
      }
    }
    
    return NextResponse.json({
      isRegistered: true,
      guardian: {
        guardian_id: guardian.guardian_id,
        name: guardian.name,
        line_display_name: guardian.line_display_name
      },
      organization: guardian.organizations,
      students: students
    })
    
  } catch (error) {
    console.error('保護者確認エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' }, 
      { status: 500 }
    )
  }
}
