-- CreateTable
CREATE TABLE "stations" (
    "id" SERIAL NOT NULL,
    "station_id" TEXT,
    "station_id_new" TEXT,
    "station_name" TEXT,
    "station_type" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "province" TEXT,
    "district" TEXT,
    "subdistrict" TEXT,

    CONSTRAINT "stations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stations_station_id_idx" ON "stations"("station_id");

-- CreateIndex
CREATE INDEX "stations_station_id_new_idx" ON "stations"("station_id_new");

-- CreateIndex
CREATE INDEX "stations_province_idx" ON "stations"("province");
