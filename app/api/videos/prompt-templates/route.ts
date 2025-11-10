import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')

    const where: any = {}

    if (category) {
      where.category = category
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const templates = await prisma.videoPromptTemplate.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Parse JSON fields
    const parsedTemplates = templates.map(template => ({
      ...template,
      variables: JSON.parse(template.variables)
    }))

    return NextResponse.json({
      success: true,
      data: parsedTemplates
    })

  } catch (error) {
    console.error('Error fetching prompt templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompt templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name,
      description,
      category,
      systemPrompt,
      userPromptTemplate,
      variables,
      exampleOutput
    } = body

    // 입력 검증
    if (!name || !systemPrompt || !userPromptTemplate || !variables) {
      return NextResponse.json(
        { error: 'name, systemPrompt, userPromptTemplate, and variables are required' },
        { status: 400 }
      )
    }

    const template = await prisma.videoPromptTemplate.create({
      data: {
        name,
        description,
        category: category || 'General',
        systemPrompt,
        userPromptTemplate,
        variables: JSON.stringify(variables),
        exampleOutput
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...template,
        variables: JSON.parse(template.variables)
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating prompt template:', error)
    return NextResponse.json(
      { error: 'Failed to create prompt template' },
      { status: 500 }
    )
  }
}
