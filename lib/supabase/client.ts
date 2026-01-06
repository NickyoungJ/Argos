import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// 클라이언트 컴포넌트용 Supabase 클라이언트
export const createSupabaseClient = () => {
  return createClientComponentClient()
}

