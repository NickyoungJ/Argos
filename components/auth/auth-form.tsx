'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type AuthMode = 'signin' | 'signup' | 'phone'

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')

  const supabase = createSupabaseClient()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('회원가입이 완료되었습니다. 이메일을 확인해주세요.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        setMessage('로그인 성공!')
        window.location.href = '/dashboard'
      }
    } catch (error: any) {
      setMessage(error.message || '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (!otpSent) {
        // OTP 전송
        const { error } = await supabase.auth.signInWithOtp({
          phone: phoneNumber,
        })
        if (error) throw error
        setOtpSent(true)
        setMessage('인증번호가 전송되었습니다.')
      } else {
        // OTP 확인
        const { error } = await supabase.auth.verifyOtp({
          phone: phoneNumber,
          token: otp,
          type: 'sms',
        })
        if (error) throw error
        setMessage('전화번호 인증이 완료되었습니다!')
        window.location.href = '/dashboard'
      }
    } catch (error: any) {
      setMessage(error.message || '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {mode === 'signin' && '로그인'}
            {mode === 'signup' && '회원가입'}
            {mode === 'phone' && '전화번호 인증'}
          </CardTitle>
          <CardDescription>
            {mode === 'signin' && '이메일로 로그인하세요'}
            {mode === 'signup' && '새 계정을 만드세요'}
            {mode === 'phone' && '전화번호로 인증하세요 (카카오톡 알림을 위해 필수)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'phone' ? (
            <form onSubmit={handlePhoneAuth} className="space-y-4">
              <div>
                <Input
                  type="tel"
                  placeholder="010-1234-5678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  disabled={otpSent}
                />
              </div>
              {otpSent && (
                <div>
                  <Input
                    type="text"
                    placeholder="인증번호 6자리"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '처리 중...' : otpSent ? '인증 확인' : '인증번호 전송'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '처리 중...' : mode === 'signup' ? '회원가입' : '로그인'}
              </Button>
            </form>
          )}

          {message && (
            <p className={`mt-4 text-sm ${message.includes('성공') || message.includes('완료') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          <div className="mt-6 space-y-2">
            {mode !== 'phone' && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setMode('phone')}
              >
                전화번호로 인증하기
              </Button>
            )}
            {mode === 'signin' && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setMode('signup')}
              >
                계정이 없으신가요? 회원가입
              </Button>
            )}
            {mode === 'signup' && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setMode('signin')}
              >
                이미 계정이 있으신가요? 로그인
              </Button>
            )}
            {mode === 'phone' && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setMode('signin')
                  setOtpSent(false)
                  setOtp('')
                }}
              >
                이메일로 로그인하기
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

