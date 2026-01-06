'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Monitor } from '@/lib/types/database'

interface MonitorListProps {
  monitors: Monitor[]
  onEdit: (monitor: Monitor) => void
  onDelete: (id: string) => void
  onViewLogs: (id: string) => void
}

export function MonitorList({ monitors, onEdit, onDelete, onViewLogs }: MonitorListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 모니터를 삭제하시겠습니까?')) return

    setDeleting(id)
    try {
      await onDelete(id)
    } finally {
      setDeleting(null)
    }
  }

  const getStatusBadge = (monitor: Monitor) => {
    if (!monitor.is_active) {
      return <Badge variant="outline">비활성</Badge>
    }
    if (monitor.fail_count >= 3) {
      return <Badge variant="warning">오류 발생</Badge>
    }
    return <Badge variant="success">활성</Badge>
  }

  const getModeBadge = (mode: string) => {
    return mode === 'SEMANTIC' ? (
      <Badge variant="default">AI 분석</Badge>
    ) : (
      <Badge variant="secondary">Visual</Badge>
    )
  }

  if (monitors.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            아직 등록된 모니터가 없습니다.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {monitors.map((monitor) => (
        <Card key={monitor.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">{monitor.product_name}</CardTitle>
              {getStatusBadge(monitor)}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <p className="text-muted-foreground truncate" title={monitor.url}>
                {monitor.url}
              </p>
            </div>

            {monitor.target_option && (
              <div className="text-sm">
                <span className="font-medium">옵션:</span> {monitor.target_option}
              </div>
            )}

            <div className="flex gap-2">
              {getModeBadge(monitor.mode)}
              <Badge variant="outline">{monitor.frequency}분</Badge>
            </div>

            {monitor.last_checked_at && (
              <div className="text-xs text-muted-foreground">
                마지막 체크: {new Date(monitor.last_checked_at).toLocaleString('ko-KR')}
              </div>
            )}

            {monitor.fail_count > 0 && (
              <div className="text-xs text-red-600">
                연속 실패: {monitor.fail_count}회
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewLogs(monitor.id)}
                className="flex-1"
              >
                로그
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(monitor)}
                className="flex-1"
              >
                수정
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(monitor.id)}
                disabled={deleting === monitor.id}
                className="flex-1"
              >
                삭제
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

