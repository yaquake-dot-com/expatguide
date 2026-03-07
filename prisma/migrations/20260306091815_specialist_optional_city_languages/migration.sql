-- AlterTable
ALTER TABLE "Specialist" ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY['ru']::TEXT[],
ALTER COLUMN "cityId" DROP NOT NULL;
