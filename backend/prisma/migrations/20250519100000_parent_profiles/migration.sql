-- Parent module: parent_profiles

CREATE TABLE "parent_profiles" (
    "parent_id" INTEGER NOT NULL,
    "preferred_language" TEXT,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_skipped" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parent_profiles_pkey" PRIMARY KEY ("parent_id")
);

ALTER TABLE "parent_profiles" ADD CONSTRAINT "parent_profiles_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
