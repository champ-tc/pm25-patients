-- CreateEnum
CREATE TYPE "Role" AS ENUM ('administrator', 'superadmin', 'admin', 'region', 'province', 'unit');

-- CreateTable
CREATE TABLE "admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "pname" TEXT,
    "fname" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "hospcode" TEXT,
    "position" TEXT,
    "positionLv" TEXT,
    "tel" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospcode" (
    "hospcode" TEXT NOT NULL,
    "hospcode_old" TEXT,
    "name_th" TEXT,
    "type" TEXT,
    "type_organizations" TEXT,
    "organizations" TEXT,
    "county" TEXT,
    "province_id" TEXT,
    "province" TEXT,
    "amphure_id" TEXT,
    "amphure" TEXT,
    "districts_id" TEXT,
    "districts" TEXT,

    CONSTRAINT "hospcode_pkey" PRIMARY KEY ("hospcode")
);

-- CreateTable
CREATE TABLE "midyear_population" (
    "id" SERIAL NOT NULL,
    "provinceCode" TEXT NOT NULL,
    "provinceName" TEXT NOT NULL,
    "population" INTEGER NOT NULL,

    CONSTRAINT "midyear_population_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm25_daily" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "stationIdNew" TEXT,
    "province" TEXT,
    "district" TEXT,
    "subdistrict" TEXT,
    "pm25" DOUBLE PRECISION,
    "regionalHealth" TEXT,

    CONSTRAINT "pm25_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disease_weekly" (
    "id" SERIAL NOT NULL,
    "dateServ" TIMESTAMP(3) NOT NULL,
    "changwatname" TEXT,
    "typeDiag" TEXT,
    "regionalHealth" TEXT,
    "cases" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "pm25" DOUBLE PRECISION,
    "rate" DOUBLE PRECISION,

    CONSTRAINT "disease_weekly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pm25_cumulative" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "province" TEXT NOT NULL,
    "pm25" DOUBLE PRECISION NOT NULL,
    "aboveThreshold" BOOLEAN NOT NULL,
    "consecutiveDays" INTEGER NOT NULL,
    "consecutiveAboveMinDays" INTEGER NOT NULL,
    "regionalHealth" TEXT,

    CONSTRAINT "pm25_cumulative_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_username_key" ON "admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE INDEX "admin_hospcode_idx" ON "admin"("hospcode");

-- CreateIndex
CREATE INDEX "hospcode_province_idx" ON "hospcode"("province");

-- CreateIndex
CREATE INDEX "hospcode_amphure_idx" ON "hospcode"("amphure");

-- CreateIndex
CREATE INDEX "hospcode_districts_idx" ON "hospcode"("districts");

-- CreateIndex
CREATE INDEX "midyear_population_provinceCode_idx" ON "midyear_population"("provinceCode");

-- CreateIndex
CREATE INDEX "pm25_daily_date_idx" ON "pm25_daily"("date");

-- CreateIndex
CREATE INDEX "pm25_daily_province_idx" ON "pm25_daily"("province");

-- CreateIndex
CREATE INDEX "disease_weekly_year_idx" ON "disease_weekly"("year");

-- CreateIndex
CREATE INDEX "disease_weekly_changwatname_idx" ON "disease_weekly"("changwatname");

-- CreateIndex
CREATE INDEX "pm25_cumulative_date_idx" ON "pm25_cumulative"("date");

-- CreateIndex
CREATE INDEX "pm25_cumulative_province_idx" ON "pm25_cumulative"("province");

-- AddForeignKey
ALTER TABLE "admin" ADD CONSTRAINT "admin_hospcode_fkey" FOREIGN KEY ("hospcode") REFERENCES "hospcode"("hospcode") ON DELETE SET NULL ON UPDATE CASCADE;
