"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  UserPlus,
  Settings,
  Search,
  Edit,
  Trash2,
  Shield,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

const userStats = [
  {
    label: "총 사용자",
    value: "1,247",
    change: "+12",
    color: "text-blue-600"
  },
  {
    label: "활성 사용자",
    value: "89",
    change: "+5",
    color: "text-green-600"
  },
  {
    label: "관리자",
    value: "8",
    change: "+1",
    color: "text-purple-600"
  },
  {
    label: "비활성 계정",
    value: "23",
    change: "-3",
    color: "text-orange-600"
  }
]

const users = [
  {
    id: 1,
    employeeId: "EMP001234",
    name: "김철수",
    email: "kim.cs@company.com",
    department: "개발팀",
    position: "팀장",
    role: "admin",
    status: "active",
    lastLogin: "5분 전",
    loginCount: 234
  },
  {
    id: 2,
    employeeId: "EMP001235",
    name: "이영희",
    email: "lee.yh@company.com",
    department: "기획팀",
    position: "대리",
    role: "user",
    status: "active",
    lastLogin: "1시간 전",
    loginCount: 156
  },
  {
    id: 3,
    employeeId: "EMP001236",
    name: "박민수",
    email: "park.ms@company.com",
    department: "개발팀",
    position: "사원",
    role: "user",
    status: "inactive",
    lastLogin: "3일 전",
    loginCount: 89
  },
  {
    id: 4,
    employeeId: "EMP001237",
    name: "최지연",
    email: "choi.jy@company.com",
    department: "마케팅팀",
    position: "과장",
    role: "moderator",
    status: "active",
    lastLogin: "30분 전",
    loginCount: 445
  }
]

function getRoleBadge(role: string) {
  switch (role) {
    case "admin":
      return <Badge className="bg-red-100 text-red-800">관리자</Badge>
    case "moderator":
      return <Badge className="bg-blue-100 text-blue-800">모더레이터</Badge>
    case "user":
      return <Badge variant="secondary">사용자</Badge>
    default:
      return <Badge variant="outline">알수없음</Badge>
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800">활성</Badge>
    case "inactive":
      return <Badge variant="secondary">비활성</Badge>
    case "suspended":
      return <Badge variant="destructive">정지</Badge>
    default:
      return <Badge variant="outline">알수없음</Badge>
  }
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    const matchesStatus = filterStatus === "all" || user.status === filterStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            시스템 사용자 계정과 권한을 관리합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            설정
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            새 사용자 추가
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {userStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{stat.label}</span>
                <span className={`text-sm font-medium ${stat.color}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/users/accounts">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <User className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-medium mb-2">계정 관리</h3>
              <p className="text-sm text-gray-500">사용자 계정 생성 및 관리</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users/permissions">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-medium mb-2">권한 관리</h3>
              <p className="text-sm text-gray-500">역할 및 접근 권한 설정</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users/analytics">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <h3 className="font-medium mb-2">활동 분석</h3>
              <p className="text-sm text-gray-500">사용자 행동 분석</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users/statistics">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-3 text-orange-600" />
              <h3 className="font-medium mb-2">통계</h3>
              <p className="text-sm text-gray-500">사용 통계 및 리포트</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="이름, 이메일, 사번 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="역할 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 역할</SelectItem>
                <SelectItem value="admin">관리자</SelectItem>
                <SelectItem value="moderator">모더레이터</SelectItem>
                <SelectItem value="user">사용자</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
                <SelectItem value="suspended">정지</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 목록 ({filteredUsers.length}명)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사용자 정보</TableHead>
                <TableHead>부서/직급</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>마지막 로그인</TableHead>
                <TableHead>로그인 횟수</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">{user.employeeId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{user.department}</div>
                      <div className="text-sm text-gray-500">{user.position}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.status === "active" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm">{user.lastLogin}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.loginCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}