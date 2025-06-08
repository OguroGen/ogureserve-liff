import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../../lib/supabase'

export async function GET(request, { params }) {
  try {
    const { guardianId } = await params
    const supabase = createServerClient()
    
    // 保護者に関連する生徒一覧を取得
    const { data: relations } = await supabase
      .from('student_guardian_relations')
      .select('student_id')
      .eq('guardian_id', guardianId)
    
    if (!relations || relations.length === 0) {
      return NextResponse.json({ students: [] })
    }
    
    const studentIds = relations.map(rel => rel.student_id)
    
    // 生徒情報と受講クラス情報を取得
    const { data: students, error } = await supabase
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
    
    if (error) {
      return NextResponse.json(
        { error: '生徒情報の取得に失敗しました' }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json({ students: students || [] })
  } catch (error) {
    console.error('Students fetch error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' }, 
      { status: 500 }
    )
  }
}
