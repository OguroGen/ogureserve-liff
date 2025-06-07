import { NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase'

export async function POST(request) {
  try {
    const { 
      familyName, 
      givenName, 
      familyNameKana, 
      givenNameKana, 
      birthDate, 
      schoolName, 
      enrollments,
      guardianLineUserId 
    } = await request.json()
    
    const supabase = createServerClient()
    
    // 保護者情報を取得
    const { data: guardian } = await supabase
      .from('guardians')
      .select('guardian_id, organization_id')
      .eq('line_user_id', guardianLineUserId)
      .single()
    
    if (!guardian) {
      return NextResponse.json(
        { error: '保護者が見つかりません' }, 
        { status: 404 }
      )
    }
    
    // トランザクション処理（Supabaseの場合、RPCまたは個別に処理）
    
    // 1. 生徒を登録
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert({
        family_name: familyName,
        given_name: givenName,
        family_name_kana: familyNameKana,
        given_name_kana: givenNameKana,
        birth_date: birthDate || null,
        school_name: schoolName || null,
        remaining_makeups: 0
      })
      .select()
      .single()
    
    if (studentError) {
      return NextResponse.json(
        { error: '生徒登録に失敗しました' }, 
        { status: 400 }
      )
    }
    
    // 2. 保護者と生徒の関係を登録
    const { error: relationError } = await supabase
      .from('student_guardian_relations')
      .insert({
        student_id: student.student_id,
        guardian_id: guardian.guardian_id,
        relation_type: '保護者'
      })
    
    if (relationError) {
      // 生徒登録をロールバック（本来はトランザクションで処理）
      await supabase
        .from('students')
        .delete()
        .eq('student_id', student.student_id)
      
      return NextResponse.json(
        { error: '保護者-生徒関係の登録に失敗しました' }, 
        { status: 400 }
      )
    }
    
    // 3. クラス登録（enrollments）
    if (enrollments && enrollments.length > 0) {
      const enrollmentData = enrollments.map(classSessionId => ({
        student_id: student.student_id,
        class_session_id: classSessionId
      }))
      
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert(enrollmentData)
      
      if (enrollmentError) {
        // ロールバック処理
        await supabase
          .from('student_guardian_relations')
          .delete()
          .eq('student_id', student.student_id)
        
        await supabase
          .from('students')
          .delete()
          .eq('student_id', student.student_id)
        
        return NextResponse.json(
          { error: 'クラス登録に失敗しました' }, 
          { status: 400 }
        )
      }
    }
    
    // 登録完了した生徒情報を返す
    const { data: registeredStudent } = await supabase
      .from('students')
      .select(`
        student_id,
        family_name,
        given_name,
        family_name_kana,
        given_name_kana,
        birth_date,
        school_name,
        remaining_makeups,
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
      .eq('student_id', student.student_id)
      .single()
    
    return NextResponse.json({ student: registeredStudent })
  } catch (error) {
    console.error('Student registration error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' }, 
      { status: 500 }
    )
  }
}
