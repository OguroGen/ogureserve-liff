import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const lineUserId = searchParams.get('lineUserId')
    
    if (!lineUserId) {
      return NextResponse.json(
        { error: 'lineUserIdが必要です' }, 
        { status: 400 }
      )
    }
    
    const supabase = createServerClient()
    
    // 保護者が既に登録されているかチェック
    const { data: guardian, error } = await supabase
      .from('guardians')
      .select('guardian_id, name, organization_id')
      .eq('line_user_id', lineUserId)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return NextResponse.json(
        { error: 'データベースエラーが発生しました' }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      isRegistered: !!guardian,
      guardian: guardian
    })
  } catch (error) {
    console.error('Guardian check error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' }, 
      { status: 500 }
    )
  }
}
