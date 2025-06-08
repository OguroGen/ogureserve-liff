import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// サーバーサイド用のクライアント（API routes用）
export const createServerClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    console.error('Supabase環境変数が設定されていません:', { url: !!url, key: !!key })
    throw new Error('Supabase設定エラー')
  }
  
  return createClient(url, key)
}
