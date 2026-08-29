-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "size" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_owner_id_created_at_idx" ON "media"("owner_id", "created_at");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
