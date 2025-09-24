"use client"

import { useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { ArrowUpDown, ExternalLink, Star, MoreHorizontal } from "lucide-react"

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type SearchResult = {
  id: string
  title: string
  source: string
  publishedAt: string
  relevanceScore: number
  category: string
  summary: string
  url: string
  isFavorite: boolean
  tags: string[]
}

// Mock data for demonstration
const mockData: SearchResult[] = [
  {
    id: "1",
    title: "AI 기술의 최신 동향과 미래 전망",
    source: "네이버 뉴스",
    publishedAt: "2024-01-15",
    relevanceScore: 95,
    category: "IT/과학",
    summary: "인공지능 기술이 빠르게 발전하면서 다양한 산업 분야에서의 활용이 확대되고 있습니다...",
    url: "https://example.com/news/1",
    isFavorite: false,
    tags: ["인공지능", "기술동향", "미래전망"]
  },
  {
    id: "2",
    title: "블록체인 기반 핀테크 서비스 급성장",
    source: "구글 뉴스",
    publishedAt: "2024-01-14",
    relevanceScore: 87,
    category: "경제",
    summary: "블록체인 기술을 활용한 금융 서비스들이 시장에서 주목받고 있습니다...",
    url: "https://example.com/news/2",
    isFavorite: true,
    tags: ["블록체인", "핀테크", "금융서비스"]
  },
  {
    id: "3",
    title: "메타버스 플랫폼 이용자 수 급증",
    source: "다음 뉴스",
    publishedAt: "2024-01-13",
    relevanceScore: 82,
    category: "IT/과학",
    summary: "가상현실 기반 메타버스 플랫폼들의 사용자가 크게 늘어나고 있습니다...",
    url: "https://example.com/news/3",
    isFavorite: false,
    tags: ["메타버스", "가상현실", "플랫폼"]
  },
]

interface SearchResultsTableProps {
  searchQuery: string
  onRowClick?: (result: SearchResult) => void
}

export function SearchResultsTable({ searchQuery, onRowClick }: SearchResultsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const columns: ColumnDef<SearchResult>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          제목
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const result = row.original
        return (
          <div className="space-y-1">
            <div
              className="font-medium cursor-pointer hover:text-primary line-clamp-2"
              onClick={() => onRowClick?.(result)}
            >
              {result.title}
            </div>
            <div className="text-sm text-muted-foreground line-clamp-2">
              {result.summary}
            </div>
            <div className="flex flex-wrap gap-1">
              {result.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "source",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          출처
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("source")}</Badge>
      ),
    },
    {
      accessorKey: "category",
      header: "카테고리",
      cell: ({ row }) => (
        <Badge>{row.getValue("category")}</Badge>
      ),
    },
    {
      accessorKey: "publishedAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          발행일
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("publishedAt"))
        return date.toLocaleDateString("ko-KR")
      },
    },
    {
      accessorKey: "relevanceScore",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          관련도
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const score = row.getValue("relevanceScore") as number
        return (
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${score}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{score}%</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const result = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">메뉴 열기</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>작업</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onRowClick?.(result)}>
                상세 보기
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className="mr-2 h-4 w-4" />
                {result.isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <ExternalLink className="mr-2 h-4 w-4" />
                원문 보기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: mockData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="결과 내 검색..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="max-w-sm"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          총 {table.getFilteredRowModel().rows.length}개의 결과
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} / {" "}
          {table.getFilteredRowModel().rows.length} 개 항목
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            이전
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  )
}