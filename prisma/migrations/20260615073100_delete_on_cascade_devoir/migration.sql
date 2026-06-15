-- DropForeignKey
ALTER TABLE "rendu" DROP CONSTRAINT "rendu_id_devoir_fkey";

-- AddForeignKey
ALTER TABLE "rendu" ADD CONSTRAINT "rendu_id_devoir_fkey" FOREIGN KEY ("id_devoir") REFERENCES "devoir"("id_devoir") ON DELETE CASCADE ON UPDATE CASCADE;
