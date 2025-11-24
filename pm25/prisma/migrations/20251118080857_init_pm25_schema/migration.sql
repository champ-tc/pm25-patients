/*
  Warnings:

  - You are about to drop the `pm25_cumulative` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "disease_weekly" ALTER COLUMN "dateServ" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "pm25_daily" ALTER COLUMN "date" SET DATA TYPE DATE;

-- DropTable
DROP TABLE "public"."pm25_cumulative";

-- CreateTable
CREATE TABLE "pm25_hourly" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "hour" INTEGER NOT NULL,
    "stationIdNew" TEXT,
    "stationName" TEXT,
    "stationType" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "province" TEXT,
    "district" TEXT,
    "subdistrict" TEXT,
    "pm25" DOUBLE PRECISION,
    "pm10" DOUBLE PRECISION,
    "o3" DOUBLE PRECISION,
    "co" DOUBLE PRECISION,
    "no2" DOUBLE PRECISION,
    "so2" DOUBLE PRECISION,

    CONSTRAINT "pm25_hourly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm25_cumulative37" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "province" TEXT NOT NULL,
    "pm25" DOUBLE PRECISION NOT NULL,
    "aboveThreshold" BOOLEAN NOT NULL,
    "consecutiveDays" INTEGER NOT NULL,
    "consecutiveAboveMinDays" INTEGER NOT NULL,
    "regionalHealth" TEXT,

    CONSTRAINT "pm25_cumulative37_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm25_cumulative75" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "province" TEXT NOT NULL,
    "pm25" DOUBLE PRECISION NOT NULL,
    "aboveThreshold" BOOLEAN NOT NULL,
    "consecutiveDays" INTEGER NOT NULL,
    "consecutiveAboveMinDays" INTEGER NOT NULL,
    "regionalHealth" TEXT,

    CONSTRAINT "pm25_cumulative75_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" SERIAL NOT NULL,
    "date_serv" DATE NOT NULL,
    "odpc" TEXT,
    "changwatname" TEXT,
    "ampurname" TEXT,
    "tambonname" TEXT,
    "hospcode" TEXT,
    "hosname" TEXT,
    "sex" TEXT,
    "birth" DATE,
    "age" INTEGER,
    "nation" TEXT,
    "occupation" TEXT,
    "typearea" TEXT,
    "diagcode" TEXT,
    "diagtype" TEXT,
    "diagname" TEXT,
    "typediag" TEXT,
    "create_date" TIMESTAMP(3),

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pm25_hourly_date_idx" ON "pm25_hourly"("date");

-- CreateIndex
CREATE INDEX "pm25_hourly_province_idx" ON "pm25_hourly"("province");

-- CreateIndex
CREATE INDEX "pm25_hourly_stationIdNew_idx" ON "pm25_hourly"("stationIdNew");

-- CreateIndex
CREATE INDEX "pm25_cumulative37_date_idx" ON "pm25_cumulative37"("date");

-- CreateIndex
CREATE INDEX "pm25_cumulative37_province_idx" ON "pm25_cumulative37"("province");

-- CreateIndex
CREATE INDEX "pm25_cumulative75_date_idx" ON "pm25_cumulative75"("date");

-- CreateIndex
CREATE INDEX "pm25_cumulative75_province_idx" ON "pm25_cumulative75"("province");

-- CreateIndex
CREATE INDEX "patients_date_serv_idx" ON "patients"("date_serv");

-- CreateIndex
CREATE INDEX "patients_hospcode_idx" ON "patients"("hospcode");
