import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../../lib/supabase'

export async function GET(request, { params }) {
  try {
    const { orgId } = params
    const supabase = createServerClient()
    
    // 組織に所属する教室を取得
    const { data: locations } = await supabase
      .from('locations')
      .select('location_id')
      .eq('organization_id', orgId)
    
    if (!locations || locations.length === 0) {
      return NextResponse.json({ classes: [] })
    }
    
    const locationIds = locations.map(loc => loc.location_id)
    
    // 各教室のクラス一覧を取得
    const { data: classes, error } = await supabase
      .from('class_sessions')
      .select(`
        class_session_id,
        name,
        day_of_week,
        start_time,
        end_time,
        capacity,
        locations (
          location_id,
          name
        )
      `)
      .in('location_id', locationIds)
      .order('day_of_week')
      .order('start_time')
    
    if (error) {
      return NextResponse.json(
        { error: 'クラス情報の取得に失敗しました' }, 
        { status: 400 }
      )
    }
    
    return NextResponse.json({ classes: classes || [] })
  } catch (error) {
    console.error('Classes fetch error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' }, 
      { status: 500 }
    )
  }
}
