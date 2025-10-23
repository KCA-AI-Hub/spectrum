'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Play,
  Pause,
  X,
  RefreshCw,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp
} from 'lucide-react'
import { VideoJob, getVideoJobQueue } from '@/lib/video/job-queue'
import { toast } from 'sonner'

export function VideoJobQueueDashboard() {
  const [jobs, setJobs] = useState<VideoJob[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    averageProcessingTime: 0
  })
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [selectedJob, setSelectedJob] = useState<string | null>(null)

  const queue = getVideoJobQueue()

  // Refresh job list
  const refreshJobs = () => {
    setJobs(queue.getAllJobs())
    setStats(queue.getStats())
  }

  // Auto-refresh every 2 seconds
  useEffect(() => {
    refreshJobs()
    const interval = setInterval(refreshJobs, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleCancelJob = async (jobId: string) => {
    try {
      await queue.cancelJob(jobId)
      toast.success('Job cancelled successfully')
      refreshJobs()
    } catch (error) {
      toast.error('Failed to cancel job')
    }
  }

  const handleRetryJob = async (jobId: string) => {
    try {
      await queue.retryJob(jobId)
      toast.success('Job retrying')
      refreshJobs()
    } catch (error) {
      toast.error('Failed to retry job')
    }
  }

  const handleClearCompleted = () => {
    queue.clearCompleted()
    toast.success('Completed jobs cleared')
    refreshJobs()
    setShowClearDialog(false)
  }

  const getStatusIcon = (status: VideoJob['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />
    }
  }

  const getStatusColor = (status: VideoJob['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
    }
  }

  const getPriorityColor = (priority: VideoJob['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-orange-100 text-orange-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Video Generation Queue</h2>
          <p className="text-muted-foreground mt-1">
            Monitor and manage parallel video generation jobs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshJobs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowClearDialog(true)}
            disabled={stats.completed === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Completed
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Loader2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Average Processing Time */}
      {stats.averageProcessingTime > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Average Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatDuration(stats.averageProcessingTime)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Jobs</CardTitle>
          <CardDescription>
            Currently processing and queued video generation jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No jobs in queue
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Video ID</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Retry</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <Badge className={getStatusColor(job.status)}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          {job.status}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityColor(job.priority)}>
                        {job.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {job.videoId.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 min-w-[120px]">
                        <Progress value={job.progress} />
                        <p className="text-xs text-muted-foreground">
                          {job.progress.toFixed(0)}%
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {job.retryCount}/{job.maxRetries}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(job.createdAt).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {job.startedAt && job.completedAt ? (
                        formatDuration(
                          new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()
                        )
                      ) : job.startedAt ? (
                        formatDuration(Date.now() - new Date(job.startedAt).getTime())
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {(job.status === 'pending' || job.status === 'processing') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelJob(job.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        {job.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRetryJob(job.id)}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Clear Completed Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Completed Jobs</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all completed jobs from the queue. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearCompleted}>
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
