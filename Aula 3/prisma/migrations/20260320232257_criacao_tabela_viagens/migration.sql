/*
  Warnings:

  - Added the required column `localSaida` to the `viagens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `viagens` ADD COLUMN `localSaida` VARCHAR(200) NOT NULL;
