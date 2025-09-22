"use client"

import React, { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, X, Calendar as CalendarIcon, Save, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export interface FilterOption {
  key: string
  label: string
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number'
  options?: { label: string; value: string }[]
  placeholder?: string
}

export interface ActiveFilter {
  key: string
  value: any
  label: string
  displayValue: string
}

export interface SavedFilter {
  id: string
  name: string
  filters: Record<string, any>
}

interface SearchFilterProps {
  searchPlaceholder?: string
  filterOptions?: FilterOption[]
  onSearch?: (query: string) => void
  onFiltersChange?: (filters: Record<string, any>) => void
  savedFilters?: SavedFilter[]
  onSaveFilter?: (name: string, filters: Record<string, any>) => void
  onLoadFilter?: (filter: SavedFilter) => void
  onDeleteFilter?: (filterId: string) => void
  className?: string
}

export function SearchFilter({
  searchPlaceholder = "Search...",
  filterOptions = [],
  onSearch,
  onFiltersChange,
  savedFilters = [],
  onSaveFilter,
  onLoadFilter,
  onDeleteFilter,
  className
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [saveFilterName, setSaveFilterName] = useState("")

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }, [onSearch])

  const handleFilterChange = useCallback((key: string, value: any) => {
    const newFilters = { ...filters }

    if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }

    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }, [filters, onFiltersChange])

  const clearFilter = useCallback((key: string) => {
    handleFilterChange(key, undefined)
  }, [handleFilterChange])

  const clearAllFilters = useCallback(() => {
    setFilters({})
    onFiltersChange?.({})
  }, [onFiltersChange])

  const getActiveFilters = (): ActiveFilter[] => {
    return Object.entries(filters).map(([key, value]) => {
      const option = filterOptions.find(opt => opt.key === key)
      if (!option) return null

      let displayValue = ""

      switch (option.type) {
        case 'select':
          const selectedOption = option.options?.find(opt => opt.value === value)
          displayValue = selectedOption?.label || value
          break
        case 'multiselect':
          if (Array.isArray(value)) {
            const selectedLabels = value.map(v =>
              option.options?.find(opt => opt.value === v)?.label || v
            )
            displayValue = selectedLabels.join(', ')
          }
          break
        case 'date':
          displayValue = value instanceof Date ? format(value, 'MMM dd, yyyy') : value
          break
        case 'daterange':
          if (value.from && value.to) {
            displayValue = `${format(value.from, 'MMM dd')} - ${format(value.to, 'MMM dd, yyyy')}`
          } else if (value.from) {
            displayValue = `From ${format(value.from, 'MMM dd, yyyy')}`
          }
          break
        default:
          displayValue = String(value)
      }

      return {
        key,
        value,
        label: option.label,
        displayValue
      }
    }).filter(Boolean) as ActiveFilter[]
  }

  const saveCurrentFilter = () => {
    if (saveFilterName.trim() && onSaveFilter) {
      onSaveFilter(saveFilterName.trim(), filters)
      setSaveFilterName("")
    }
  }

  const renderFilterInput = (option: FilterOption) => {
    const value = filters[option.key]

    switch (option.type) {
      case 'select':
        return (
          <Select value={value || ""} onValueChange={(val) => handleFilterChange(option.key, val)}>
            <SelectTrigger>
              <SelectValue placeholder={option.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {option.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            {option.options?.map(opt => (
              <div key={opt.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${option.key}-${opt.value}`}
                  checked={Array.isArray(value) && value.includes(opt.value)}
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(value) ? value : []
                    if (checked) {
                      handleFilterChange(option.key, [...currentValues, opt.value])
                    } else {
                      handleFilterChange(option.key, currentValues.filter(v => v !== opt.value))
                    }
                  }}
                />
                <Label htmlFor={`${option.key}-${opt.value}`} className="text-sm">
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>
        )

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(value, 'PPP') : option.placeholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value}
                onSelect={(date) => handleFilterChange(option.key, date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )

      case 'number':
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => handleFilterChange(option.key, e.target.value ? Number(e.target.value) : undefined)}
            placeholder={option.placeholder}
          />
        )

      default:
        return (
          <Input
            value={value || ""}
            onChange={(e) => handleFilterChange(option.key, e.target.value)}
            placeholder={option.placeholder}
          />
        )
    }
  }

  const activeFilters = getActiveFilters()

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10"
          />
        </div>

        {filterOptions.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(showAdvanced && "bg-muted")}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map(filter => (
            <Badge key={filter.key} variant="secondary" className="gap-1">
              <span className="font-medium">{filter.label}:</span>
              <span>{filter.displayValue}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => clearFilter(filter.key)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvanced && filterOptions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowAdvanced(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterOptions.map(option => (
                <div key={option.key} className="space-y-2">
                  <Label className="text-sm font-medium">{option.label}</Label>
                  {renderFilterInput(option)}
                </div>
              ))}
            </div>

            {/* Saved Filters */}
            {(savedFilters.length > 0 || onSaveFilter) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Saved Filters</Label>

                  {onSaveFilter && (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={saveFilterName}
                        onChange={(e) => setSaveFilterName(e.target.value)}
                        placeholder="Filter name..."
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={saveCurrentFilter}
                        disabled={!saveFilterName.trim() || Object.keys(filters).length === 0}
                      >
                        <Save className="mr-1 h-3 w-3" />
                        Save
                      </Button>
                    </div>
                  )}

                  {savedFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {savedFilters.map(savedFilter => (
                        <div key={savedFilter.id} className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onLoadFilter?.(savedFilter)}
                          >
                            {savedFilter.name}
                          </Button>
                          {onDeleteFilter && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteFilter(savedFilter.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}