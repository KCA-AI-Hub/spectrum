"use client"

import React from 'react'
import { useForm, Controller, FieldValues, Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'switch'
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[]
  validation?: z.ZodType<any>
  description?: string
  className?: string
}

export interface FormSection {
  title: string
  description?: string
  fields: FormField[]
}

interface DynamicFormProps<T extends FieldValues> {
  sections: FormSection[]
  onSubmit: (data: T) => void | Promise<void>
  defaultValues?: Partial<T>
  submitLabel?: string
  isLoading?: boolean
  className?: string
}

export function DynamicForm<T extends FieldValues>({
  sections,
  onSubmit,
  defaultValues,
  submitLabel = "Submit",
  isLoading = false,
  className
}: DynamicFormProps<T>) {
  // Create schema from sections
  const schema = z.object(
    sections.reduce((acc, section) => {
      section.fields.forEach(field => {
        let fieldSchema: z.ZodType<any> = z.string()

        if (field.validation) {
          fieldSchema = field.validation
        } else {
          switch (field.type) {
            case 'email':
              fieldSchema = z.string().email()
              break
            case 'number':
              fieldSchema = z.coerce.number()
              break
            case 'checkbox':
              fieldSchema = z.boolean()
              break
            case 'switch':
              fieldSchema = z.boolean()
              break
            default:
              fieldSchema = z.string()
          }
        }

        if (!field.required) {
          fieldSchema = fieldSchema.optional()
        }

        acc[field.name] = fieldSchema
      })
      return acc
    }, {} as Record<string, z.ZodType<any>>)
  )

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues
  })

  const renderField = (field: FormField) => {
    const error = errors[field.name as Path<T>]

    return (
      <div key={field.name} className={cn("space-y-2", field.className)}>
        <Label htmlFor={field.name} className={cn(field.required && "after:content-['*'] after:text-red-500 after:ml-1")}>
          {field.label}
        </Label>

        <Controller
          name={field.name as Path<T>}
          control={control}
          render={({ field: controllerField }) => {
            switch (field.type) {
              case 'textarea':
                return (
                  <Textarea
                    {...controllerField}
                    id={field.name}
                    placeholder={field.placeholder}
                    className={cn(error && "border-red-500")}
                  />
                )

              case 'select':
                return (
                  <Select value={controllerField.value} onValueChange={controllerField.onChange}>
                    <SelectTrigger className={cn(error && "border-red-500")}>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )

              case 'checkbox':
                return (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={field.name}
                      checked={controllerField.value}
                      onCheckedChange={controllerField.onChange}
                    />
                    <Label htmlFor={field.name} className="text-sm font-normal">
                      {field.description || field.label}
                    </Label>
                  </div>
                )

              case 'radio':
                return (
                  <RadioGroup value={controllerField.value} onValueChange={controllerField.onChange}>
                    {field.options?.map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`${field.name}-${option.value}`} />
                        <Label htmlFor={`${field.name}-${option.value}`} className="text-sm font-normal">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )

              case 'switch':
                return (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={field.name}
                      checked={controllerField.value}
                      onCheckedChange={controllerField.onChange}
                    />
                    <Label htmlFor={field.name} className="text-sm font-normal">
                      {field.description || field.label}
                    </Label>
                  </div>
                )

              default:
                return (
                  <Input
                    {...controllerField}
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    className={cn(error && "border-red-500")}
                  />
                )
            }
          }}
        />

        {field.description && field.type !== 'checkbox' && field.type !== 'switch' && (
          <p className="text-sm text-muted-foreground">{field.description}</p>
        )}

        {error && (
          <p className="text-sm text-red-500">{error.message}</p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-6", className)}>
      {sections.map((section, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
            {section.description && (
              <p className="text-sm text-muted-foreground">{section.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {section.fields.map(renderField)}
          </CardContent>
        </Card>
      ))}

      <Button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full"
      >
        {isSubmitting || isLoading ? "Loading..." : submitLabel}
      </Button>
    </form>
  )
}

export function FormSection({ title, description, children }: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}

export function FieldGroup({ children, className }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  )
}