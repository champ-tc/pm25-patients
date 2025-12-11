/*
  Warnings:

  - You are about to drop the column `createdAt` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `createDate` on the `disease_weekly` table. All the data in the column will be lost.
  - You are about to drop the column `provinceId` on the `disease_weekly` table. All the data in the column will be lost.
  - You are about to drop the column `provinceName` on the `disease_weekly` table. All the data in the column will be lost.
  - You are about to drop the column `typeDiag` on the `disease_weekly` table. All the data in the column will be lost.
  - You are about to drop the column `provinceCode` on the `midyear_population` table. All the data in the column will be lost.
  - You are about to drop the column `provinceName` on the `midyear_population` table. All the data in the column will be lost.
  - You are about to drop the column `aboveThreshold` on the `pm25_cumulative37` table. All the data in the column will be lost.
  - You are about to drop the column `consecutiveAboveMinDays` on the `pm25_cumulative37` table. All the data in the column will be lost.
  - You are about to drop the column `consecutiveDays` on the `pm25_cumulative37` table. All the data in the column will be lost.
  - You are about to drop the column `regionalHealth` on the `pm25_cumulative37` table. All the data in the column will be lost.
  - You are about to drop the column `aboveThreshold` on the `pm25_cumulative75` table. All the data in the column will be lost.
  - You are about to drop the column `consecutiveAboveMinDays` on the `pm25_cumulative75` table. All the data in the column will be lost.
  - You are about to drop the column `consecutiveDays` on the `pm25_cumulative75` table. All the data in the column will be lost.
  - You are about to drop the column `regionalHealth` on the `pm25_cumulative75` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `pm25_daily` table. All the data in the column will be lost.
  - You are about to drop the column `pm25` on the `pm25_daily` table. All the data in the column will be lost.
  - You are about to drop the column `regionalHealth` on the `pm25_daily` table. All the data in the column will be lost.
  - You are about to drop the column `stationIdNew` on the `pm25_daily` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `pm25_hourly` table. All the data in the column will be lost.
  - You are about to drop the column `hour` on the `pm25_hourly` table. All the data in the column will be lost.
  - You are about to drop the column `stationIdNew` on the `pm25_hourly` table. All the data in the column will be lost.
  - You are about to drop the column `stationName` on the `pm25_hourly` table. All the data in the column will be lost.
  - You are about to drop the column `stationType` on the `pm25_hourly` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[station_id_new,air4_date]` on the table `pm25_daily` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[station_id_new,air4_time]` on the table `pm25_hourly` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province_code` to the `midyear_population` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province_name` to the `midyear_population` table without a default value. This is not possible if the table is not empty.
  - Added the required column `above_threshold` to the `pm25_cumulative37` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consecutive_above_min_days` to the `pm25_cumulative37` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consecutive_days` to the `pm25_cumulative37` table without a default value. This is not possible if the table is not empty.
  - Added the required column `above_threshold` to the `pm25_cumulative75` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consecutive_above_min_days` to the `pm25_cumulative75` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consecutive_days` to the `pm25_cumulative75` table without a default value. This is not possible if the table is not empty.
  - Added the required column `air4_date` to the `pm25_daily` table without a default value. This is not possible if the table is not empty.
  - Added the required column `air4_time` to the `pm25_hourly` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."disease_weekly_provinceId_idx";

-- DropIndex
DROP INDEX "public"."midyear_population_provinceCode_idx";

-- DropIndex
DROP INDEX "public"."pm25_daily_date_idx";

-- DropIndex
DROP INDEX "public"."pm25_daily_province_idx";

-- DropIndex
DROP INDEX "public"."pm25_hourly_date_idx";

-- DropIndex
DROP INDEX "public"."pm25_hourly_province_idx";

-- DropIndex
DROP INDEX "public"."pm25_hourly_stationIdNew_idx";

-- AlterTable
ALTER TABLE "admin" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "disease_weekly" DROP COLUMN "createDate",
DROP COLUMN "provinceId",
DROP COLUMN "provinceName",
DROP COLUMN "typeDiag",
ADD COLUMN     "create_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "province_id" TEXT,
ADD COLUMN     "province_name" TEXT,
ADD COLUMN     "type_diag" TEXT;

-- AlterTable
ALTER TABLE "midyear_population" DROP COLUMN "provinceCode",
DROP COLUMN "provinceName",
ADD COLUMN     "province_code" TEXT NOT NULL,
ADD COLUMN     "province_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "pm25_cumulative37" DROP COLUMN "aboveThreshold",
DROP COLUMN "consecutiveAboveMinDays",
DROP COLUMN "consecutiveDays",
DROP COLUMN "regionalHealth",
ADD COLUMN     "above_threshold" BOOLEAN NOT NULL,
ADD COLUMN     "consecutive_above_min_days" INTEGER NOT NULL,
ADD COLUMN     "consecutive_days" INTEGER NOT NULL,
ADD COLUMN     "regional_health" TEXT;

-- AlterTable
ALTER TABLE "pm25_cumulative75" DROP COLUMN "aboveThreshold",
DROP COLUMN "consecutiveAboveMinDays",
DROP COLUMN "consecutiveDays",
DROP COLUMN "regionalHealth",
ADD COLUMN     "above_threshold" BOOLEAN NOT NULL,
ADD COLUMN     "consecutive_above_min_days" INTEGER NOT NULL,
ADD COLUMN     "consecutive_days" INTEGER NOT NULL,
ADD COLUMN     "regional_health" TEXT;

-- AlterTable
ALTER TABLE "pm25_daily" DROP COLUMN "date",
DROP COLUMN "pm25",
DROP COLUMN "regionalHealth",
DROP COLUMN "stationIdNew",
ADD COLUMN     "air4_date" DATE NOT NULL,
ADD COLUMN     "co_avg" DOUBLE PRECISION,
ADD COLUMN     "co_max" DOUBLE PRECISION,
ADD COLUMN     "co_min" DOUBLE PRECISION,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "no2_avg" DOUBLE PRECISION,
ADD COLUMN     "no2_max" DOUBLE PRECISION,
ADD COLUMN     "no2_min" DOUBLE PRECISION,
ADD COLUMN     "o3_avg" DOUBLE PRECISION,
ADD COLUMN     "o3_max" DOUBLE PRECISION,
ADD COLUMN     "o3_min" DOUBLE PRECISION,
ADD COLUMN     "pm10_avg" DOUBLE PRECISION,
ADD COLUMN     "pm10_max" DOUBLE PRECISION,
ADD COLUMN     "pm10_min" DOUBLE PRECISION,
ADD COLUMN     "pm25_avg" DOUBLE PRECISION,
ADD COLUMN     "pm25_max" DOUBLE PRECISION,
ADD COLUMN     "pm25_min" DOUBLE PRECISION,
ADD COLUMN     "so2_avg" DOUBLE PRECISION,
ADD COLUMN     "so2_max" DOUBLE PRECISION,
ADD COLUMN     "so2_min" DOUBLE PRECISION,
ADD COLUMN     "station_id" TEXT,
ADD COLUMN     "station_id_new" TEXT,
ADD COLUMN     "station_name" TEXT,
ADD COLUMN     "station_type" TEXT;

-- AlterTable
ALTER TABLE "pm25_hourly" DROP COLUMN "date",
DROP COLUMN "hour",
DROP COLUMN "stationIdNew",
DROP COLUMN "stationName",
DROP COLUMN "stationType",
ADD COLUMN     "air4_time" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "station_id" TEXT,
ADD COLUMN     "station_id_new" TEXT,
ADD COLUMN     "station_name" TEXT,
ADD COLUMN     "station_type" TEXT;

-- CreateIndex
CREATE INDEX "disease_weekly_province_id_idx" ON "disease_weekly"("province_id");

-- CreateIndex
CREATE INDEX "midyear_population_province_code_idx" ON "midyear_population"("province_code");

-- CreateIndex
CREATE INDEX "pm25_daily_station_id_new_idx" ON "pm25_daily"("station_id_new");

-- CreateIndex
CREATE INDEX "pm25_daily_air4_date_idx" ON "pm25_daily"("air4_date");

-- CreateIndex
CREATE UNIQUE INDEX "pm25_daily_station_id_new_air4_date_key" ON "pm25_daily"("station_id_new", "air4_date");

-- CreateIndex
CREATE INDEX "pm25_hourly_station_id_new_idx" ON "pm25_hourly"("station_id_new");

-- CreateIndex
CREATE INDEX "pm25_hourly_air4_time_idx" ON "pm25_hourly"("air4_time");

-- CreateIndex
CREATE UNIQUE INDEX "pm25_hourly_station_id_new_air4_time_key" ON "pm25_hourly"("station_id_new", "air4_time");
