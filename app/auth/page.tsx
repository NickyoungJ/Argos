'use client'

import { useEffect } from 'react'
import { AuthForm } from '@/components/auth/auth-form'

export default function AuthPage() {
  useEffect(() => {
    // pending_monitor 데이터가 있는지 확인
    const pending = sessionStorage.getItem('pending_monitor')
    if (pending) {
      // 로그인 후 자동으로 모니터 생성하도록 표시
      console.log('Pending monitor found:', JSON.parse(pending))
    }
  }, [])

  return <AuthForm />
}

