-- CreateTable
CREATE TABLE "_PlayerRooms" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PlayerRooms_AB_unique" ON "_PlayerRooms"("A", "B");

-- CreateIndex
CREATE INDEX "_PlayerRooms_B_index" ON "_PlayerRooms"("B");

-- AddForeignKey
ALTER TABLE "_PlayerRooms" ADD CONSTRAINT "_PlayerRooms_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerRooms" ADD CONSTRAINT "_PlayerRooms_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
