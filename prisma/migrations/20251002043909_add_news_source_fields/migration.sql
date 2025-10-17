-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CrawlTarget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'news',
    "category" TEXT NOT NULL DEFAULT '미분류',
    "description" TEXT,
    "selector" TEXT,
    "headers" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "itemsCollected" INTEGER NOT NULL DEFAULT 0,
    "successRate" REAL NOT NULL DEFAULT 0,
    "lastCrawl" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CrawlTarget" ("createdAt", "id", "isActive", "name", "selector", "updatedAt", "url") SELECT "createdAt", "id", "isActive", "name", "selector", "updatedAt", "url" FROM "CrawlTarget";
DROP TABLE "CrawlTarget";
ALTER TABLE "new_CrawlTarget" RENAME TO "CrawlTarget";
CREATE UNIQUE INDEX "CrawlTarget_url_key" ON "CrawlTarget"("url");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
