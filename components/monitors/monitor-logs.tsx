'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Log } from '@/lib/types/database'

interface MonitorLogsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  monitorId: string
  productName: string
}

export function MonitorLogs({ open, onOpenChange, monitorId, productName }: MonitorLogsProps) {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const limit = 20

  useEffect(() => {
    if (open) {
      fetchLogs(0)
    } else {
      setLogs([])
      setPage(0)
      setHasMore(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, monitorId])

  const fetchLogs = async (pageNum: number) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/monitors/${monitorId}/logs?limit=${limit}&offset=${pageNum * limit}`
      )
      const data = await response.json()

      if (pageNum === 0) {
        setLogs(data.logs || [])
      } else {
        setLogs((prev) => [...prev, ...(data.logs || [])])
      }

      setHasMore((data.logs || []).length === limit)
      setPage(pageNum)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    fetchLogs(page + 1)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CHANGED':
        return <Badge variant="success">변화 감지</Badge>
      case 'UNCHANGED':
        return <Badge variant="secondary">변화 없음</Badge>
      case 'ERROR':
        return <Badge variant="destructive">오류</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{productName} - 감시 로그</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-2">
          {loading && logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              로딩 중...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              아직 로그가 없습니다
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="border rounded-lg p-3 space-y-2 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  {getStatusBadge(log.status)}
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString('ko-KR')}
                  </span>
                </div>
                <p className="text-sm">{log.message}</p>
              </div>
            ))
          )}

          {hasMore && !loading && (
            <Button
              variant="outline"
              onClick={loadMore}
              className="w-full"
            >
              더 보기
            </Button>
          )}

          {loading && logs.length > 0 && (
            <div className="text-center py-2 text-sm text-muted-foreground">
              로딩 중...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

