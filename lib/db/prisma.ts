import { PrismaClient } from '@prisma/client'

// Prisma 클라이언트 인스턴스를 전역적으로 관리
declare global {
  var __prisma: PrismaClient | undefined
}

// PrismaClient 싱글톤 인스턴스
export const prisma = globalThis.__prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// 데이터베이스 연결 헬퍼 함수들
export async function connectDB() {
  try {
    await prisma.$connect()
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Database connection failed:', error)
    throw error
  }
}

export async function disconnectDB() {
  try {
    await prisma.$disconnect()
    console.log('Database disconnected successfully')
  } catch (error) {
    console.error('Database disconnection failed:', error)
    throw error
  }
}

// 데이터베이스 헬스 체크
export async function checkDBHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', message: 'Database is accessible' }
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown database error'
    }
  }
}