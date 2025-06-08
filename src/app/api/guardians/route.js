import { NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase'

export async function POST(request) {
  try {
    const requestData = await request.json()
    console.log('受信したデータ:', requestData)
    
    const { name, phoneNumber, lineUserId, organizationId } = requestData
    
    // 必須項目のチェック
    if (!name || !lineUserId || !organizationId) {
      console.log('必須項目が不足:', { name: !!name, lineUserId: !!lineUserId, organizationId: !!organizationId })
      return NextResponse.json(
        { error: '必須項目が不足しています' }, 
        { status: 400 }
      )
    }
    
    const supabase = createServerClient()
    console.log('Supabaseクライアント作成完了')
    
    // 同じLINE User IDと組織IDの組み合わせで既に登録されていないかチェック
    const { data: existingGuardian, error: checkError } = await supabase
      .from('guardians')
      .select('guardian_id, name')
      .eq('line_user_id', lineUserId)
      .eq('organization_id', organizationId)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116は「見つからない」エラーなので除外
      console.error('既存保護者チェックエラー:', checkError)
      return NextResponse.json(
        { error: 'データベースエラーが発生しました' }, 
        { status: 500 }
      )
    }
    
    if (existingGuardian) {
      console.log('既に登録済み:', existingGuardian)
      return NextResponse.json(
        { error: 'この塾には既に登録済みです' }, 
        { status: 409 }
      )
    }
    
    // 挿入するデータ
    const insertData = {
      line_user_id: lineUserId,
      name: name,
      line_display_name: name,
      organization_id: organizationId,
      contact_info: { phone: phoneNumber }
    }
    console.log('挿入データ:', insertData)
    
    // 保護者を登録
    const { data, error } = await supabase
      .from('guardians')
      .insert(insertData)
      .select()
      .single()
    
    if (error) {
      console.error('Supabaseエラー:', error)
      return NextResponse.json(
        { error: `保護者登録に失敗しました: ${error.message}` }, 
        { status: 400 }
      )
    }
    
    console.log('登録成功:', data)
    return NextResponse.json({ guardian: data })
  } catch (error) {
    console.error('Guardian registration error:', error)
    return NextResponse.json(
      { error: `サーバーエラーが発生しました: ${error.message}` }, 
      { status: 500 }
    )
  }
}
