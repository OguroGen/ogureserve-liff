import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase'

export async function GET(request, { params }) {
  try {
    const { orgCode } = params
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('organizations')
      .select('organization_id, name, contact_info')
      .eq('code', orgCode)
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: '教室が見つかりません' }, 
        { status: 404 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Organization fetch error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' }, 
      { status: 500 }
    )
  }
}
