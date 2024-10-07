-- CreateTable
CREATE TABLE "RoomSettings" (
    "id" SERIAL NOT NULL,
    "language" TEXT,
    "maxTextLength" INTEGER,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "RoomSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomSettings_roomId_key" ON "RoomSettings"("roomId");

-- AddForeignKey
ALTER TABLE "RoomSettings" ADD CONSTRAINT "RoomSettings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
