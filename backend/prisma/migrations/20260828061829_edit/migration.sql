/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `PasswordResetToken` table. All the data in the column will be lost.
  - You are about to drop the column `tokenHash` on the `PasswordResetToken` table. All the data in the column will be lost.
  - You are about to drop the column `usedAt` on the `PasswordResetToken` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `PasswordResetToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token_hash]` on the table `PasswordResetToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expires_at` to the `PasswordResetToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_hash` to the `PasswordResetToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `PasswordResetToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_userId_fkey";

-- DropIndex
DROP INDEX "PasswordResetToken_tokenHash_key";

-- DropIndex
DROP INDEX "PasswordResetToken_userId_idx";

-- AlterTable
ALTER TABLE "PasswordResetToken" DROP COLUMN "expiresAt",
DROP COLUMN "tokenHash",
DROP COLUMN "usedAt",
DROP COLUMN "userId",
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "token_hash" TEXT NOT NULL,
ADD COLUMN     "used_at" TIMESTAMP(3),
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_hash_key" ON "PasswordResetToken"("token_hash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_user_id_idx" ON "PasswordResetToken"("user_id");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
