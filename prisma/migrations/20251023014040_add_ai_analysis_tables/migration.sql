-- CreateTable
CREATE TABLE "AIAnalysisJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "articleId" TEXT,
    "inputContent" TEXT NOT NULL,
    "result" TEXT,
    "errorMessage" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "model" TEXT NOT NULL DEFAULT 'gpt-4',
    "tokenUsage" INTEGER,
    "processingTime" REAL,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KeywordExtraction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT,
    "content" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'gpt-4',
    "tokenUsage" INTEGER,
    "confidence" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TopicClassification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT,
    "content" TEXT NOT NULL,
    "primaryTopic" TEXT NOT NULL,
    "secondaryTopics" TEXT,
    "confidence" REAL,
    "reasoning" TEXT,
    "model" TEXT NOT NULL DEFAULT 'gpt-4',
    "tokenUsage" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SentimentAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT,
    "content" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'gpt-4',
    "tokenUsage" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AIUsageLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operation" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "cost" REAL,
    "responseTime" REAL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
