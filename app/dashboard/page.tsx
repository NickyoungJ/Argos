'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MonitorForm } from '@/components/monitors/monitor-form'
import { MonitorList } from '@/components/monitors/monitor-list'
import { MonitorLogs } from '@/components/monitors/monitor-logs'
import { UpgradeCard } from '@/components/upgrade/upgrade-card'
import type { Monitor, User } from '@/lib/types/database'
import { createSupabaseClient } from '@/lib/supabase/client'
import { TIER_LIMITS } from '@/lib/quota/checker'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [monitors, setMonitors] = useState<Monitor[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMonitor, setEditingMonitor] = useState<Monitor | null>(null)
  const [viewingLogs, setViewingLogs] = useState<{ id: string; name: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'monitors' | 'upgrade'>('monitors')

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = async () => {
    const supabase = createSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/auth')
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const supabase = createSupabaseClient()
      
      // 사용자 정보
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      setUser(userProfile)

      // 모니터 목록
      const monitorsResponse = await fetch('/api/monitors')
      const monitorsData = await monitorsResponse.json()
      setMonitors(monitorsData.monitors || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/monitors/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Failed to delete monitor:', error)
    }
  }

  const handleLogout = async () => {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  if (!user) return null

  const tierInfo = TIER_LIMITS[user.tier]
  const canAddMore = monitors.length < tierInfo.maxMonitors

  return (
    <div className="container mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          로그아웃
        </Button>
      </div>

      {/* 계정 정보 카드 */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>요금제</CardTitle>
            <CardDescription>현재 구독 플랜</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.tier}</div>
            <Button
              variant="link"
              className="px-0 mt-2"
              onClick={() => setActiveTab('upgrade')}
            >
              업그레이드 →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>모니터</CardTitle>
            <CardDescription>등록된 감시 작업</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monitors.length} / {tierInfo.maxMonitors}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI 크레딧</CardTitle>
            <CardDescription>Semantic 모드 사용</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.credits.toLocaleString()}
            </div>
            {user.tier !== 'PRO' && (
              <p className="text-xs text-muted-foreground mt-2">
                Pro 티어로 업그레이드하세요
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('monitors')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'monitors'
              ? 'border-primary font-semibold'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          모니터 관리
        </button>
        <button
          onClick={() => setActiveTab('upgrade')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'upgrade'
              ? 'border-primary font-semibold'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          요금제
        </button>
      </div>

      {/* 컨텐츠 */}
      {activeTab === 'monitors' ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">내 모니터</h2>
            <Button
              onClick={() => setShowAddForm(true)}
              disabled={!canAddMore}
            >
              + 모니터 추가
            </Button>
          </div>

          {!canAddMore && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              모니터를 더 추가하려면 상위 티어로 업그레이드하세요.
            </div>
          )}

          <MonitorList
            monitors={monitors}
            onEdit={(monitor) => setEditingMonitor(monitor)}
            onDelete={handleDelete}
            onViewLogs={(id) => {
              const monitor = monitors.find((m) => m.id === id)
              if (monitor) {
                setViewingLogs({ id, name: monitor.product_name })
              }
            }}
          />
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6">요금제 업그레이드</h2>
          <UpgradeCard currentTier={user.tier} />
        </>
      )}

      {/* 모달들 */}
      <MonitorForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onSuccess={fetchData}
        userTier={user.tier}
      />

      {editingMonitor && (
        <MonitorForm
          open={!!editingMonitor}
          onOpenChange={(open) => !open && setEditingMonitor(null)}
          onSuccess={fetchData}
          userTier={user.tier}
          monitor={editingMonitor}
        />
      )}

      {viewingLogs && (
        <MonitorLogs
          open={!!viewingLogs}
          onOpenChange={(open) => !open && setViewingLogs(null)}
          monitorId={viewingLogs.id}
          productName={viewingLogs.name}
        />
      )}
    </div>
  )
}
