// Re-export from the main prisma file to ensure consistency
export { prisma, connectDB, disconnectDB, checkDBHealth } from './db/prisma';
