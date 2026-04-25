/*
  Warnings:

  - You are about to drop the column `Turma` on the `alunos` table. All the data in the column will be lost.
  - Added the required column `turma` to the `alunos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `alunos` DROP COLUMN `Turma`,
    ADD COLUMN `turma` VARCHAR(4) NOT NULL;
