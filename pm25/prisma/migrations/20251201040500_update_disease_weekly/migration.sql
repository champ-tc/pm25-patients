/*
  Warnings:

  - You are about to drop the column `changwatname` on the `disease_weekly` table. All the data in the column will be lost.
  - You are about to drop the column `dateServ` on the `disease_weekly` table. All the data in the column will be lost.
  - You are about to drop the column `pm25` on the `disease_weekly` table. All the data in the column will be lost.
  - You are about to drop the column `rate` on the `disease_weekly` table. All the data in the column will be lost.
  - You are about to drop the column `regionalHealth` on the `disease_weekly` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."disease_weekly_changwatname_idx";

-- AlterTable
ALTER TABLE "disease_weekly" DROP COLUMN "changwatname",
DROP COLUMN "dateServ",
DROP COLUMN "pm25",
DROP COLUMN "rate",
DROP COLUMN "regionalHealth",
ADD COLUMN     "createDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "month" INTEGER,
ADD COLUMN     "provinceId" TEXT,
ADD COLUMN     "provinceName" TEXT,
ADD COLUMN     "week" INTEGER;

-- CreateIndex
CREATE INDEX "disease_weekly_provinceId_idx" ON "disease_weekly"("provinceId");
