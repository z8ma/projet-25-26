-- AlterTable
ALTER TABLE "portfolios" ADD COLUMN     "ai_analysis" JSONB,
ADD COLUMN     "client_type" TEXT,
ADD COLUMN     "image_embedding" TEXT,
ADD COLUMN     "project_duration" TEXT,
ADD COLUMN     "project_goal" TEXT,
ADD COLUMN     "project_impact" TEXT,
ADD COLUMN     "project_year" INTEGER,
ADD COLUMN     "role_description" TEXT;

-- AlterTable
ALTER TABLE "professionals" ADD COLUMN     "exclusions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "last_ai_analysis" TIMESTAMP(3),
ADD COLUMN     "minimum_budget" DECIMAL(65,30),
ADD COLUMN     "mission_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "other_mission_type" TEXT,
ADD COLUMN     "preferred_client_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "preferred_collab_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "profile_completeness" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "profile_embedding" TEXT;

-- AlterTable
ALTER TABLE "software_skills" ADD COLUMN     "years_of_use" INTEGER;

-- CreateIndex
CREATE INDEX "portfolios_client_type_idx" ON "portfolios"("client_type");

-- CreateIndex
CREATE INDEX "professionals_mission_types_idx" ON "professionals"("mission_types");

-- CreateIndex
CREATE INDEX "professionals_profile_completeness_idx" ON "professionals"("profile_completeness");

-- CreateIndex
CREATE INDEX "software_skills_proficiency_level_idx" ON "software_skills"("proficiency_level");
