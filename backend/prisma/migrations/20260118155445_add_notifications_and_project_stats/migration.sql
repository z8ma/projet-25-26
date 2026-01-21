-- CreateEnum
CREATE TYPE "project_status" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('NEW_MATCH', 'PROJECT_UPDATE', 'MESSAGE_RECEIVED', 'RATING_RECEIVED');

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "project_status" "project_status" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "started_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "professionals" ADD COLUMN     "average_rating" DECIMAL(65,30),
ADD COLUMN     "projects_completed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "projects_in_progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "response_rate" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "total_ratings" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "type" "notification_type" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "match_id" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_professional_id_idx" ON "notifications"("professional_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "matches_project_status_idx" ON "matches"("project_status");

-- CreateIndex
CREATE INDEX "professionals_average_rating_idx" ON "professionals"("average_rating");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
