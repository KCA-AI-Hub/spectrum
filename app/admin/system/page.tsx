import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Server,
  Activity,
  Bell,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Shield
} from "lucide-react"
import Link from "next/link"

const systemHealth = [
  {
    service: "웹 서버",
    status: "healthy",
    uptime: "99.9%",
    load: 65,
    icon: Server
  },
  {
    service: "데이터베이스",
    status: "healthy",
    uptime: "99.8%",
    load: 78,
    icon: Database
  },
  {
    service: "크롤링 엔진",
    status: "warning",
    uptime: "98.5%",
    load: 89,
    icon: Activity
  },
  {
    service: "AI 처리",
    status: "healthy",
    uptime: "99.7%",
    load: 45,
    icon: Cpu
  }
]

const alerts = [
  {
    id: 1,
    type: "warning",
    title: "메모리 사용률 높음",
    description: "시스템 메모리 사용률이 85%를 초과했습니다.",
    time: "5분 전"
  },
  {
    id: 2,
    type: "info",
    title: "정기 백업 완료",
    description: "데이터베이스 정기 백업이 성공적으로 완료되었습니다.",
    time: "1시간 전"
  },
  {
    id: 3,
    type: "error",
    title: "API 연결 실패",
    description: "외부 API 연결에 실패했습니다. 재시도 중입니다.",
    time: "2시간 전"
  }
]

const systemMetrics = [
  {
    label: "CPU 사용률",
    value: 65,
    status: "normal",
    icon: Cpu
  },
  {
    label: "메모리 사용률",
    value: 78,
    status: "warning",
    icon: Server
  },
  {
    label: "디스크 사용률",
    value: 45,
    status: "normal",
    icon: HardDrive
  },
  {
    label: "네트워크 I/O",
    value: 23,
    status: "normal",
    icon: Wifi
  }
]

function getStatusColor(status: string) {
  switch (status) {
    case "healthy":
      return "text-green-600"
    case "warning":
      return "text-yellow-600"
    case "error":
      return "text-red-600"
    default:
      return "text-gray-600"
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "healthy":
      return <Badge className="bg-green-100 text-green-800">정상</Badge>
    case "warning":
      return <Badge className="bg-yellow-100 text-yellow-800">주의</Badge>
    case "error":
      return <Badge variant="destructive">오류</Badge>
    default:
      return <Badge variant="secondary">알수없음</Badge>
  }
}

function getAlertIcon(type: string) {
  switch (type) {
    case "error":
      return <AlertTriangle className="h-4 w-4 text-red-600" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    case "info":
      return <CheckCircle className="h-4 w-4 text-blue-600" />
    default:
      return <AlertTriangle className="h-4 w-4 text-gray-600" />
  }
}

export default function SystemManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">시스템 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            시스템 상태 모니터링과 설정을 관리합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            보안 설정
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            시스템 설정
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemHealth.map((service, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <service.icon className={`h-5 w-5 ${getStatusColor(service.status)}`} />
                  <span className="font-medium text-sm">{service.service}</span>
                </div>
                {getStatusBadge(service.status)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">가동률</span>
                  <span className="font-medium">{service.uptime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">부하</span>
                  <span className="font-medium">{service.load}%</span>
                </div>
                <Progress value={service.load} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/system/performance">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Activity className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-medium mb-2">성능 모니터링</h3>
              <p className="text-sm text-gray-500">시스템 성능 지표 확인</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/system/notifications">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Bell className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-medium mb-2">알림 설정</h3>
              <p className="text-sm text-gray-500">시스템 알림 규칙 관리</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/system/logs">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <h3 className="font-medium mb-2">로그 관리</h3>
              <p className="text-sm text-gray-500">시스템 로그 조회 및 분석</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/system/settings">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Settings className="h-8 w-8 mx-auto mb-3 text-orange-600" />
              <h3 className="font-medium mb-2">설정</h3>
              <p className="text-sm text-gray-500">전역 시스템 설정</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>실시간 시스템 지표</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <metric.icon className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">{metric.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{metric.value}%</span>
                      {getStatusBadge(metric.status)}
                    </div>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-3">시스템 정보</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">가동시간:</span>
                  <span className="ml-2 font-medium">15일 7시간</span>
                </div>
                <div>
                  <span className="text-gray-500">프로세스:</span>
                  <span className="ml-2 font-medium">234개</span>
                </div>
                <div>
                  <span className="text-gray-500">연결수:</span>
                  <span className="ml-2 font-medium">89개</span>
                </div>
                <div>
                  <span className="text-gray-500">로드 평균:</span>
                  <span className="ml-2 font-medium">0.65</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>시스템 알림</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{alert.title}</div>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    <span className="text-xs text-gray-500 mt-2 block">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <Button variant="ghost" size="sm">
                모든 알림 보기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}