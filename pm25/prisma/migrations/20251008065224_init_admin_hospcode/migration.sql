-- CreateEnum
CREATE TYPE "Role" AS ENUM ('administrator', 'superadmin', 'admin', 'region', 'province', 'unit');

-- CreateTable
CREATE TABLE "Admin" (
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

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hospcode" (
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
    "zip_code" TEXT,

    CONSTRAINT "Hospcode_pkey" PRIMARY KEY ("hospcode")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_hospcode_idx" ON "Admin"("hospcode");

-- CreateIndex
CREATE INDEX "Hospcode_province_idx" ON "Hospcode"("province");

-- CreateIndex
CREATE INDEX "Hospcode_amphure_idx" ON "Hospcode"("amphure");

-- CreateIndex
CREATE INDEX "Hospcode_districts_idx" ON "Hospcode"("districts");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_hospcode_fkey" FOREIGN KEY ("hospcode") REFERENCES "Hospcode"("hospcode") ON DELETE SET NULL ON UPDATE CASCADE;
