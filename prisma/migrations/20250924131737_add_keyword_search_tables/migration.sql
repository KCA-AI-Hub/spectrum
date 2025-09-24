-- AlterTable
ALTER TABLE "Article" ADD COLUMN "keywordTags" TEXT;
ALTER TABLE "Article" ADD COLUMN "relevanceScore" REAL;
ALTER TABLE "Article" ADD COLUMN "searchRank" INTEGER;

-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keyword" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keywordId" TEXT,
    "searchQuery" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "searchTime" REAL,
    "filters" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchHistory_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searchHistoryId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "relevanceScore" REAL NOT NULL DEFAULT 0,
    "searchRank" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchResult_searchHistoryId_fkey" FOREIGN KEY ("searchHistoryId") REFERENCES "SearchHistory" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SearchResult_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_keyword_key" ON "Keyword"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "SearchResult_searchHistoryId_articleId_key" ON "SearchResult"("searchHistoryId", "articleId");
