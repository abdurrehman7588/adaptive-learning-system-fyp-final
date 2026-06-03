-- Child module: children table

CREATE TABLE "children" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "pin_hash" TEXT NOT NULL,
    "age" INTEGER,
    "date_of_birth" DATE,
    "grade_level" TEXT,
    "avatar_url" TEXT,
    "learning_preferences" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "children_username_key" ON "children"("username");
CREATE INDEX "children_parent_id_idx" ON "children"("parent_id");

ALTER TABLE "children" ADD CONSTRAINT "children_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
