/*
  Warnings:

  - A unique constraint covering the columns `[organization_id,code]` on the table `banks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "banks_organization_id_code_key" ON "banks"("organization_id", "code");
