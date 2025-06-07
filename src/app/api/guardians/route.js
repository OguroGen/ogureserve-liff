import { NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase'

export async function POST(request) {
  try {
    const { name, phoneNumber, lineUserId, organizationId } = await request.json()
    const supabase = createServerClient()
    
    // 保護者を登録
    const { data, error } = await supabase
      .from('guardians')
      .insert({
        line_user_id: lineUserId,
        name: name,
        line_display_name: name,
        organization_id: organizationId,
        contact_info: { phone: phoneNumber }
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: '保護者登録に失敗しました' }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json({ guardian: data })
  } catch (error) {
    console.error('Guardian registration error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' }, 
      { status: 500 }
    )
  }
}
