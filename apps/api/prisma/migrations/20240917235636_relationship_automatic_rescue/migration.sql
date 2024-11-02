/*
  Warnings:

  - You are about to drop the column `automatic_rescue` on the `banks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "banks" DROP COLUMN "automatic_rescue",
ADD COLUMN     "automatic_rescue_id" TEXT,
ADD COLUMN     "has_automatic_rescue" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "banks" ADD CONSTRAINT "banks_automatic_rescue_id_fkey" FOREIGN KEY ("automatic_rescue_id") REFERENCES "banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
