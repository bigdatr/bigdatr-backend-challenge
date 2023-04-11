
ALTER DATABASE dataentry_app SET timezone TO 'UTC';
ALTER DATABASE tests SET timezone TO 'UTC';

DROP TABLE IF EXISTS "releases";

CREATE TABLE "releases" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "releases_pkey" PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "builds";
CREATE TABLE "builds" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "requires_review" BOOLEAN NOT NULL DEFAULT false,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "builds_pkey" PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "release_selections";
CREATE TABLE "release_selections" (
    "id" SERIAL NOT NULL,
    "build_id" INTEGER NOT NULL,
    "release_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "release_selections_pkey" PRIMARY KEY ("id")
);
