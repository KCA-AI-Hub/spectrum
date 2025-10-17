import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    const keyword = await prisma.keyword.update({
      where: { id },
      data: {
        isFavorite: data.isFavorite,
        description: data.description,
        category: data.category
      }
    });

    return NextResponse.json({ success: true, keyword });

  } catch (error) {
    console.error('Update keyword error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update keyword' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    await prisma.keyword.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete keyword error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete keyword' },
      { status: 500 }
    );
  }
}
